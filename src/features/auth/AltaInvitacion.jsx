import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Boton from '../../components/common/Boton';
import DialogoConfirmacion from '../../components/common/DialogoConfirmacion';
import { useAuth } from '../../context/AuthContext';
import CampoFormulario from './CampoFormulario';
import {
  ESPECIALIDADES_MAX,
  aceptarInvitacion,
  obtenerCategoriasActivas,
  obtenerInvitacion,
  rechazarInvitacion,
} from './servicioAuth';
import { validarConfirmacion, validarContrasena, validarTelefono } from './validaciones';

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

const formatearFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Lima',
  });

// Texto que se muestra cuando la invitación no se puede usar
const describirSituacion = ({ situacion, invitacion }) => {
  if (situacion === 'vencida') {
    return {
      titulo: 'Esta invitación venció',
      texto: `Era válida hasta el ${formatearFecha(invitacion.fechaExpiracion)}. Pide una nueva al área de Infraestructura.`,
    };
  }
  if (situacion === 'respondida') {
    return invitacion.estado === 'Aceptada'
      ? {
          titulo: 'Esta invitación ya fue aceptada',
          texto: 'Tu cuenta ya está activa. Inicia sesión con tu correo institucional.',
        }
      : {
          titulo: 'Esta invitación fue rechazada',
          texto: 'Si fue un error, pide una nueva al área de Infraestructura.',
        };
  }
  return {
    titulo: 'No encontramos esta invitación',
    texto:
      'El enlace puede estar incompleto o haber cambiado. Revisa el correo que recibiste o pide una nueva invitación al área de Infraestructura.',
  };
};

export default function AltaInvitacion() {
  const { id } = useParams();
  // Se consulta una sola vez al abrir: así la pantalla no cambia sola al activar la cuenta
  const [consulta] = useState(() => obtenerInvitacion(id));

  if (consulta.situacion === 'valida') {
    return <FormularioInvitacion invitacion={consulta.invitacion} />;
  }

  const mensaje = describirSituacion(consulta);
  return (
    <div className="auth-centro">
      <section className="auth-tarjeta auth-tarjeta-mensaje">
        <h2>{mensaje.titulo}</h2>
        <p className="auth-aux">{mensaje.texto}</p>
        <div className="auth-acciones">
          <Link className="auth-btn btn-primario" to="/">Ir al inicio</Link>
          <Link className="auth-btn btn-secundario" to="/login">Iniciar sesión</Link>
        </div>
      </section>
    </div>
  );
}

function FormularioInvitacion({ invitacion }) {
  const { iniciarSesion } = useAuth();
  const navegar = useNavigate();

  const categorias = obtenerCategoriasActivas();
  const esTecnico = invitacion.rol === 'Técnico';

  const [valores, setValores] = useState({
    telefono: '',
    contrasena: '',
    confirmar: '',
    especialidades: [],
  });
  const [tocados, setTocados] = useState({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo: 'error' | 'exito' | 'info', texto }
  const [confirmandoRechazo, setConfirmandoRechazo] = useState(false);

  const errores = {
    telefono: validarTelefono(valores.telefono),
    contrasena: validarContrasena(valores.contrasena),
    confirmar: validarConfirmacion(valores.contrasena, valores.confirmar),
    especialidades:
      esTecnico && valores.especialidades.length === 0 ? 'Elige al menos una especialidad' : '',
  };

  const errorVisible = (campo) =>
    !cargando && (tocados[campo] || intentoEnvio) ? errores[campo] : '';
  const claseInput = (campo) => `auth-input ${errorVisible(campo) ? 'auth-input--error' : ''}`;

  const cambiar = (campo) => (evento) => {
    const valor = evento.target.value;
    setValores((previos) => ({ ...previos, [campo]: valor }));
  };

  const marcarTocado = (campo) => () => {
    setTocados((previos) => ({ ...previos, [campo]: true }));
  };

  // Activa o desactiva una categoría; no deja elegir más de ESPECIALIDADES_MAX
  const alternarEspecialidad = (idCategoria) => {
    setTocados((previos) => ({ ...previos, especialidades: true }));
    setValores((previos) => {
      const actuales = previos.especialidades;
      if (actuales.includes(idCategoria)) {
        return { ...previos, especialidades: actuales.filter((e) => e !== idCategoria) };
      }
      if (actuales.length >= ESPECIALIDADES_MAX) return previos;
      return { ...previos, especialidades: [...actuales, idCategoria] };
    });
  };

  const activar = async (evento) => {
    evento.preventDefault();
    setAviso(null);
    setIntentoEnvio(true);
    if (Object.values(errores).some(Boolean)) return;

    setCargando(true);
    await esperar(600); // simula el tiempo de activación de la cuenta
    const resultado = aceptarInvitacion(invitacion.id, valores);

    if (!resultado.ok) {
      setCargando(false);
      setAviso({ tipo: 'error', texto: resultado.mensaje });
      return;
    }

    iniciarSesion(resultado.usuario.correo, valores.contrasena, false);
    setAviso({
      tipo: 'exito',
      texto: `Cuenta activada. Te damos la bienvenida, ${invitacion.nombres.split(' ')[0]}.`,
    });
    await esperar(1000);
    navegar('/dashboard', { replace: true });
  };

  const rechazar = async () => {
    setConfirmandoRechazo(false);
    const resultado = rechazarInvitacion(invitacion.id);

    if (!resultado.ok) {
      setAviso({ tipo: 'error', texto: resultado.mensaje });
      return;
    }

    setCargando(true);
    setAviso({
      tipo: 'info',
      texto: 'Invitación rechazada. Si fue un error, pide una nueva al área de Infraestructura.',
    });
    await esperar(1500);
    navegar('/', { replace: true });
  };

  const llenas = valores.especialidades.length >= ESPECIALIDADES_MAX;

  return (
    <div className="auth-centro auth-centro--registro">
      <section className="auth-tarjeta auth-tarjeta-invitacion">
        <form className="auth-form auth-form--invitacion" onSubmit={activar} noValidate>
          <span className="auth-insignia">
            Invitación válida hasta el {formatearFecha(invitacion.fechaExpiracion)}
          </span>

          <div>
            <h2>Activa tu cuenta de {invitacion.rol.toLowerCase()}</h2>
            <p className="auth-aux">
              {invitacion.invitadoPor} te invitó a la Mesa de Ayuda. Revisa tus datos, define tu
              contraseña{esTecnico ? ' y elige tu especialidad' : ''}.
            </p>
          </div>

          {aviso && (
            <div className={`auth-alerta auth-alerta--${aviso.tipo}`} role="alert">
              {aviso.texto}
            </div>
          )}

          <div className="auth-rejilla">
            <CampoFormulario
              id="inv-nombre"
              etiqueta="Nombres y apellidos"
              ayuda="Dato de la invitación, no editable."
            >
              <input
                id="inv-nombre"
                className="auth-input"
                value={`${invitacion.nombres} ${invitacion.apellidos}`}
                readOnly
              />
            </CampoFormulario>

            <CampoFormulario id="inv-correo" etiqueta="Correo institucional">
              <input id="inv-correo" className="auth-input" value={invitacion.correo} readOnly />
            </CampoFormulario>

            <CampoFormulario id="inv-rol" etiqueta="Rol asignado">
              <input id="inv-rol" className="auth-input" value={invitacion.rol} readOnly />
            </CampoFormulario>

            <CampoFormulario
              id="inv-telefono"
              etiqueta="Teléfono de contacto"
              error={errorVisible('telefono')}
            >
              <input
                id="inv-telefono"
                className={claseInput('telefono')}
                type="tel"
                value={valores.telefono}
                onChange={cambiar('telefono')}
                onBlur={marcarTocado('telefono')}
                placeholder="951220874"
                autoComplete="tel"
                disabled={cargando}
              />
            </CampoFormulario>

            <CampoFormulario
              id="inv-contrasena"
              etiqueta="Contraseña"
              error={errorVisible('contrasena')}
              ayuda="Mínimo 8 caracteres, con una mayúscula y un número."
            >
              <input
                id="inv-contrasena"
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
              id="inv-confirmar"
              etiqueta="Confirmar contraseña"
              error={errorVisible('confirmar')}
            >
              <input
                id="inv-confirmar"
                className={claseInput('confirmar')}
                type="password"
                value={valores.confirmar}
                onChange={cambiar('confirmar')}
                onBlur={marcarTocado('confirmar')}
                autoComplete="new-password"
                disabled={cargando}
              />
            </CampoFormulario>
          </div>

          {esTecnico && (
            <div className="auth-campo">
              <span className="auth-etiqueta" id="inv-especialidad">
                Especialidad · elige hasta tres categorías
              </span>
              <div className="auth-chips" role="group" aria-labelledby="inv-especialidad">
                {categorias.map((categoria) => {
                  const elegida = valores.especialidades.includes(categoria.id);
                  return (
                    <button
                      key={categoria.id}
                      type="button"
                      className={`auth-chip ${elegida ? 'auth-chip--activo' : ''}`}
                      aria-pressed={elegida}
                      onClick={() => alternarEspecialidad(categoria.id)}
                      disabled={cargando || (!elegida && llenas)}
                    >
                      {categoria.nombre}
                      {elegida ? ' ✓' : ''}
                    </button>
                  );
                })}
              </div>
              {errorVisible('especialidades') && (
                <span className="auth-ayuda auth-ayuda--error" role="alert">
                  {errorVisible('especialidades')}
                </span>
              )}
            </div>
          )}

          <div className="auth-acciones">
            <Boton type="submit" disabled={cargando}>
              {cargando ? 'Procesando...' : 'Activar mi cuenta'}
            </Boton>
            <Boton tipo="terciario" onClick={() => setConfirmandoRechazo(true)} disabled={cargando}>
              Rechazar invitación
            </Boton>
          </div>
        </form>
      </section>

      {confirmandoRechazo && (
        <DialogoConfirmacion
          titulo="Rechazar invitación"
          mensaje="¿Seguro que quieres rechazar esta invitación? No podrás usarla después y tendrás que pedir una nueva al área de Infraestructura."
          textoConfirmar="Sí, rechazar"
          onConfirmar={rechazar}
          onCancelar={() => setConfirmandoRechazo(false)}
        />
      )}
    </div>
  );
}