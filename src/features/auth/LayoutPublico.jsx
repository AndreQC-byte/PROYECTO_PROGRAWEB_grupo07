import { Link, Outlet } from 'react-router-dom';
import '../../styles/auth.css';

export default function LayoutPublico() {
  return (
    <div className="auth-pagina">
      <header className="auth-cabecera">
        <div className="auth-wrap">
          <Link className="auth-marca" to="/">
            <span className="auth-logo" />
            Mesa de Ayuda
            <span className="auth-marca-sub">· Campus Ulima</span>
          </Link>

          <nav className="auth-nav">
            <Link to="/">Inicio</Link>
            <a href="#">Cómo reportar</a>
            <a href="#">Categorías de servicio</a>
            <a href="#">Tiempos de atención</a>
          </nav>

          <div className="auth-cabecera-acciones">
            <Link className="auth-btn btn-secundario" to="/login">Iniciar sesión</Link>
            <Link className="auth-btn btn-primario" to="/registro">Registrarme</Link>
          </div>
        </div>
      </header>

      <main className="auth-principal">
        <div className="auth-wrap">
          <Outlet />
        </div>
      </main>

      <footer className="auth-pie">
        <div className="auth-wrap">
          <div>
            <strong>Mesa de Ayuda de Servicios</strong>
            <p>Universidad de Lima · Dirección de Infraestructura y Servicios</p>
            <p>soporte.campus@ulima.edu.pe · anexo 30500</p>
            <p>Atención de lunes a sábado, 07:00 a 21:00</p>
          </div>

          <div>
            <h4>Reportar</h4>
            <a href="#">Registrar un ticket</a>
            <a href="#">Seguir un ticket</a>
            <a href="#">Categorías de servicio</a>
          </div>

          <div>
            <h4>Ayuda</h4>
            <a href="#">Preguntas frecuentes</a>
            <a href="#">Tiempos de atención esperados</a>
            <a href="#">Emergencias eléctricas · anexo 30111</a>
          </div>

          <div className="auth-pie-legal">
            © 2026 Universidad de Lima
            <br />
            <a href="#">Términos</a> · <a href="#">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}