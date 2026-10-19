import { useState } from 'react';
import { Link } from 'react-router-dom';
import Boton from '../../components/common/Boton';

// Pantalla 1.2 · Inicio de sesión (rol: visitante)
export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [recordar, setRecordar] = useState(true);
  const [errores, setErrores] = useState({});

  // Validación en línea: devuelve un objeto con el mensaje de cada campo con problema
  const validar = () => {
    const nuevos = {};
    if (!correo.trim()) {
      nuevos.correo = 'El correo es obligatorio';
    } else if (!/^\S+@\S+\.\S+$/.test(correo.trim())) {
      nuevos.correo = 'Escribe un correo válido';
    }
    if (!contrasena) {
      nuevos.contrasena = 'La contraseña es obligatoria';
    }
    return nuevos;
  };

  const enviar = (evento) => {
    evento.preventDefault();
    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    // Siguiente paso: aquí se llamará al servicio de autenticación
  };

  return (
    <div className="auth-centro">
      <section className="auth-tarjeta auth-tarjeta-form">
        <h2>Iniciar sesión</h2>
        <p className="auth-aux auth-aux--separado">Ingresa con tu correo institucional.</p>

        <form className="auth-form" onSubmit={enviar} noValidate>
          <div className="auth-campo">
            <label className="auth-etiqueta" htmlFor="login-correo">Correo institucional</label>
            <input
              id="login-correo"
              className={`auth-input ${errores.correo ? 'auth-input--error' : ''}`}
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="nombre@aloe.ulima.edu.pe"
              autoComplete="username"
              aria-invalid={Boolean(errores.correo)}
            />
            {errores.correo && (
              <span className="auth-ayuda auth-ayuda--error" role="alert">{errores.correo}</span>
            )}
          </div>

          <div className="auth-campo">
            <label className="auth-etiqueta" htmlFor="login-contrasena">Contraseña</label>
            <input
              id="login-contrasena"
              className={`auth-input auth-input--con-boton ${errores.contrasena ? 'auth-input--error' : ''}`}
              type={verContrasena ? 'text' : 'password'}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              autoComplete="current-password"
              aria-invalid={Boolean(errores.contrasena)}
            />
            <button
              className="auth-mostrar"
              type="button"
              onClick={() => setVerContrasena(!verContrasena)}
            >
              {verContrasena ? 'Ocultar' : 'Mostrar'}
            </button>
            {errores.contrasena && (
              <span className="auth-ayuda auth-ayuda--error" role="alert">{errores.contrasena}</span>
            )}
          </div>

          <div className="auth-fila">
            <label className="auth-check">
              <input
                type="checkbox"
                checked={recordar}
                onChange={(e) => setRecordar(e.target.checked)}
              />
              Recordarme en este equipo
            </label>
            <Link className="auth-enlace" to="/recuperar">¿Olvidaste tu contraseña?</Link>
          </div>

          <Boton type="submit">Ingresar</Boton>

          <p className="auth-aux auth-aux--centrado">
            ¿No tienes cuenta? <Link className="auth-enlace" to="/registro">Regístrate</Link>
          </p>
        </form>
      </section>

      <aside className="auth-lateral">
        <h3>Acceso por rol</h3>
        <p className="auth-aux">
          Usuarios de la comunidad ingresan con su correo. Técnicos y supervisores reciben una
          invitación del área de Infraestructura y definen su contraseña al aceptarla.
        </p>
        <div className="auth-alerta auth-alerta--info">
          Tras cinco intentos fallidos la cuenta se bloquea por 15 minutos.
        </div>
      </aside>
    </div>
  );
}