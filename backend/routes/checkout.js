const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { enviarMailConfirmacion } = require('../services/mailer');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL) });

async function procesarCheckout(req, res) {
    try {
        const { hotelId, nombre_completo, gmail, cantidad_huespedes, llegada, salida } = req.body;

        console.log("Datos recibidos:", req.body);

        // 1. Buscar hotel real en la BD
        console.log("1 - Datos recibidos");
        const hotel = await prisma.hotel.findUnique({
            where: { id: Number(hotelId) }
        });

        if (!hotel || !hotel.precio) {
            return res.status(404).json({ error: "Alojamiento no encontrado o sin precio asignado." });
        }

        // 2. Calcular noches y total en ARS
        console.log("2 - Hotel encontrado", hotel?.nombre);
        const fechaLlegada = new Date(llegada);
        const fechaSalida  = new Date(salida);
        const noches = Math.round((fechaSalida - fechaLlegada) / (1000 * 60 * 60 * 24));

        if (noches <= 0) {
            return res.status(400).json({ error: "Las fechas de reserva no son válidas." });
        }

        const precioTotal = hotel.precio * noches; // ARS, precio por noche * cantidad de noches

        // 3. Guardar reserva en la BD
        /*await prisma.formulario.create({
            data: {
                hotelId: Number(hotelId),
                nombre_completo,
                gmail,
                cantidad_huespedes: Number(cantidad_huespedes),
                llegada: new Date(llegada),
                salida: new Date(salida),
            }
        });*/

        // 4. Crear sesión de pago en Stripe (ARS)
        console.log("3 - Session Stripe creada");
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'ars',
                    product_data: {
                        name: `${hotel.nombre} — ${noches} noche${noches > 1 ? 's' : ''}`,
                    },
                    unit_amount: precioTotal * 100, // Stripe trabaja en centavos
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'http://localhost:3000/success.html',
            cancel_url:  'http://localhost:3000/cancel.html',
        });

        // 5. Mandar mail con el link de Stripe
        console.log("4 - Mail enviado");
        await enviarMailConfirmacion({
            nombre_completo,
            gmail,
            hotel,
            llegada,
            salida,
            noches,
            cantidad_huespedes,
            precioNoche: hotel.precio,
            precioTotal,
            stripeUrl: session.url,
        });

        console.log(`✅ Mail enviado a ${gmail} | ${noches} noches | ARS $${precioTotal}`);

        res.json({ mensaje: "¡Reserva recibida! Revisá tu correo para completar el pago." });

    } catch (error) {
        console.error("❌ Error en el checkout:", error.message);
        res.status(500).json({ error: "Error interno del servidor." });
    }
}

router.post('/', procesarCheckout);

module.exports = router;