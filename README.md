# ICLUD – Frontend en React (Vite)

Migración del frontend HTML/JS a React + React Router.

## Uso

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # genera /dist
```

El backend (Express) tiene que estar corriendo en `http://localhost:3000`.
En desarrollo, Vite redirige `/api/*` a ese puerto (ver `vite.config.js`), así que no hace falta CORS.
Para apuntar a otro backend: copiar `.env.example` a `.env` y definir `VITE_API_URL`.

## Rutas

| Ruta             | Antes                | Descripción                         |
|------------------|----------------------|-------------------------------------|
| `/`              | `index.html`         | Inicio, alojamientos y login demo   |
| `/catalogo`      | `catalogo.html`      | Catálogo y reservas                 |
| `/clave`         | `clave.html`         | Login de hotelero / administrador   |
| `/admin`         | `admin.html`         | Panel del hotelero                  |
| `/administrador` | `administrador.html` | Aprobación de ofertas pendientes    |

## Estructura

```
src/
  pages/        una pantalla por HTML original
  components/   Modal, Toast, SiteHeader, SiteFooter, StatCard, Icons
  hooks/        useToast, usePageStyles
  services/     api.js (todos los fetch al backend)
  styles/       CSS originales (se cargan por página)
```
