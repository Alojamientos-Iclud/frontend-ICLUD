import { useEffect } from "react";

export default function Modal({ open, onClose, style, children }) {
  // Bloquea el scroll del fondo mientras el modal está abierto
  useEffect(() => {
    if (!open) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [open]);

  return (
    <div
      className={`modal-overlay${open ? " active" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" style={style}>
        <button type="button" className="modal-close" onClick={onClose}>×</button>
        <div className="modal-logo">ICLUD</div>
        {children}
      </div>
    </div>
  );
}
