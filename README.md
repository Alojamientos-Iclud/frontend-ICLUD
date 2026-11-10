# ICLUD - Frontend

Aplicación de gestión de hoteles tipo Trivago. Frontend hecho con React + Vite + React Router.

## Requisitos

- Node.js 18 o superior
- El backend corriendo en `http://localhost:3000`

## Cómo correrlo

```bash
npm install
npm run dev
```

Se abre en http://localhost:5173

Si el backend corre en otra dirección, copiá `.env.example` a `.env` y cambiá `VITE_API_URL`.

## Rutas

| Ruta             | Pantalla                                   |
| ---------------- | ------------------------------------------ |
| `/`              | Inicio                                     |
| `/catalogo`      | Catálogo de alojamientos (reservar, favoritos) |
| `/favoritos`     | Mis favoritos (requiere sesión)            |
| `/login`         | Iniciar sesión                             |
| `/registro`      | Crear cuenta                               |
| `/hotelero`      | Panel del hotelero (subir ofertas, retirar hoteles) |
| `/administrador` | Panel del administrador (aprobar/rechazar ofertas)  |

## Build de producción

```bash
npm run build
npm run preview
```
