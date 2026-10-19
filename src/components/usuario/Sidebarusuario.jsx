import { NavLink } from 'react-router-dom';

const servicios = [
  { texto: 'Inicio', to: '/inicio' },
  { texto: 'Nuevo ticket', to: '/mis-tickets/nuevo' },
  { texto: 'Mis tickets', to: '/mis-tickets', numero: 12 },
  { texto: 'Encuesta pendiente', to: '/encuestas/pendiente', numero: 1 },
  { texto: 'Mis encuestas', to: '/encuestas', numero: 7 },
  { texto: 'Mi cuenta', to: '/mi-cuenta' },
];

function SidebarUsuario() {
  return (
    <aside className="sidebar">
      <h5>MIS SERVICIOS</h5>
      <nav>
        {servicios.map((s) => (
          <NavLink
            key={s.texto}
            to={s.to}
            end
            className={({ isActive }) => (isActive ? 'activo' : '')}
          >
            {s.texto}
            {s.numero && <span className="numero">{s.numero}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-pie">
        <NavLink to="/mi-cuenta">Mi cuenta</NavLink>
        <NavLink to="/login">Cerrar sesión</NavLink>
      </div>
    </aside>
  );
}

export default SidebarUsuario;