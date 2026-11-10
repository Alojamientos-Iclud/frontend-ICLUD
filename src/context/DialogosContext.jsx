import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const DialogosContext = createContext(null);

function Dialogo({ dialogo, onCerrar }) {
  const [activo, setActivo] = useState(false);
  const primerBoton = useRef(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setActivo(true);
      primerBoton.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const alPresionar = (e) => {
      if (e.key === "Escape") onCerrar(dialogo.valorCancelar);
    };
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [dialogo, onCerrar]);

  return (
    <div
      className={`modal-overlay${activo ? " active" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar(dialogo.valorCancelar);
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <button
          type="button"
          className="modal-close"
          aria-label="Cerrar"
          onClick={() => onCerrar(dialogo.valorCancelar)}
        >
          ×
        </button>
        <div className="modal-logo">ICLUD</div>
        <div className="modal-icono">{dialogo.icono}</div>
        <h2 id="modal-titulo">{dialogo.titulo}</h2>
        <p className="modal-sub">{dialogo.mensaje}</p>
        <div className="modal-botones">
          {dialogo.botones.map((b, i) => (
            <button
              key={b.texto}
              ref={i === 0 ? primerBoton : null}
              type="button"
              className={`btn-submit ${b.clase || ""}`.trim()}
              onClick={() => onCerrar(b.valor)}
            >
              {b.texto}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DialogosProvider({ children }) {
  const [dialogo, setDialogo] = useState(null);
  const resolverRef = useRef(null);

  const mostrar = useCallback(
    (config) =>
      new Promise((resolve) => {
        resolverRef.current = resolve;
        setDialogo({ valorCancelar: false, ...config });
      }),
    []
  );

  const cerrar = useCallback((valor) => {
    setDialogo(null);
    const resolver = resolverRef.current;
    resolverRef.current = null;
    if (resolver) resolver(valor);
  }, []);

  const alerta = useCallback(
    ({ icono, titulo, mensaje, textoBoton = "Entendido" }) =>
      mostrar({
        icono,
        titulo,
        mensaje,
        botones: [{ texto: textoBoton, valor: true }],
        valorCancelar: true
      }),
    [mostrar]
  );

  const confirmar = useCallback(
    ({ icono, titulo, mensaje, textoConfirmar = "Confirmar", textoCancelar = "Cancelar", peligro = false }) =>
      mostrar({
        icono,
        titulo,
        mensaje,
        botones: [
          { texto: textoConfirmar, clase: peligro ? "peligro" : "", valor: true },
          { texto: textoCancelar, clase: "secundario", valor: false }
        ],
        valorCancelar: false
      }),
    [mostrar]
  );

  const valor = useMemo(() => ({ alerta, confirmar }), [alerta, confirmar]);

  return (
    <DialogosContext.Provider value={valor}>
      {children}
      {dialogo && <Dialogo dialogo={dialogo} onCerrar={cerrar} />}
    </DialogosContext.Provider>
  );
}

export function useDialogos() {
  return useContext(DialogosContext);
}
