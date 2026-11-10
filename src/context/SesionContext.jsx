import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { borrarSesion, guardarSesion, leerSesion } from "../services/api.js";

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion);

  const iniciar = useCallback((token, usuario) => {
    setSesion(guardarSesion(token, usuario));
  }, []);

  const cerrar = useCallback(() => {
    borrarSesion();
    setSesion(null);
  }, []);

  const valor = useMemo(() => ({ sesion, iniciar, cerrar }), [sesion, iniciar, cerrar]);

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

export function useSesion() {
  return useContext(SesionContext);
}
