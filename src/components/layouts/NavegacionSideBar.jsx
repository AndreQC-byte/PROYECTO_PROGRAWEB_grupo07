import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';

const NavegacionSidebar = () => {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  if (!usuario) return null;

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate('/login');
  };

  return (
    <aside className="layout-sidebar">
      <div>
        {/* ROL SUPERVISOR (Mockup 2.1, 4.1, 6.3, 7.1) */}
        {usuario.rol === 'Supervisor' && (
          <nav>
            <div className="seccion-titulo">SUPERVISIÓN</div>
            <ul className="nav-lista">
              <li>
                <NavLink to="/supervisor/tablero" className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>Tablero</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/supervisor/cola" className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>Cola de atención</span>
                  <span className="nav-badge-conteo">24</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/supervisor/bandejas" className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>Bandejas de técnicos</span>
                  <span className="nav-badge-conteo">6</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/catalogo/categorias" className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>Categorías</span>
                  <span className="nav-badge-conteo">7</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/catalogo/ambientes" className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>Sedes y ambientes</span>
                  <span className="nav-badge-conteo">48</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/catalogo/tecnicos" className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>Técnicos por categoría</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/supervisor/satisfaccion" className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>Satisfacción</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/supervisor/carga" className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>Carga por técnico</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/supervisor/usuarios" className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>Usuarios</span>
                  <span className="nav-badge-conteo">15</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        )}

        {/* ROL TÉCNICO (Mockup 4.5, 5.1, 5.5) */}
        {usuario.rol === 'Técnico' && (
          <nav>
            <div className="seccion-titulo">ATENCIÓN</div>
            <ul className="nav-lista">
              <li>
                <NavLink to="/tecnico/bandeja" end className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>Mi bandeja</span>
                  <span className="nav-badge-conteo">8</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/tecnico/bandeja?estado=En%20atenci%C3%B3n" className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>En atención</span>
                  <span className="nav-badge-conteo">3</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/tecnico/bandeja?estado=En%20espera" className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>En espera</span>
                  <span className="nav-badge-conteo">2</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/tecnico/bandeja?estado=Resuelto" className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>Resueltos hoy</span>
                  <span className="nav-badge-conteo">2</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/tecnico/historial" className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>Historial</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        )}

        {/* ROL USUARIO (Mockup 1.6, 3.1, 3.3, 6.1) */}
        {usuario.rol === 'Usuario' && (
          <nav>
            <div className="seccion-titulo">MIS SERVICIOS</div>
            <ul className="nav-lista">
              <li>
                <NavLink to="/mis-tickets" end className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>Inicio</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/mis-tickets/nuevo" className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>Nuevo ticket</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/mis-tickets" className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>Mis tickets</span>
                  <span className="nav-badge-conteo">12</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/encuestas/pendiente" className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>Encuesta pendiente</span>
                  <span className="nav-badge-conteo">1</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/encuestas" end className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
                  <span>Mis encuestas</span>
                  <span className="nav-badge-conteo">7</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* SECCIÓN INFERIOR COMÚN (Mockup 1.6, 2.1, 4.1, etc.) */}
      <div className="layout-sidebar-inferior">
        <NavLink to="/mi-cuenta" className={({ isActive }) => `nav-item-link ${isActive ? 'activo' : ''}`}>
          <span>Mi cuenta</span>
        </NavLink>
        <button
          type="button"
          onClick={handleCerrarSesion}
          className="btn-cerrar-sesion-link"
          title="Cerrar sesión"
        >
          <span>Cerrar sesión</span>
          <span style={{ fontSize: '13px' }}>➔</span>
        </button>
      </div>
    </aside>
  );
};

export default NavegacionSidebar;
