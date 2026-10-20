import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Boton from '../../components/common/Boton';
import { useAuth } from '../../context/AuthContext';

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

// Tipo de resultado del servicio -> variante visual de la alerta
const VARIANTE_AVISO = {
  credenciales: 'error',
  inactiva: 'error',
  bloqueada: 'advertencia',
  exito: 'exito',
};

// Pantalla 1.2 · Inicio de sesión (rol: visitante)
export default function Login() {
  const { iniciarSesion } = useAuth();
  const navegar = useNavigate();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [recordar, setRecordar] = useState(true);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo, texto }

  // Validación en línea: un mensaje por cada campo con problema
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

  const enviar = async (evento) => {
    evento.preventDefault();
    setAviso(null);

    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setCargando(true);
    await esperar(600); // simula el tiempo de validación de la sesión
    const resultado = iniciarSesion(correo, contrasena, recordar);

    if (!resultado.ok) {
      setCargando(false);
      setAviso({ tipo: resultado.tipo, texto: resultado.mensaje });
      if (resultado.tipo === 'credenciales') {
        setErrores({ contrasena: 'Verifica tus datos e inténtalo otra vez.' });
      }
      return;
    }

    setAviso({ tipo: 'exito', texto: `Sesión iniciada. Hola, ${resultado.usuario.nombres}.` });
    await esperar(800);
    // /dashboard redirige a la vista principal según el rol
    navegar('/dashboard', { replace: true });
  };

  const claseEnlace = `auth-enlace ${cargando ? 'auth-enlace--inactivo' : ''}`;

  return (
    <div className="auth-centro">
      <section className="auth-tarjeta auth-tarjeta-form">
        <h2>Iniciar sesión</h2>
        <p className="auth-aux auth-aux--separado">Ingresa con tu correo institucional.</p>

        <form className="auth-form" onSubmit={enviar} noValidate>
          {aviso && (
            <div className={`auth-alerta auth-alerta--${VARIANTE_AVISO[aviso.tipo]}`} role="alert">
              {aviso.texto}
              {aviso.tipo === 'bloqueada' && (
                <div className="auth-acciones auth-acciones--alerta">
                  <Link className="auth-btn btn-primario" to="/recuperar">Restablecer contraseña</Link>
                  <a className="auth-enlace" href="mailto:soporte.campus@ulima.edu.pe">Escribir a soporte</a>
                </div>
              )}
            </div>
          )}

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
              disabled={cargando}
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
              disabled={cargando}
            />
            <button
              className="auth-mostrar"
              type="button"
              onClick={() => setVerContrasena(!verContrasena)}
              disabled={cargando}
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
                disabled={cargando}
              />
              Recordarme en este equipo
            </label>
            <Link className={claseEnlace} to="/recuperar">¿Olvidaste tu contraseña?</Link>
          </div>

          <Boton type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </Boton>

          <p className="auth-aux auth-aux--centrado">
            ¿No tienes cuenta? <Link className={claseEnlace} to="/registro">Regístrate</Link>
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