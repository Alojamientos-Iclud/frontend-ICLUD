import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminCss from "../styles/admin.css?inline";
import claveCss from "../styles/clave.css?inline";
import usePageStyles from "../hooks/usePageStyles.js";
import { loginAdmin } from "../services/api.js";

export default function Clave() {
  usePageStyles(adminCss, claveCss);
  const navigate = useNavigate();

  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const { ok, data } = await loginAdmin(gmail.trim(), password);

      if (!ok) {
        setError(data.error || "No se pudo verificar el acceso.");
        return;
      }

      if (data.estatus === "hotelero") navigate("/admin");
      else if (data.estatus === "admin") navigate("/administrador");
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-wrapper">
      <h1>Acceso Administrador</h1>
      <p>Ingresá tus credenciales de administrador para continuar.</p>

      <div className={`login-error${error ? " visible" : ""}`}>{error}</div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="gmail">Correo</label>
          <input
            type="email"
            id="gmail"
            placeholder="tu@email.com"
            required
            value={gmail}
            onChange={(e) => setGmail(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ marginTop: ".8rem" }}>
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-actions" style={{ marginTop: "1.2rem" }}>
          <Link to="/" className="btn btn-ghost">Volver</Link>
          <button type="submit" className="btn btn-primary" disabled={cargando}>
            {cargando ? "Verificando..." : "Ingresar"}
          </button>
        </div>
      </form>
    </div>
  );
}
