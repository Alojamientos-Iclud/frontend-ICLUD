-- CreateTable
CREATE TABLE "hotel" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "localizacion" TEXT NOT NULL,
    "cantidad_habitaciones" INTEGER NOT NULL,
    "imagen_h" TEXT,
    "descripcion" TEXT NOT NULL,
    "fecha_subido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_pkey" PRIMARY KEY ("id")
);
