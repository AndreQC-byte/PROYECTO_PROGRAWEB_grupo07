import React from 'react';
import { useAuth } from '../../context/AuthContext'; // Asumiendo el Contexto creado previamente

const Encabezado = () => {
  const { usuario, logout } = useAuth();

  return (
    <header style={{ height: '60px', backgroundColor: '#1F4E79', color: '#FFFFFF', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between' }}>
      <div className="logo">
        <span style={{ fontWeight: 'bold' }}>Mesa de Ayuda</span> · Campus Ulima
      </div>
      
      {usuario && (
        <div className="buscador-global">
          <input 
            type="text" 
            placeholder="Buscar por código de ticket · TCK-2026-…" 
            style={{ borderRadius: '4px', padding: '4px 8px', border: 'none', width: '300px' }}
          />
        </div>
      )}

      <div className="menu-usuario">
        {usuario ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>{usuario.nombres} ({usuario.rol})</span>
            <button onClick={logout} style={{ background: 'transparent', color: '#FFF', border: '1px solid #FFF', borderRadius: '4px', padding: '4px 8px' }}>Cerrar sesión</button>
          </div>
        ) : (
          <nav>
            <a href="/login" style={{ color: '#FFF', marginRight: '12px' }}>Iniciar sesión</a>
            <a href="/registro" style={{ color: '#FFF' }}>Registrarme</a>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Encabezado;