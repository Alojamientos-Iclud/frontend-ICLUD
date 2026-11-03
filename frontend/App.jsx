import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import Clave from "./pages/Clave.jsx";
import Hotelero from "./pages/Hotelero.jsx";
import Administrador from "./pages/Administrador.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/clave" element={<Clave />} />
      <Route path="/admin" element={<Hotelero />} />
      <Route path="/administrador" element={<Administrador />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
