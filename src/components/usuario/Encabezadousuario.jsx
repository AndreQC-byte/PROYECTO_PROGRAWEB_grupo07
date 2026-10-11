import { Link } from 'react-router-dom';

const usuario = {
  nombre: 'Camila Quispe Ramos',
  rol: 'Usuario',
  iniciales: 'CQ',
};

function EncabezadoUsuario() {
  return (
    <header>
      <div className="titulo">
        <span className="logo"></span>
        <span>Mesa de Ayuda</span>
      </div>

      <input
        className="search"
        type="search"
        placeholder="Buscar por código de ticket · TCK-2026-…"
      />

      <div className="derechahead">
        <Link to="/mis-tickets" className="ticketsabiertos">
          Mis tickets abiertos <strong>3</strong>
        </Link>
        <div className="usuario">
          <div className="info">
            <span className="nombre">{usuario.nombre}</span>
            <span className="user">{usuario.rol}</span>
          </div>
          <span className="avatar">{usuario.iniciales}</span>
        </div>
      </div>
    </header>
  );
}

export default EncabezadoUsuario;