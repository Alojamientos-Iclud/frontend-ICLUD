export default function Modal({ abierto, onCerrar, centrado = false, children }) {
  return (
    <div className={`modal-overlay${abierto ? " active" : ""}`}>
      <div className="modal" style={centrado ? { textAlign: "center" } : undefined}>
        <button type="button" className="modal-close" onClick={onCerrar}>
          ×
        </button>
        <div className="modal-logo">ICLUD</div>
        {children}
      </div>
    </div>
  );
}
