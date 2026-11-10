import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SesionProvider } from "./context/SesionContext.jsx";
import { DialogosProvider } from "./context/DialogosContext.jsx";
import Inicio from "./pages/Inicio.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import PanelHotelero from "./pages/PanelHotelero.jsx";
import PanelAdministrador from "./pages/PanelAdministrador.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <SesionProvider>
        <DialogosProvider>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/catalogo" element={<Catalogo key="catalogo" />} />
            <Route path="/favoritos" element={<Catalogo key="favoritos" soloFavoritos />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/hotelero" element={<PanelHotelero />} />
            <Route path="/administrador" element={<PanelAdministrador />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DialogosProvider>
      </SesionProvider>
    </BrowserRouter>
  );
}
