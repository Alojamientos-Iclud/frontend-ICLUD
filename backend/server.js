
// 1. Importamos 'path' y cargamos el .env apuntando directamente a la raíz



/*
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 2. Importamos express (¡fundamental para que funcione app.use!)
const express = require('express');
const { PrismaClient } = require('@prisma/client');

// 3. Inicializamos Prisma de forma segura
const prisma = new PrismaClient();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const hotelesRouter = require("./routes/hoteles");
const app = express();

app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.static(path.join(__dirname, "../frontend/pages")));

console.log("Sirviendo estáticos desde:", path.join(__dirname, "../frontend/pages"));

// Rutas de la API
app.use("/api/hoteles", hotelesRouter);

/* ==========================================================================
   RUTA DE CHECKOUT (Stripe + Prisma)
   ========================================================================== */

/*
   app.post('/api/checkout', async (req, res) => {
    let hotelId;
    try {
        const { hotelId: idExtraido, nombre_completo, gmail, cantidad_huespedes, llegada, salida } = req.body;
        hotelId = idExtraido;
        console.log("■ ¡Llegó una petición! Datos recibidos:", req.body);
        // 1. Buscamos el hotel en la BD para validar su precio real
        /*const hotel = await prisma.hotel.findUnique({
            where: { id: Number(hotelId)}
        });*/

        /*
        const hotel = { id: 1, precio: 15000, nombre: "Hotel de Prueba" };

        if (!hotel || !hotel.precio) {
            return res.status(404).json({ error: "Alojamiento no encontrado o no tiene precio asignado." });
        }

        // 2. Guardamos los datos del formulario en tu tabla de Base de Datos
            
        /*const nuevaReserva = await prisma.formulario.create({
            data: {
                hotelId: Number(hotelId),
                nombre_completo,
                gmail,
                cantidad_huespedes: Number(cantidad_huespedes), // Aseguramos que sea número
                llegada: new Date(llegada),
                salida: new Date(salida)
                // 🔗 Vinculamos el hotel. Si tu base de datos usa IDs numéricos, usá Number(hotelId) 
            }});*/


        // 3. Creamos la sesión oficial de pago en Stripe
        
        /*
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: hotel.nombre, 
                    },
                    unit_amount: hotel.precio * 100, // Stripe procesa en centavos
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'http://localhost:3000/success.html',
            cancel_url: 'http://localhost:3000/cancel.html',
        });

        // Si todo sale bien, respondemos con la URL de Stripe
        res.json({ url: session.url });
    } catch (error) {
        console.error("❌ Error en el checkout:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor iniciado con éxito en el puerto ${PORT}`);
    console.log(`🔗 Menú Principal: http://localhost:${PORT}/index.html`);
    console.log(`🔗 Administrador:  http://localhost:${PORT}/admin.html`);
});



*/





const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();

// Routers
const hotelesRouter = require('./routes/hoteles');
const checkoutRouter = require('./routes/checkout');

app.use(express.json());

// Archivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../frontend/pages')));

// Rutas
app.use('/api/hoteles', hotelesRouter);
app.use('/api/checkout', checkoutRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor iniciado con éxito en el puerto ${PORT}`);
    console.log(`🔗 Menú Principal: http://localhost:${PORT}/index.html`);
    console.log(`🔗 Administrador:  http://localhost:${PORT}/admin.html`);
});