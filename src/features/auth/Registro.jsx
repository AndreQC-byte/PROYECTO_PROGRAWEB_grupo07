import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Boton from '../../components/common/Boton';
import { useAuth } from '../../context/AuthContext';
import CampoFormulario from './CampoFormulario';
import { UNIDADES, VINCULOS, correoDisponible, registrarUsuario } from './servicioAuth';
import {
  validarNombre,
  validarCorreoInstitucional,
  validarTelefono,
  validarContrasena,
  validarConfirmacion,
} from './validaciones';

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

const VALORES_INICIALES = {
  nombres: '',
  apellidos: '',
  correo: '',
  telefono: '',
  contrasena: '',
  confirmar: '',
  unidad: '',
  vinculo: '',
  terminos: false,
};

export default function Registro() {
  const { iniciarSesion } = useAuth();
  const navegar = useNavigate();

  const [valores, setValores] = useState(VALORES_INICIALES);
  const [tocados, setTocados] = useState({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo: 'error' | 'exito', texto }

  // Los errores se calculan a partir de los valores actuales
  const errores = {
    nombres: validarNombre(valores.nombres, 'El nombre es obligatorio'),
    apellidos: validarNombre(valores.apellidos, 'Los apellidos son obligatorios'),
    correo:
      validarCorreoInstitucional(valores.correo) ||
      (correoDisponible(valores.correo) ? '' : 'Este correo ya está registrado'),
    telefono: validarTelefono(valores.telefono),
    contrasena: validarContrasena(valores.contrasena),
    confirmar: validarConfirmacion(valores.contrasena, valores.confirmar),
    unidad: valores.unidad ? '' : 'Selecciona tu unidad o carrera',
    vinculo: valores.vinculo ? '' : 'Selecciona tu vínculo con la universidad',
    terminos: valores.terminos ? '' : 'Debes aceptar los términos y la política de privacidad',
  };

  // Un error se muestra cuando el campo ya fue visitado o se intentó enviar el formulario
  const errorVisible = (campo) => (tocados[campo] || intentoEnvio ? errores[campo] : '');
  const claseInput = (campo) => `auth-input ${errorVisible(campo) ? 'auth-input--error' : ''}`;

  const cambiar = (campo) => (evento) => {
    const valor = evento.target.type === 'checkbox' ? evento.target.checked : evento.target.value;
    setValores((previos) => ({ ...previos, [campo]: valor }));
  };

  const marcarTocado = (campo) => () => {
    setTocados((previos) => ({ ...previos, [campo]: true }));
  };

  const correoValido = valores.correo !== '' && !errores.correo;

  const enviar = async (evento) => {
    evento.preventDefault();
    setAviso(null);
    setIntentoEnvio(true);
    if (Object.values(errores).some(Boolean)) return;

    setCargando(true);
    await esperar(600); // simula el tiempo de creación de la cuenta
    const resultado = registrarUsuario(valores);

    if (!resultado.ok) {
      setCargando(false);
      setAviso({ tipo: 'error', texto: resultado.mensaje });
      return;
    }

    // La cuenta queda activa al instante y se inicia sesión con ella
    iniciarSesion(valores.correo, valores.contrasena, false);
    setAviso({
      tipo: 'exito',
      texto: `Cuenta creada. Te damos la bienvenida, ${resultado.usuario.nombres}.`,
    });
    await esperar(1000);
    navegar('/dashboard', { replace: true });
  };

  return (
    <div className="auth-centro auth-centro--registro">
      <section className="auth-tarjeta auth-tarjeta-registro">
        <h2>Crear mi cuenta</h2>
        <p className="auth-aux auth-aux--separado">
          Solo para miembros de la comunidad con correo institucional.
        </p>

        <form className="auth-form auth-form--registro" onSubmit={enviar} noValidate>
          {aviso && (
            <div className={`auth-alerta auth-alerta--${aviso.tipo}`} role="alert">
              {aviso.texto}
            </div>
          )}

          <div className="auth-rejilla">
            <CampoFormulario id="reg-nombres" etiqueta="Nombres" error={errorVisible('nombres')}>
              <input
                id="reg-nombres"
                className={claseInput('nombres')}
                value={valores.nombres}
                onChange={cambiar('nombres')}
                onBlur={marcarTocado('nombres')}
                autoComplete="given-name"
                disabled={cargando}
              />
            </CampoFormulario>

            <CampoFormulario id="reg-apellidos" etiqueta="Apellidos" error={errorVisible('apellidos')}>
              <input
                id="reg-apellidos"
                className={claseInput('apellidos')}
                value={valores.apellidos}
                onChange={cambiar('apellidos')}
                onBlur={marcarTocado('apellidos')}
                autoComplete="family-name"
                disabled={cargando}
              />
            </CampoFormulario>

            <CampoFormulario
              id="reg-correo"
              etiqueta="Correo institucional"
              error={errorVisible('correo')}
              exito={correoValido ? 'Correo válido y disponible.' : ''}
            >
              <input
                id="reg-correo"
                className={`${claseInput('correo')} ${correoValido ? 'auth-input--ok' : ''}`}
                type="email"
                value={valores.correo}
                onChange={cambiar('correo')}
                onBlur={marcarTocado('correo')}
                placeholder="nombre@aloe.ulima.edu.pe"
                autoComplete="email"
                disabled={cargando}
              />
              {correoValido && <span className="auth-marca-ok" aria-hidden="true">✓</span>}
            </CampoFormulario>

            <CampoFormulario
              id="reg-telefono"
              etiqueta="Teléfono"
              error={errorVisible('telefono')}
              ayuda="Para coordinar el acceso al ambiente."
            >
              <input
                id="reg-telefono"
                className={claseInput('telefono')}
                type="tel"
                value={valores.telefono}
                onChange={cambiar('telefono')}
                onBlur={marcarTocado('telefono')}
                placeholder="987654321"
                autoComplete="tel"
                disabled={cargando}
              />
            </CampoFormulario>

            <CampoFormulario
              id="reg-contrasena"
              etiqueta="Contraseña"
              error={errorVisible('contrasena')}
              ayuda="Mínimo 8 caracteres, con una mayúscula y un número."
            >
              <input
                id="reg-contrasena"
                className={claseInput('contrasena')}
                type="password"
                value={valores.contrasena}
                onChange={cambiar('contrasena')}
                onBlur={marcarTocado('contrasena')}
                autoComplete="new-password"
                disabled={cargando}
              />
            </CampoFormulario>

            <CampoFormulario
              id="reg-confirmar"
              etiqueta="Confirmar contraseña"
              error={errorVisible('confirmar')}
            >
              <input
                id="reg-confirmar"
                className={claseInput('confirmar')}
                type="password"
                value={valores.confirmar}
                onChange={cambiar('confirmar')}
                onBlur={marcarTocado('confirmar')}
                autoComplete="new-password"
                disabled={cargando}
              />
            </CampoFormulario>

            <CampoFormulario id="reg-unidad" etiqueta="Unidad o carrera" error={errorVisible('unidad')}>
              <select
                id="reg-unidad"
                className={claseInput('unidad')}
                value={valores.unidad}
                onChange={cambiar('unidad')}
                onBlur={marcarTocado('unidad')}
                disabled={cargando}
              >
                <option value="">Selecciona una opción</option>
                {UNIDADES.map((unidad) => (
                  <option key={unidad} value={unidad}>{unidad}</option>
                ))}
              </select>
            </CampoFormulario>

            <CampoFormulario
              id="reg-vinculo"
              etiqueta="Vínculo con la universidad"
              error={errorVisible('vinculo')}
            >
              <select
                id="reg-vinculo"
                className={claseInput('vinculo')}
                value={valores.vinculo}
                onChange={cambiar('vinculo')}
                onBlur={marcarTocado('vinculo')}
                disabled={cargando}
              >
                <option value="">Selecciona una opción</option>
                {VINCULOS.map((vinculo) => (
                  <option key={vinculo} value={vinculo}>{vinculo}</option>
                ))}
              </select>
            </CampoFormulario>
          </div>

          <div>
            <label className="auth-check">
              <input
                type="checkbox"
                checked={valores.terminos}
                onChange={cambiar('terminos')}
                onBlur={marcarTocado('terminos')}
                disabled={cargando}
              />
              Acepto los términos del servicio y la política de privacidad.
            </label>
            {errorVisible('terminos') && (
              <span className="auth-ayuda auth-ayuda--error" role="alert">
                {errorVisible('terminos')}
              </span>
            )}
          </div>

          <div className="auth-acciones">
            <Boton type="submit" disabled={cargando}>
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
            </Boton>
            <Link
              className={`auth-btn btn-secundario ${cargando ? 'auth-enlace--inactivo' : ''}`}
              to="/"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </section>

      <aside className="auth-tarjeta auth-tarjeta-lateral">
        <h3>Antes de registrarte</h3>
        <p className="auth-aux auth-aux--bloque">
          Si eres técnico o supervisor no uses este formulario: el área de Infraestructura te envía
          una invitación con tus datos precargados.
        </p>
        <hr className="auth-separador" />
        <p className="auth-aux">
          Tu cuenta queda activa al instante; el correo de bienvenida llega en pocos minutos.
        </p>
      </aside>
    </div>
  );
}