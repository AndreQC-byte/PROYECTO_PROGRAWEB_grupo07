export default function CampoFormulario({ id, etiqueta, error, exito, ayuda, children }) {
  return (
    <div className="auth-campo">
      <label className="auth-etiqueta" htmlFor={id}>{etiqueta}</label>
      {children}
      {error ? (
        <span className="auth-ayuda auth-ayuda--error" role="alert">{error}</span>
      ) : exito ? (
        <span className="auth-ayuda auth-ayuda--ok">{exito}</span>
      ) : ayuda ? (
        <span className="auth-ayuda">{ayuda}</span>
      ) : null}
    </div>
  );
}