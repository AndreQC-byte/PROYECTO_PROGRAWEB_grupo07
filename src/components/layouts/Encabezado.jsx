import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Encabezado = () => {
  const { usuario, cerrarSesion } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();

  const manejarBuscar = (e) => {
    e.preventDefault();
    const codigo = busqueda.trim();
    if (!codigo) return;

    if (usuario?.rol === 'Supervisor') {
      navigate(`/supervisor/cola?buscar=${encodeURIComponent(codigo)}`);
    } else if (usuario?.rol === 'Técnico') {
      navigate(`/tecnico/bandeja?buscar=${encodeURIComponent(codigo)}`);
    } else {
      navigate(`/mis-tickets?buscar=${encodeURIComponent(codigo)}`);
    }
  };

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navigate('/login');
  };

  // Obtener iniciales del usuario para el avatar
  const obtenerIniciales = () => {
    if (!usuario) return 'UL';
    const n = usuario.nombres ? usuario.nombres.trim().charAt(0) : '';
    const a = usuario.apellidos ? usuario.apellidos.trim().charAt(0) : '';
    return `${n}${a}`.toUpperCase() || 'U';
  };

  // Texto y badge de estado según el rol (Mockups 1.6, 2.1, 4.1, 4.5)
  const renderBadgeRol = () => {
    if (!usuario) return null;
    if (usuario.rol === 'Supervisor') {
      return (
        <Link to="/supervisor/cola" className="badge-rol-conteo" title="Ver tickets sin asignar en la cola">
          <span>COLA SIN ASIGNAR</span>
          <span style={{ fontWeight: 700 }}>9</span>
        </Link>
      );
    }
    if (usuario.rol === 'Técnico') {
      return (
        <Link to="/tecnico/bandeja" className="badge-rol-conteo" title="Ver mis tickets asignados">
          <span>ASIGNADOS A MÍ</span>
          <span style={{ fontWeight: 700 }}>8</span>
        </Link>
      );
    }
    return (
      <Link to="/mis-tickets" className="badge-rol-conteo" title="Ver mis tickets abiertos">
        <span>MIS TICKETS ABIERTOS</span>
        <span style={{ fontWeight: 700 }}>3</span>
      </Link>
    );
  };

  return (
    <header className="layout-encabezado">
      <Link to="/dashboard" className="logo-marca">
        <div className="logo-marca-icono">
          <div className="logo-marca-icono-cuadro" />
        </div>
        <span><strong>Mesa de Ayuda</strong> · Campus Ulima</span>
      </Link>

      {usuario ? (
        <form onSubmit={manejarBuscar} className="buscador-global-form">
          <span className="buscador-icono">⌕</span>
          <input
            type="text"
            className="buscador-global-input"
            placeholder="Buscar por código de ticket · TCK-2026-…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </form>
      ) : (
        <div style={{ flex: 1 }} />
      )}

      <div className="area-usuario">
        {usuario ? (
          <>
            {renderBadgeRol()}
            <Link to="/mi-cuenta" className="perfil-chip" style={{ textDecoration: 'none' }} title="Ir a Mi Cuenta">
              <div className="perfil-textos">
                <span className="perfil-nombre">{usuario.nombres} {usuario.apellidos}</span>
                <span className="perfil-rol">{(usuario.rol || 'USUARIO').toUpperCase()}</span>
              </div>
              <div className="avatar-cuadro">
                {obtenerIniciales()}
              </div>
            </Link>
            <button
              type="button"
              onClick={manejarCerrarSesion}
              className="btn-cerrar-sesion-encabezado"
              title="Cerrar sesión en cualquier momento"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link to="/login" style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '14px' }}>
              Iniciar sesión
            </Link>
            <Link
              to="/registro"
              style={{
                backgroundColor: '#163A5A',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              Registrarme
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Encabezado;
