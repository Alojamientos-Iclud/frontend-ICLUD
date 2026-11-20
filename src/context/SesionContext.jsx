import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, borrarSesion, guardarSesion, leerSesion } from "../services/api.js";

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion);
  const [cantidadFavoritos, setCantidadFavoritos] = useState(0);
  const revisionFavoritos = useRef(0);

  const iniciar = useCallback((token, usuario) => {
    revisionFavoritos.current += 1;
    setCantidadFavoritos(0);
    setSesion(guardarSesion(token, usuario));
  }, []);

  const cerrar = useCallback(() => {
    revisionFavoritos.current += 1;
    setCantidadFavoritos(0);
    borrarSesion();
    setSesion(null);
  }, []);

  const actualizarCantidadFavoritos = useCallback((cantidad) => {
    revisionFavoritos.current += 1;
    setCantidadFavoritos(cantidad);
  }, []);

  useEffect(() => {
    const revision = ++revisionFavoritos.current;
    let cancelado = false;

    if (!sesion) {
      setCantidadFavoritos(0);
      return () => {
        cancelado = true;
      };
    }

    setCantidadFavoritos(null);
    api("/api/favoritos", { auth: true })
      .then((favoritos) => {
        if (!cancelado && revisionFavoritos.current === revision) {
          setCantidadFavoritos(favoritos.length);
        }
      })
      .catch((error) => {
        if (cancelado || revisionFavoritos.current !== revision) return;
        if (error.status === 401) cerrar();
        else console.error("No se pudo cargar la cantidad de favoritos:", error);
      });

    return () => {
      cancelado = true;
    };
  }, [sesion, cerrar]);

  const valor = useMemo(
    () => ({ sesion, iniciar, cerrar, cantidadFavoritos, actualizarCantidadFavoritos }),
    [sesion, iniciar, cerrar, cantidadFavoritos, actualizarCantidadFavoritos]
  );

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

export function useSesion() {
  return useContext(SesionContext);
}
