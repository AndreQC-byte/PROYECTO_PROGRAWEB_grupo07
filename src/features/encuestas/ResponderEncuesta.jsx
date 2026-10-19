import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Boton from '../../components/common/Boton';
import DialogoConfirmacion from '../../components/common/DialogoConfirmacion';
import { useAuth } from '../../context/AuthContext';
import { useEncuestas } from './ContextoEncuestas';
import EstadoVacio from './EstadoVacio';
import SelectorPuntaje from './SelectorPuntaje';
import {
  ASPECTOS,
  DIAS_PLAZO,
  detalleTicketEvaluado,
  estadoEncuesta,
  ETIQUETA_PUNTAJE,
  formatearDuracion,
  formatearFecha,
  LIMITE_COMENTARIO,
  plazoEdicion,
  plazoRespuesta,
  puedeEditar,
  validarRespuesta,
} from './servicioEncuestas';

const CAMPOS = ['puntajeGeneral', ...ASPECTOS.map((a) => a.campo)];

const VolverAMisEncuestas = () => (
  <Link to="/encuestas" className="btn-secundario enc-enlace-boton">Ver mis encuestas</Link>
);

// Vista 6.1: el usuario califica la atención de un ticket cerrado o edita su respuesta dentro del plazo
export default function ResponderEncuesta() {
  const { ticketId } = useParams();
  const { usuario } = useAuth();
  const { encuestas, ahora } = useEncuestas();
  const encuesta = encuestas.find((e) => e.ticketId === ticketId && e.usuarioId === usuario.id);

  if (!encuesta) {
    return (
      <EstadoVacio
        titulo={`No encontramos una encuesta para el ticket ${ticketId}`}
        texto="Revisa el código o vuelve a tus encuestas para elegir otra."
      >
        <VolverAMisEncuestas />
      </EstadoVacio>
    );
  }

  const estado = estadoEncuesta(encuesta, ahora);

  if (estado === 'Vencida') {
    return (
      <EstadoVacio
        titulo="El plazo para responder esta encuesta venció"
        texto={`La encuesta del ticket ${ticketId} estuvo disponible hasta el ${formatearFecha(plazoRespuesta(encuesta))}.`}
      >
        <VolverAMisEncuestas />
      </EstadoVacio>
    );
  }

  if (estado === 'Respondida' && !puedeEditar(encuesta, ahora)) {
    return (
      <EstadoVacio
        titulo="Esta encuesta ya no se puede editar"
        texto={`Tu respuesta del ticket ${ticketId} se podía editar hasta el ${formatearFecha(plazoEdicion(encuesta))}.`}
      >
        <VolverAMisEncuestas />
      </EstadoVacio>
    );
  }

  // La "key" reinicia el formulario si se pasa de una encuesta a otra sin salir de la vista
  return <FormularioEncuesta key={encuesta.id} encuesta={encuesta} />;
}

function FormularioEncuesta({ encuesta }) {
  const navigate = useNavigate();
  const { guardarRespuesta, notificar } = useEncuestas();
  const editando = encuesta.estado === 'Respondida';
  const inicial = {
    ...Object.fromEntries(CAMPOS.map((campo) => [campo, encuesta[campo] ?? null])),
    comentario: encuesta.comentario || '',
  };
  const [respuesta, setRespuesta] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [confirmarSalida, setConfirmarSalida] = useState(false);

  const ticket = detalleTicketEvaluado(encuesta);
  const hayCambios = [...CAMPOS, 'comentario'].some((campo) => respuesta[campo] !== inicial[campo]);

  const cambiar = (campo, valor) => {
    setRespuesta({ ...respuesta, [campo]: valor });
    setErrores({ ...errores, [campo]: '' });
  };

  const enviar = (e) => {
    e.preventDefault();
    const nuevosErrores = validarRespuesta(respuesta);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const guardada = guardarRespuesta(encuesta.id, { ...respuesta, comentario: respuesta.comentario.trim() });
    if (!guardada) {
      notificar('error', `No se guardó: el plazo de la encuesta del ticket ${encuesta.ticketId} ya venció.`);
      return;
    }
    notificar(
      'exito',
      editando
        ? `Actualizamos tu encuesta del ticket ${encuesta.ticketId}.`
        : `Gracias, registramos tu encuesta del ticket ${encuesta.ticketId}.`
    );
    navigate('/encuestas');
  };

  const salir = () => (hayCambios ? setConfirmarSalida(true) : navigate('/encuestas'));

  return (
    <>
      <h1 className="enc-titulo">{editando ? 'Edita tu calificación' : '¿Cómo fue la atención de tu ticket?'}</h1>
      <p className="enc-auxiliar enc-muted enc-meta">
        Tu respuesta ayuda al área de Infraestructura a mejorar los tiempos y el trato. Toma menos de un minuto.
      </p>

      <div className="enc-rejilla">
        <form className="enc-tarjeta enc-formulario" onSubmit={enviar} noValidate>
          <fieldset className="enc-grupo">
            <legend className="enc-etiqueta-campo">Puntaje general</legend>
            <div className="enc-fila-puntaje">
              <SelectorPuntaje
                grande
                etiqueta="Puntaje general"
                valor={respuesta.puntajeGeneral}
                invalido={Boolean(errores.puntajeGeneral)}
                onCambiar={(valor) => cambiar('puntajeGeneral', valor)}
              />
              {respuesta.puntajeGeneral && (
                <span className="enc-puntaje-texto">
                  {respuesta.puntajeGeneral} · {ETIQUETA_PUNTAJE[respuesta.puntajeGeneral]}
                </span>
              )}
            </div>
            {errores.puntajeGeneral && <p className="enc-error">{errores.puntajeGeneral}</p>}
          </fieldset>

          <fieldset className="enc-grupo">
            <legend className="enc-etiqueta-campo">Calificación por aspectos</legend>
            {ASPECTOS.map(({ campo, nombre }) => (
              <div key={campo} className="enc-aspecto">
                <span className="enc-aspecto-nombre">{nombre}</span>
                <div>
                  <SelectorPuntaje
                    etiqueta={nombre}
                    valor={respuesta[campo]}
                    invalido={Boolean(errores[campo])}
                    onCambiar={(valor) => cambiar(campo, valor)}
                  />
                  {errores[campo] && <p className="enc-error">{errores[campo]}</p>}
                </div>
              </div>
            ))}
          </fieldset>

          <div className="enc-campo">
            <label htmlFor="comentario-encuesta">Comentario (opcional)</label>
            <textarea
              id="comentario-encuesta"
              rows="4"
              value={respuesta.comentario}
              aria-invalid={Boolean(errores.comentario)}
              onChange={(e) => cambiar('comentario', e.target.value)}
              placeholder="Cuéntanos qué salió bien o qué podríamos mejorar..."
            />
            <div className="enc-ayuda">
              <span>Tu comentario lo lee el supervisor del área; el técnico lo ve sin tu nombre.</span>
              <span className={respuesta.comentario.trim().length > LIMITE_COMENTARIO ? 'enc-texto-peligro' : ''}>
                {respuesta.comentario.trim().length}/{LIMITE_COMENTARIO}
              </span>
            </div>
            {errores.comentario && <p className="enc-error">{errores.comentario}</p>}
          </div>

          <div className="enc-acciones">
            <Boton type="submit">{editando ? 'Guardar cambios' : 'Enviar encuesta'}</Boton>
            <button type="button" className="enc-terciario" onClick={salir}>
              {editando ? 'Cancelar' : 'Responder después'}
            </button>
          </div>
        </form>

        <div className="enc-columna">
          <section className="enc-tarjeta">
            <h3 className="enc-subtitulo">Ticket evaluado</h3>
            <p className="enc-codigo enc-codigo-grande">{ticket.codigo}</p>
            <p className="enc-auxiliar enc-muted">{ticket.asunto}</p>
            <dl className="enc-datos">
              <dt>Categoría</dt><dd>{ticket.categoria}</dd>
              <dt>Ambiente</dt><dd className="enc-codigo">{ticket.ambiente}</dd>
              <dt>Técnico</dt><dd>{ticket.tecnico}</dd>
              <dt>Cerrado</dt><dd>{formatearFecha(ticket.fechaCierre)}</dd>
              <dt>Tiempo de atención</dt><dd>{formatearDuracion(ticket.minutosAtencion)}</dd>
            </dl>
          </section>

          <p className="enc-aviso-info">
            {editando
              ? `Puedes editar tu respuesta hasta el ${formatearFecha(plazoEdicion(encuesta))}.`
              : `Responde antes del ${formatearFecha(plazoRespuesta(encuesta))}. Puedes editar tu respuesta hasta ${DIAS_PLAZO} días después de enviarla.`}
          </p>
        </div>
      </div>

      {confirmarSalida && (
        <DialogoConfirmacion
          titulo={editando ? '¿Descartar los cambios?' : '¿Salir sin enviar la encuesta?'}
          mensaje={
            editando
              ? 'Tu respuesta anterior se mantiene; los cambios que hiciste ahora se perderán.'
              : `Se perderán las calificaciones que marcaste. Podrás responder hasta el ${formatearFecha(plazoRespuesta(encuesta))}.`
          }
          textoConfirmar={editando ? 'Descartar cambios' : 'Salir sin enviar'}
          onConfirmar={() => navigate('/encuestas')}
          onCancelar={() => setConfirmarSalida(false)}
        />
      )}
    </>
  );
}
