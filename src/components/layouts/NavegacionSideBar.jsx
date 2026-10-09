import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

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

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Enlaces para el rol USUARIO[cite: 3] */}
        {usuario.rol === 'Usuario' && (
          <>
            <h5 style={{ fontSize: '16px', color: '#141C24', margin: '12px 0 4px' }}>MIS SERVICIOS</h5>
            <Link to="/inicio">Inicio</Link>
            <Link to="/mis-tickets/nuevo">Nuevo ticket</Link>
            <Link to="/mis-tickets">Mis tickets</Link>
            <Link to="/encuestas">Mis encuestas</Link>
            <Link to="/mi-cuenta">Mi cuenta</Link>
          </>
        )}

        {/* Enlaces para el rol TÉCNICO[cite: 3] */}
        {usuario.rol === 'Técnico' && (
          <>
            <h5 style={{ fontSize: '16px', color: '#141C24', margin: '12px 0 4px' }}>ATENCIÓN</h5>
            <Link to="/tecnico/bandeja">Mi bandeja</Link>
            <Link to="/tecnico/historial">Historial</Link>
            <Link to="/mi-cuenta">Mi cuenta</Link>
          </>
        )}

        {/* Enlaces para el rol SUPERVISOR[cite: 3] */}
        {usuario.rol === 'Supervisor' && (
          <>
            <h5 style={{ fontSize: '16px', color: '#141C24', margin: '12px 0 4px' }}>SUPERVISIÓN</h5>
            <Link to="/supervisor/tablero">Tablero</Link>
            <Link to="/supervisor/cola">Cola de atención</Link>
            <Link to="/catalogo/categorias">Categorías</Link>
            <Link to="/catalogo/ambientes">Sedes y ambientes</Link>
            <Link to="/catalogo/tecnicos">Técnicos por categoría</Link>
            <Link to="/supervisor/usuarios">Usuarios</Link>
          </>
        )}
      </nav>
    </aside>
  );
};

export default NavegacionSidebar;