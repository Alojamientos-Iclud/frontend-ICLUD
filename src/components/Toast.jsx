export default function Toast({ toast }) {
  return (
    <div
      className={`toast${toast ? " visible" : ""}`}
      style={toast ? { background: toast.error ? "#ef4444" : "#22c55e" } : undefined}
    >
      {toast?.mensaje}
    </div>
  );
}
