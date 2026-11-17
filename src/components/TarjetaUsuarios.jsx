export default function TarjetaUsuarios({ usuario, procesando, onAlternarBloqueo }) {
  const bloqueado = usuario.estado === false;

  return (
    <article className="usuario-card">
      <div className="usuario-info">
        <h3>{usuario.gmail}</h3>
        <span className={`usuario-estado${bloqueado ? " bloqueado" : ""}`}>
          {bloqueado ? "Bloqueado" : "Activo"}
        </span>
      </div>
      <button
        type="button"
        className={`btn ${bloqueado ? "btn-accept" : "btn-reject"}`}
        disabled={procesando}
        onClick={onAlternarBloqueo}
      >
        {procesando ? "Actualizando..." : bloqueado ? "Desbloquear" : "Bloquear"}
      </button>
    </article>
  );
}