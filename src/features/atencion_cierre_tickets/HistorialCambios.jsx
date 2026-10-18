import { Link, useParams } from 'react-router-dom';
import { useAtencion } from './ContextoAtencion';
import {
  calcularDuraciones,
  calcularTiempoPorEtapa,
  formatearDuracion,
  formatearFecha,
  formatearFechaCorta,
  minutosDeAtencion,
  nombreCompleto,
  nombreCorto,
  obtenerAmbiente,
  obtenerUsuario,
} from './servicioAtencion';

const COLOR_HITO = { 'Abierto': 'info', 'Asignado': 'primary', 'En atención': 'warning', 'En espera': 'muted', 'Resuelto': 'success', 'Cerrado': 'success', 'Reabierto': 'danger' };

// Vista 5.5: historial de cambios de estado con autor, momento y tiempo en cada etapa
export default function HistorialCambios() {
  const { id } = useParams();
  const { tickets, historiales } = useAtencion();
  const ticket = tickets.find((t) => t.id === id);

  if (!ticket) {
    return (
      <div className="atc-vacio">
        <h2>No encontramos el ticket {id}</h2>
        <p>Revisa el código o vuelve a tu bandeja para elegir otro ticket.</p>
        <Link to="/tecnico/bandeja" className="btn-secundario atc-enlace-boton">Volver a Mi bandeja</Link>
      </div>
    );
  }

  const ahora = new Date().toISOString();
  const eventos = historiales[ticket.id];
  const duraciones = calcularDuraciones(eventos, ahora);
  const { etapas, total } = calcularTiempoPorEtapa(eventos, ahora);
  const espera = etapas.find((e) => e.nombre === 'En espera');
  const ambiente = obtenerAmbiente(ticket.ambienteId);
  const cierre = eventos.find((e) => e.estado === 'Cerrado');

  const meta = [
    ticket.asunto,
    ambiente?.codigo,
    cierre && `cerrado el ${formatearFechaCorta(cierre.fecha)}`,
    `tiempo total ${formatearDuracion(minutosDeAtencion(ticket, eventos, ahora))}`,
  ].filter(Boolean).join(' · ');

  return (
    <>
      <p className="atc-ruta">
        <Link to="/tecnico/bandeja">Mi bandeja</Link> · <Link to={`/tecnico/ticket/${ticket.id}`} className="atc-codigo">{ticket.id}</Link> · Historial de cambios
      </p>
      <h1 className="atc-titulo">Historial de cambios</h1>
      <p className="atc-auxiliar atc-muted atc-meta">{meta}</p>

      <div className="atc-rejilla">
        <section className="atc-tarjeta">
          <ul className="atc-linea-tiempo">
            {duraciones.map((evento, i) => {
              const autor = obtenerUsuario(evento.autorId);
              const asignado = evento.estado === 'Asignado' ? obtenerUsuario(ticket.tecnicoAsignadoId) : null;
              return (
                <li key={i} className={`atc-hito atc-hito-${COLOR_HITO[evento.estado] || 'muted'}`}>
                  <strong>{evento.estado}{asignado && ` a ${nombreCorto(asignado)}`}</strong>
                  <p className="atc-auxiliar atc-muted">
                    {formatearFecha(evento.fecha)}
                    {autor && ` · ${nombreCompleto(autor)} (${autor.rol.toLowerCase()})`}
                    {evento.detalle && ` · ${evento.detalle}`}
                  </p>
                  {evento.minutos !== null && (
                    <p className="atc-auxiliar atc-muted">
                      {i === duraciones.length - 1 ? 'Lleva' : 'Permaneció'} {formatearDuracion(evento.minutos)} en este estado
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <div className="atc-columna">
          <section className="atc-tarjeta">
            <h3 className="atc-subtitulo">Tiempo por etapa</h3>
            {total === 0 ? (
              <p className="atc-auxiliar atc-muted">Todavía no hay tiempo registrado en este ticket.</p>
            ) : (
              <div className="atc-etapas">
                {etapas.map((etapa) => (
                  <div key={etapa.nombre}>
                    <div className="atc-etapa-fila">
                      <span>{etapa.nombre}</span>
                      <span className="atc-muted">{formatearDuracion(etapa.minutos)}</span>
                    </div>
                    <div className="atc-barra">
                      <div className={`atc-barra-relleno atc-relleno-${etapa.color}`} style={{ width: `${etapa.anchoBarra}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {espera && espera.minutos > 0 && (
            <p className="atc-aviso-alerta">
              El {espera.porcentajeDelTotal} % del tiempo se consumió en espera. El tiempo en espera no cuenta para el tiempo esperado de atención.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
