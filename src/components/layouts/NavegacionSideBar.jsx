import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';

// Enlace del menú: sin subrayado y resaltado cuando su ruta es la página actual ("end" evita marcar dos a la vez)
const Enlace = ({ to, children }) => (
  <NavLink to={to} end className={({ isActive }) => `nav-enlace ${isActive ? 'nav-enlace-activo' : ''}`}>
    {children}
  </NavLink>
);

const NavegacionSidebar = () => {
  const { usuario } = useAuth();

  // Si no hay sesión, no se muestra el sidebar operativo
  if (!usuario) return null;

  return (
    // Ancho de la navegación lateral fijado en 236 px[cite: 3]
    <aside style={{ width: '236px', backgroundColor: '#F4F6F8', padding: '20px', height: 'calc(100vh - 60px)', borderRight: '1px solid #D6DEE5' }}>
      
      <div className="perfil-resumen" style={{ marginBottom: '20px' }}>
        <div style={{ fontWeight: 'bold' }}>{usuario.nombres} {usuario.apellidos}</div>
        <div style={{ fontSize: '13px', color: '#5F6C78' }}>{usuario.rol}</div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Enlaces para el rol USUARIO[cite: 3] */}
        {usuario.rol === 'Usuario' && (
          <>
            <h5 style={{ fontSize: '16px', color: '#141C24', margin: '12px 0 4px' }}>MIS SERVICIOS</h5>
            <Enlace to="/inicio">Inicio</Enlace>
            <Enlace to="/mis-tickets/nuevo">Nuevo ticket</Enlace>
            <Enlace to="/mis-tickets">Mis tickets</Enlace>
            <Enlace to="/encuestas/pendiente">Encuesta pendiente</Enlace>
            <Enlace to="/encuestas">Mis encuestas</Enlace>
            <Enlace to="/mi-cuenta">Mi cuenta</Enlace>
          </>
        )}

        {/* Enlaces para el rol TÉCNICO[cite: 3] */}
        {usuario.rol === 'Técnico' && (
          <>
            <h5 style={{ fontSize: '16px', color: '#141C24', margin: '12px 0 4px' }}>ATENCIÓN</h5>
            <Enlace to="/tecnico/bandeja">Mi bandeja</Enlace>
            <Enlace to="/tecnico/historial">Historial</Enlace>
            <Enlace to="/mi-cuenta">Mi cuenta</Enlace>
          </>
        )}

        {/* Enlaces para el rol SUPERVISOR[cite: 3] */}
        {usuario.rol === 'Supervisor' && (
          <>
            <h5 style={{ fontSize: '16px', color: '#141C24', margin: '12px 0 4px' }}>SUPERVISIÓN</h5>
            <Enlace to="/supervisor/tablero">Tablero</Enlace>
            <Enlace to="/supervisor/cola">Cola de atención</Enlace>
            <Enlace to="/catalogo/categorias">Categorías</Enlace>
            <Enlace to="/catalogo/ambientes">Sedes y ambientes</Enlace>
            <Enlace to="/catalogo/tecnicos">Técnicos por categoría</Enlace>
            <Enlace to="/supervisor/satisfaccion">Satisfacción</Enlace>
            <Enlace to="/supervisor/usuarios">Usuarios</Enlace>
          </>
        )}
      </nav>
    </aside>
  );
};

export default NavegacionSidebar;