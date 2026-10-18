// Estado vacío de la HU-6: mensaje amigable y, como children, el llamado a la acción
export default function EstadoVacio({ titulo, texto, children }) {
  return (
    <div className="enc-vacio">
      <span className="enc-vacio-icono" aria-hidden="true" />
      <h2>{titulo}</h2>
      <p>{texto}</p>
      {children}
    </div>
  );
}
