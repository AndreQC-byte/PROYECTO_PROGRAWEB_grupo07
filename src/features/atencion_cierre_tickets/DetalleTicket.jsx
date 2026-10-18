import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Boton from '../../components/common/Boton';
import EtiquetaEstado from '../../components/common/EtiquetaEstado';
import EtiquetaPrioridad from '../../components/common/EtiquetaPrioridad';
import Bitacora from '../../components/ticket/Bitacora';
import { useAtencion } from './ContextoAtencion';
import ModalCambiarEstado from './ModalCambiarEstado';
import ModalCerrarTicket from './ModalCerrarTicket';
import {
  calcularDuraciones,
  formatearDuracion,
  formatearFecha,
  formatearFechaCorta,
  formatearHora,
  iniciales,
  minutosDeAtencion,
  minutosParaVencer,
  nombreCompleto,
  nombreCorto,
  obtenerAmbiente,
  obtenerCategoria,
  obtenerSubcategoria,
  obtenerUsuario,
  puedeCerrar,
  TRANSICIONES,
} from './servicioAtencion';

// Vista 5.1 (detalle del ticket para el técnico) y 5.2 (entrada de bitácora)
export default function DetalleTicket() {
  const { id } = useParams();
  const { tickets, historiales, notificar, agregarEntradaBitacora, cambiarEstado, cerrarTicket } = useAtencion();
  const [modal, setModal] = useState(null); // 'estado' | 'cierre' | null
  const [tipoEntrada, setTipoEntrada] = useState('Nota Interna');
  const [texto, setTexto] = useState('');
  const [errorEntrada, setErrorEntrada] = useState('');

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

  const eventos = historiales[ticket.id];
  const ahora = new Date().toISOString();
  const solicitante = obtenerUsuario(ticket.usuarioId);
  const ambiente = obtenerAmbiente(ticket.ambienteId);
  const categoria = obtenerCategoria(ticket.categoriaId);
  const subcategoria = obtenerSubcategoria(ticket.subcategoriaId);
  const cerrado = ticket.estado === 'Cerrado';
  const minutosRestantes = minutosParaVencer(ticket, eventos, ahora);
  const duraciones = calcularDuraciones(eventos, ahora);
  const actual = duraciones[duraciones.length - 1];
  const esInterna = tipoEntrada === 'Nota Interna';

  const entradas = ticket.bitacora.map((b) => {
    const autor = obtenerUsuario(b.autorId);
    return {
      ...b,
      fecha: formatearFecha(b.fecha),
      autor: { nombre: nombreCorto(autor), rol: autor?.rol || 'Usuario', iniciales: iniciales(autor) },
    };
  });

  const guardarEntrada = (e) => {
    e.preventDefault();
    if (!texto.trim()) {
      setErrorEntrada(esInterna ? 'Escribe el detalle de la nota interna' : 'Escribe el comentario público');
      return;
    }
    agregarEntradaBitacora(ticket.id, tipoEntrada, texto.trim());
    notificar('exito', esInterna ? 'Nota interna guardada en la bitácora.' : 'Comentario público publicado en la bitácora.');
    setTexto('');
    setErrorEntrada('');
  };

  const guardarEstado = (nuevoEstado, datos) => {
    cambiarEstado(ticket.id, nuevoEstado, datos);
    setModal(null);
    notificar('exito', `El ticket ${ticket.id} pasó a «${nuevoEstado}».`);
  };

  const cerrar = (solucion) => {
    cerrarTicket(ticket.id, solucion);
    setModal(null);
    notificar('exito', `El ticket ${ticket.id} fue cerrado. Se envió la encuesta de satisfacción al usuario.`);
  };

  return (
    <>
      <div className="atc-cabecera-ticket">
        <div>
          <div className="atc-fila-codigo">
            <h1 className="atc-codigo-ticket">{ticket.id}</h1>
            <EtiquetaPrioridad prioridad={ticket.prioridad} />
            <EtiquetaEstado estado={ticket.estado} />
            {!cerrado && (
              <span className={minutosRestantes < 0 ? 'atc-plazo atc-plazo-vencido' : 'atc-plazo'}>
                {minutosRestantes < 0
                  ? `Vencido hace ${formatearDuracion(-minutosRestantes)}`
                  : `Vence en ${formatearDuracion(minutosRestantes)}`}
              </span>
            )}
          </div>
          <h2 className="atc-asunto">{ticket.asunto} · {categoria?.nombre}</h2>
        </div>

        <div className="atc-acciones">
          <Boton onClick={() => setModal('estado')} disabled={(TRANSICIONES[ticket.estado] || []).length === 0}>
            Cambiar estado
          </Boton>
          <Boton tipo="secundario" onClick={() => setModal('cierre')} disabled={!puedeCerrar(ticket.estado)}>
            Cerrar ticket
          </Boton>
          <Link to={`/tecnico/ticket/${ticket.id}/historial`} className="atc-terciario">Historial</Link>
        </div>
      </div>

      <div className="atc-rejilla">
        <Bitacora entradas={entradas} conFiltro>
          {cerrado ? (
            <p className="atc-aviso-info">Este ticket está cerrado: la bitácora ya no admite nuevas entradas.</p>
          ) : (
            <form className={`atc-nueva-entrada ${esInterna ? 'atc-nueva-entrada-interna' : ''}`} onSubmit={guardarEntrada} noValidate>
              <div className="atc-pestanas">
                <button type="button" className={`atc-pestana ${!esInterna ? 'atc-pestana-activa' : ''}`} onClick={() => setTipoEntrada('Comentario Público')}>
                  Comentario público
                </button>
                <button type="button" className={`atc-pestana ${esInterna ? 'atc-pestana-activa atc-pestana-interna' : ''}`} onClick={() => setTipoEntrada('Nota Interna')}>
                  Nota interna
                </button>
                <span className="atc-pista">
                  {esInterna
                    ? 'Estás escribiendo una nota interna: solo la ve el equipo técnico y el supervisor.'
                    : 'Estás escribiendo un comentario público: el usuario lo verá en su bitácora.'}
                </span>
              </div>
              <textarea
                rows="3"
                value={texto}
                aria-label="Detalle de la entrada"
                aria-invalid={Boolean(errorEntrada)}
                onChange={(e) => { setTexto(e.target.value); setErrorEntrada(''); }}
                placeholder={esInterna ? 'Escribe aquí el detalle de la nota interna...' : 'Escribe aquí el comentario para el usuario...'}
              />
              {errorEntrada && <p className="atc-error">{errorEntrada}</p>}
              <div className="atc-acciones-entrada">
                <button type="submit" className={esInterna ? 'btn-primario atc-btn-acento' : 'btn-primario'}>
                  {esInterna ? 'Guardar nota interna' : 'Publicar comentario'}
                </button>
              </div>
            </form>
          )}
        </Bitacora>

        <div className="atc-columna">
          <section className="atc-tarjeta">
            <h3 className="atc-subtitulo">Datos del reporte</h3>
            <dl className="atc-datos">
              <dt>Solicitante</dt><dd>{nombreCorto(solicitante)}</dd>
              <dt>Teléfono</dt><dd>{solicitante?.telefono || 'No registrado'}</dd>
              <dt>Subcategoría</dt><dd>{subcategoria?.nombre || 'Sin subcategoría'}</dd>
              <dt>Registrado</dt><dd>{formatearFecha(ticket.fechaRegistro)}</dd>
            </dl>
            <blockquote className="atc-cita">«{ticket.descripcion}»</blockquote>
          </section>

          <section className="atc-tarjeta">
            <h3 className="atc-subtitulo">Ambiente</h3>
            {ambiente ? (
              <>
                <strong className="atc-codigo atc-ambiente-codigo">{ambiente.codigo}</strong>
                <p className="atc-auxiliar atc-muted">
                  {ambiente.tipo} · Pabellón {ambiente.pabellon} · piso {ambiente.piso} · capacidad {ambiente.capacidad} · {ambiente.sede}
                </p>
                <p className="atc-auxiliar">
                  {tickets.filter((t) => t.ambienteId === ambiente.id && t.estado !== 'Cerrado').length} ticket(s) abierto(s) en este ambiente
                </p>
              </>
            ) : (
              <p className="atc-auxiliar atc-muted">Este ticket no tiene un ambiente asociado.</p>
            )}
          </section>

          <section className="atc-tarjeta">
            <h3 className="atc-subtitulo">Historial reciente</h3>
            <p className="atc-auxiliar atc-muted">
              {duraciones.map((d, i) => (
                <span key={i}>{i > 0 && ' → '}{d.estado} {formatearHora(d.fecha)}</span>
              ))}
              {actual?.minutos !== null && ` · ${formatearDuracion(actual.minutos)} transcurridos`}
            </p>
            {cerrado && <p className="atc-auxiliar atc-muted">Cerrado el {formatearFechaCorta(eventos[eventos.length - 1].fecha)} por {nombreCompleto(obtenerUsuario(eventos[eventos.length - 1].autorId))}.</p>}
          </section>
        </div>
      </div>

      {modal === 'estado' && (
        <ModalCambiarEstado ticket={ticket} onGuardar={guardarEstado} onCancelar={() => setModal(null)} />
      )}
      {modal === 'cierre' && (
        <ModalCerrarTicket
          ticket={ticket}
          solicitante={nombreCorto(solicitante)}
          minutosAtencion={minutosDeAtencion(ticket, eventos, ahora)}
          onCerrar={cerrar}
          onCancelar={() => setModal(null)}
        />
      )}
    </>
  );
}
