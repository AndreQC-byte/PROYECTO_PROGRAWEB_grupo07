import { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Boton from '../../components/common/Boton';
import CampoFormulario from './CampoFormulario';
import {
  MINUTOS_VIGENCIA_ENLACE,
  consultarEnlaceRestablecimiento,
  restablecerContrasena,
  solicitarRestablecimiento,
} from './servicioAuth';
import {
  ETIQUETAS_FORTALEZA,
  calcularFortaleza,
  validarConfirmacion,
  validarContrasena,
  validarCorreoInstitucional,
} from './validaciones';

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

const SEGUNDOS_REENVIO = 45;
const PASOS = ['Tu correo', 'Enlace enviado', 'Nueva contraseña'];

const MENSAJES_ENLACE = {
  vencido: {
    titulo: 'Este enlace venció',
    texto: `Los enlaces de restablecimiento duran ${MINUTOS_VIGENCIA_ENLACE} minutos. Solicita uno nuevo.`,
  },
  usado: {
    titulo: 'Este enlace ya fue usado',
    texto: 'Cada enlace sirve una sola vez. Si aún necesitas cambiar tu contraseña, solicita uno nuevo.',
  },
  inexistente: {
    titulo: 'No encontramos este enlace',
    texto: 'El enlace puede estar incompleto o haber cambiado. Solicita uno nuevo.',
  },
};

// Barra de pasos: el actual va resaltado y los anteriores quedan marcados como hechos
function Pasos({ actual }) {
  return (
    <div className="auth-pasos">
      {PASOS.map((nombre, indice) => {
        const numero = indice + 1;
        let clase = '';
        if (numero === actual) clase = 'auth-paso-num--activo';
        else if (numero < actual) clase = 'auth-paso-num--hecho';
        return (
          <Fragment key={nombre}>
            {indice > 0 && <hr className="auth-pasos-linea" />}
            <span className={`auth-paso-num ${clase}`}>{numero}</span>
            {nombre}
          </Fragment>
        );
      })}
    </div>
  );
}

export default function RecuperarPassword() {
  const { token } = useParams();

  return (
    <div className="auth-centro">
      <section className="auth-tarjeta auth-tarjeta-form">
        {token ? <NuevaContrasena token={token} /> : <SolicitudEnlace />}
      </section>
    </div>
  );
}

function SolicitudEnlace() {
  const [correo, setCorreo] = useState('');
  const [tocado, setTocado] = useState(false);
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(null); 

  const error = validarCorreoInstitucional(correo);
  const errorVisible = tocado || intentoEnvio ? error : '';

  const enviar = async (evento) => {
    evento.preventDefault();
    setIntentoEnvio(true);
    if (error) return;

    setCargando(true);
    await esperar(600);
    const resultado = solicitarRestablecimiento(correo);
    setCargando(false);
    setEnviado({ correo: correo.trim(), token: resultado.token });
  };

  if (enviado) {
    return <EnlaceEnviado correo={enviado.correo} tokenInicial={enviado.token} />;
  }

  return (
    <div className="auth-pila">
      <Pasos actual={1} />
      <form className="auth-form auth-form--compacto" onSubmit={enviar} noValidate>
        <div>
          <h2>Recuperar mi contraseña</h2>
          <p className="auth-aux">
            Te enviaremos un enlace de restablecimiento válido por {MINUTOS_VIGENCIA_ENLACE} minutos.
          </p>
        </div>

        <CampoFormulario
          id="rec-correo"
          etiqueta="Correo institucional"
          error={errorVisible}
          ayuda="Si la cuenta existe recibirás el enlace; por seguridad no informamos lo contrario."
        >
          <input
            id="rec-correo"
            className={`auth-input ${errorVisible ? 'auth-input--error' : ''}`}
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            onBlur={() => setTocado(true)}
            placeholder="nombre@aloe.ulima.edu.pe"
            autoComplete="username"
            disabled={cargando}
          />
        </CampoFormulario>

        <div className="auth-acciones">
          <Boton type="submit" disabled={cargando}>
            {cargando ? 'Enviando...' : 'Enviar enlace'}
          </Boton>
          <Link className="auth-enlace" to="/login">Volver a iniciar sesión</Link>
        </div>
      </form>
    </div>
  );
}


function EnlaceEnviado({ correo, tokenInicial }) {
  const [token, setToken] = useState(tokenInicial);
  const [segundos, setSegundos] = useState(SEGUNDOS_REENVIO);
  const [aviso, setAviso] = useState(null);

  // Cuenta regresiva para poder reenviar el enlace
  useEffect(() => {
    if (segundos <= 0) return undefined;
    const temporizador = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(temporizador);
  }, [segundos]);

  const reenviar = () => {
    setToken(solicitarRestablecimiento(correo).token);
    setSegundos(SEGUNDOS_REENVIO);
    setAviso({ tipo: 'exito', texto: `Enlace reenviado a ${correo}.` });
  };

  const tiempo = `0:${String(segundos).padStart(2, '0')}`;

  return (
    <div className="auth-pila">
      <Pasos actual={2} />
      <div className="auth-icono-exito" aria-hidden="true">✓</div>
      <div>
        <h2>Revisa tu correo</h2>
        <p className="auth-aux">
          Enviamos el enlace a <strong>{correo}</strong>. Vence en {MINUTOS_VIGENCIA_ENLACE} minutos.
        </p>
      </div>

      {aviso && (
        <div className={`auth-alerta auth-alerta--${aviso.tipo}`} role="status">
          {aviso.texto}
        </div>
      )}

      {token && (
        <div className="auth-alerta auth-alerta--info">
          Modo demostración: en esta entrega no se envían correos reales.{' '}
          <Link className="auth-enlace" to={`/recuperar/${token}`}>
            Abrir enlace de restablecimiento
          </Link>
        </div>
      )}

      <div className="auth-acciones">
        <Boton tipo="terciario" onClick={reenviar} disabled={segundos > 0}>
          {segundos > 0 ? `Reenviar enlace (disponible en ${tiempo})` : 'Reenviar enlace'}
        </Boton>
        <Link className="auth-enlace" to="/login">Volver a iniciar sesión</Link>
      </div>
    </div>
  );
}

// Medidor de seguridad: tres barras y una etiqueta
function MedidorContrasena({ contrasena }) {
  const nivel = calcularFortaleza(contrasena);

  return (
    <div className="auth-medidor" aria-live="polite">
      <div className="auth-medidor-barras">
        {[1, 2, 3].map((numero) => (
          <span
            key={numero}
            className={`auth-medidor-barra ${numero <= nivel ? `auth-medidor-barra--n${nivel}` : ''}`}
          />
        ))}
      </div>
      <span className={`auth-medidor-texto auth-medidor-texto--n${nivel}`}>
        {ETIQUETAS_FORTALEZA[nivel]}
      </span>
    </div>
  );
}


function NuevaContrasena({ token }) {
  const navegar = useNavigate();
  // Se consulta una sola vez al abrir: así la pantalla no cambia sola al guardar
  const [consulta] = useState(() => consultarEnlaceRestablecimiento(token));
  const [valores, setValores] = useState({ contrasena: '', confirmar: '' });
  const [tocados, setTocados] = useState({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState(null);

  if (consulta.situacion !== 'valido') {
    const mensaje = MENSAJES_ENLACE[consulta.situacion];
    return (
      <div className="auth-pila">
        <h2>{mensaje.titulo}</h2>
        <p className="auth-aux">{mensaje.texto}</p>
        <div className="auth-acciones">
          <Link className="auth-btn btn-primario" to="/recuperar">Solicitar nuevo enlace</Link>
          <Link className="auth-btn btn-secundario" to="/login">Iniciar sesión</Link>
        </div>
      </div>
    );
  }

  const errores = {
    contrasena: validarContrasena(valores.contrasena),
    confirmar: validarConfirmacion(valores.contrasena, valores.confirmar),
  };
  const errorVisible = (campo) => (tocados[campo] || intentoEnvio ? errores[campo] : '');
  const claseInput = (campo) => `auth-input ${errorVisible(campo) ? 'auth-input--error' : ''}`;

  const cambiar = (campo) => (evento) => {
    const valor = evento.target.value;
    setValores((previos) => ({ ...previos, [campo]: valor }));
  };
  const marcarTocado = (campo) => () => {
    setTocados((previos) => ({ ...previos, [campo]: true }));
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    setAviso(null);
    setIntentoEnvio(true);
    if (Object.values(errores).some(Boolean)) return;

    setCargando(true);
    await esperar(600);
    const resultado = restablecerContrasena(token, valores.contrasena);

    if (!resultado.ok) {
      setCargando(false);
      setAviso({ tipo: 'error', texto: resultado.mensaje });
      return;
    }

    setAviso({ tipo: 'exito', texto: 'Contraseña actualizada. Ya puedes iniciar sesión con la nueva.' });
    await esperar(1500);
    navegar('/login', { replace: true });
  };

  return (
    <div className="auth-pila">
      <Pasos actual={3} />
      <form className="auth-form" onSubmit={guardar} noValidate>
        <h2>Crea tu nueva contraseña</h2>

        {aviso && (
          <div className={`auth-alerta auth-alerta--${aviso.tipo}`} role="alert">
            {aviso.texto}
          </div>
        )}

        <CampoFormulario
          id="rec-nueva"
          etiqueta="Nueva contraseña"
          error={errorVisible('contrasena')}
          ayuda="Mínimo 8 caracteres, con una mayúscula y un número."
        >
          <input
            id="rec-nueva"
            className={claseInput('contrasena')}
            type="password"
            value={valores.contrasena}
            onChange={cambiar('contrasena')}
            onBlur={marcarTocado('contrasena')}
            autoComplete="new-password"
            disabled={cargando}
          />
          <MedidorContrasena contrasena={valores.contrasena} />
        </CampoFormulario>

        <CampoFormulario id="rec-confirmar" etiqueta="Confirmar" error={errorVisible('confirmar')}>
          <input
            id="rec-confirmar"
            className={claseInput('confirmar')}
            type="password"
            value={valores.confirmar}
            onChange={cambiar('confirmar')}
            onBlur={marcarTocado('confirmar')}
            autoComplete="new-password"
            disabled={cargando}
          />
        </CampoFormulario>

        <Boton type="submit" disabled={cargando}>
          {cargando ? 'Guardando...' : 'Guardar contraseña'}
        </Boton>
      </form>
    </div>
  );
}