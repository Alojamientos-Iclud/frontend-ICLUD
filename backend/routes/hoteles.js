const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL) });
const router = express.Router();


/*
    GET /api/hoteles (pongan eso cada vez que hagan un endpoint con esta API)

    Devuelve todos los hoteles registrados (nuestros)
*/
router.get("/", async (req, res) => {
    try {

        const hoteles = await prisma.hotel.findMany({
            orderBy: {
                id: "desc"
            }
        });

        res.json(hoteles);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al obtener hoteles"
        });

    }
});

/*
    POST /api/hoteles (pongan eso cada vez que hagan un endpoint con esta API)

    Crea (mas bien añade) un alojamiento nuevo a nuestra bd
*/
router.post("/", async (req, res) => {

    try {

        const {
            nombre,
            localizacion,
            cantidad_habitaciones,
            imagen_h,
            descripcion
        } = req.body;

        const hotel = await prisma.hotel.create({
            data: {
                nombre,
                localizacion,
                cantidad_habitaciones: Number(cantidad_habitaciones),
                imagen_h,
                descripcion
            }
        });

        res.status(201).json(hotel);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al crear hotel"
        });

    }
});

/*
    DELETE /api/hoteles/:id (pongan eso cada vez que hagan un endpoint con esta API)    

    Elimina un hotel de nuestra base de datos.
*/
router.delete("/:id", async (req, res) => {

    try {

        const id = Number(req.params.id);

        await prisma.hotel.delete({
            where: {
                id
            }
        });

        res.json({
            mensaje: "Hotel eliminado"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al eliminar hotel"
        });

    }
});

module.exports = router;