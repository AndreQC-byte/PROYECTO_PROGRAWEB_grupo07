import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEncuestas } from './ContextoEncuestas';
import EstadoVacio from './EstadoVacio';
import {
  detalleTicketEvaluado,
  formatearFecha,
  formatearPromedio,
  plazoEdicion,
  plazoRespuesta,
  plural,
  puedeEditar,
  resumenUsuario,
} from './servicioEncuestas';

// Vista 6.2: encuestas respondidas por el usuario, pendientes por responder y plazo de edición
export default function MisEncuestas() {
  const { usuario } = useAuth();
  const { encuestas, ahora } = useEncuestas();
  const { respondidas, pendientes, promedio } = resumenUsuario(encuestas, usuario.id, ahora);

  const resumen = [
    plural(respondidas.length, 'encuesta respondida', 'encuestas respondidas'),
    plural(pendientes.length, 'pendiente', 'pendientes'),
    promedio !== null && `promedio que diste: ${formatearPromedio(promedio)} de 5`,
  ].filter(Boolean).join(' · ');

  return (
    <>
      <h1 className="enc-titulo">Mis encuestas</h1>
      <p className="enc-auxiliar enc-muted enc-meta">{resumen}</p>

      {pendientes.map((encuesta) => (
        <div key={encuesta.id} className="enc-aviso-pendiente">
          <span>
            Tienes 1 encuesta pendiente del ticket <strong className="enc-codigo-texto">{encuesta.ticketId}</strong>.
            {' '}El plazo vence el {formatearFecha(plazoRespuesta(encuesta))}.
          </span>
          <Link to={`/encuestas/${encuesta.ticketId}`} className="enc-boton-alerta">Responder ahora</Link>
        </div>
      ))}

      {respondidas.length === 0 ? (
        <EstadoVacio
          titulo="Aún no respondes encuestas"
          texto="Cuando se cierre uno de tus tickets te pediremos calificar la atención."
        >
          <Link to="/mis-tickets" className="btn-primario enc-enlace-boton">Ver mis tickets</Link>
        </EstadoVacio>
      ) : (
        <div className="enc-tabla-marco">
          <table className="enc-tabla">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Asunto</th>
                <th>Técnico</th>
                <th>Respondida</th>
                <th>Puntaje</th>
                <th>Plazo de edición</th>
              </tr>
            </thead>
            <tbody>
              {respondidas.map((encuesta) => {
                const ticket = detalleTicketEvaluado(encuesta);
                const editable = puedeEditar(encuesta, ahora);
                return (
                  <tr key={encuesta.id}>
                    <td>
                      {editable ? (
                        <Link to={`/encuestas/${encuesta.ticketId}`} className="enc-codigo">{encuesta.ticketId}</Link>
                      ) : (
                        <span className="enc-codigo">{encuesta.ticketId}</span>
                      )}
                    </td>
                    <td>{ticket.asunto}</td>
                    <td>{ticket.tecnico}</td>
                    <td>{formatearFecha(encuesta.fechaRespuesta)}</td>
                    <td><strong className="enc-puntaje">{encuesta.puntajeGeneral} / 5</strong></td>
                    <td>
                      {editable ? (
                        <Link to={`/encuestas/${encuesta.ticketId}`} className="enc-enlace">
                          Editable hasta el {formatearFecha(plazoEdicion(encuesta))}
                        </Link>
                      ) : (
                        <span className="enc-muted">Plazo vencido</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
