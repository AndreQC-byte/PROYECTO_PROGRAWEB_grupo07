import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const INICIO_POR_ROL = {
  Usuario: 'Ir a mis tickets',
  Técnico: 'Ir a mi bandeja',
  Supervisor: 'Ir a la cola de atención',
};

export default function AccesoDenegado() {
  const { usuario } = useAuth();

  return (
    <section className="auth-caja auth-denegado">
      <div className="auth-icono-error" aria-hidden="true">403</div>
      <h2>No tienes permiso para ver esta sección</h2>
      <p className="auth-aux">
        Tu cuenta tiene el rol de {usuario.rol.toLowerCase()}. Esta sección es exclusiva de otro rol.
        Si necesitas ese acceso, solicítalo a Infraestructura y Servicios.
      </p>
      <div className="auth-acciones">
        <Link className="auth-btn btn-primario" to="/dashboard">
          {INICIO_POR_ROL[usuario.rol] || 'Ir al inicio'}
        </Link>
        <a
          className="auth-btn btn-secundario"
          href="mailto:soporte.campus@ulima.edu.pe?subject=Solicitud%20de%20acceso"
        >
          Solicitar acceso
        </a>
      </div>
    </section>
  );
}