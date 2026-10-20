import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <>
      <section className="auth-tarjeta auth-hero">
        <div>
          <p className="auth-sobretitulo">Infraestructura y servicios del campus</p>
          <h1>Reporta una falla del campus y sigue su atención en un solo lugar</h1>
          <p className="auth-hero-descripcion">
            Proyectores, aire acondicionado, red, mobiliario, electricidad, limpieza y accesos.
            Registra el ticket con el ambiente y la categoría; el supervisor lo prioriza y lo
            asigna a un técnico el mismo día.
          </p>
          <div className="auth-acciones">
            <Link className="auth-btn btn-primario" to="/login">Registrar un ticket</Link>
            <a className="auth-btn btn-secundario" href="#">Ver cómo reportar</a>
          </div>
        </div>
        <div className="auth-foto">[ foto: técnico atendiendo un aula ]</div>
      </section>

      <section className="auth-info">
        <div className="auth-tarjeta">
          <h3>Qué se reporta</h3>
          <p>Audiovisuales, climatización, redes, mobiliario, eléctrico, limpieza y cerraduras.</p>
        </div>
        <div className="auth-tarjeta">
          <h3>Cómo se prioriza</h3>
          <p>Crítica, alta, media y baja según el impacto en clases y en la seguridad.</p>
        </div>
        <div className="auth-tarjeta">
          <h3>Tiempo de atención</h3>
          <p>Crítica 2 h · alta 8 h · media 24 h · baja 72 h hábiles.</p>
        </div>
        <div className="auth-tarjeta auth-tarjeta-emergencia">
          <h3>Emergencias</h3>
          <p>Fugas de agua o riesgo eléctrico: llama al anexo 30111 y registra el ticket después.</p>
        </div>
      </section>
    </>
  );
}