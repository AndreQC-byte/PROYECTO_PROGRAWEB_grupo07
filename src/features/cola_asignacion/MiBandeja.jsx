import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as servicioCola from './servicioCola';
import EtiquetaPrioridad from '../../components/common/EtiquetaPrioridad';
import EtiquetaEstado from '../../components/common/EtiquetaEstado';
import db from '../../data/db.json';

const MiBandeja = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const estadoParam = searchParams.get('estado') || '';

  // Técnico actual (fallback a Julio Paredes si se accede en pruebas sin login específico)
  const tecnicoActualId = usuario?.id || 'USR-002';
  const nombreTecnico = usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Julio Paredes Soto';

  const [tickets, setTickets] = useState(() => servicioCola.obtenerTickets());
  const [filtroRapido, setFiltroRapido] = useState(estadoParam ? '' : 'todos'); // 'todos' | 'criticos' | 'fueraPlazo' | 'hoy'
  const [filtroEstado, setFiltroEstado] = useState(estadoParam);
  const [orden, setOrden] = useState('prioridad_plazo');

  const [notificacion, setNotificacion] = useState(null);

  const refrescar = () => {
    setTickets(servicioCola.obtenerTickets());
  };

  const categorias = useMemo(() => servicioCola.obtenerCategorias(), []);
  const ambientes = useMemo(() => servicioCola.obtenerAmbientes(), []);
  const usuarios = useMemo(() => db.usuarios || [], []);

  // Especialidades del técnico actual
  const especialidadesNombres = useMemo(() => {
    const tecObj = usuarios.find((u) => u.id === tecnicoActualId);
    const espIds = tecObj?.especialidades || ['CAT-001', 'CAT-004'];
    return espIds
      .map((id) => categorias.find((c) => c.id === id)?.nombre)
      .filter(Boolean)
      .join(' y ') || 'Audiovisuales y Redes';
  }, [usuarios, categorias, tecnicoActualId]);

  // Tickets asignados al técnico
  const misTickets = useMemo(() => {
    return tickets
      .filter((t) => t.tecnicoAsignadoId === tecnicoActualId)
      .map((t, index) => {
        const usr = usuarios.find((u) => u.id === t.usuarioId);
        const cat = categorias.find((c) => c.id === t.categoriaId);
        const amb = ambientes.find((a) => a.id === t.ambienteId);

        // Plazos simulados según Mockup 4.5
        const plazosMock = [
          { texto: 'Vence en 1 h 42 min', tipo: 'ok' },
          { texto: 'Vencido hace 1 h 50 min', tipo: 'vencido' },
          { texto: 'Vence en 6 h 50 min', tipo: 'ok' },
          { texto: 'Atendido a tiempo', tipo: 'ok' },
          { texto: 'Cerrado el 04/09/2026', tipo: 'ok' },
          { texto: 'Espera repuesto · retorno 09/09/2026', tipo: 'espera' },
          { texto: 'Vence en 2 h 30 min', tipo: 'ok' },
          { texto: 'Espera proveedor · retorno 11/09/2026', tipo: 'espera' },
        ];
        const plazo = plazosMock[index % plazosMock.length];

        return {
          ...t,
          solicitanteNombre: usr ? `${usr.nombres} ${usr.apellidos}` : 'Camila Quispe Ramos',
          categoriaNombre: cat ? cat.nombre : 'Audiovisuales',
          ambienteCodigo: amb ? amb.codigo : (t.ambiente || 'A-201'),
          plazoTexto: plazo.texto,
          plazoTipo: plazo.tipo,
        };
      });
  }, [tickets, tecnicoActualId, usuarios, categorias, ambientes]);

  // Contadores por estado de los asignados
  const contadores = useMemo(() => {
    return {
      abiertos: misTickets.filter((t) => t.estado === 'Abierto').length,
      enAtencion: misTickets.filter((t) => t.estado === 'En atención').length,
      enEspera: misTickets.filter((t) => t.estado === 'En espera').length,
      resueltos: misTickets.filter((t) => ['Resuelto', 'Cerrado'].includes(t.estado)).length,
      criticos: misTickets.filter((t) => t.prioridad === 'Crítica').length,
      fueraPlazo: misTickets.filter((t) => t.plazoTipo === 'vencido').length,
    };
  }, [misTickets]);

  // Tickets asignados filtrados
  const misTicketsFiltrados = useMemo(() => {
    return misTickets.filter((t) => {
      if (filtroEstado && t.estado !== filtroEstado) return false;
      if (filtroRapido === 'criticos' && t.prioridad !== 'Crítica') return false;
      if (filtroRapido === 'fueraPlazo' && t.plazoTipo !== 'vencido') return false;
      return true;
    });
  }, [misTickets, filtroEstado, filtroRapido]);

  // Tickets sin asignar en sus especialidades disponibles para autoasignación (Requerimiento HU-4)
  const ticketsAutoasignables = useMemo(() => {
    return servicioCola.obtenerTicketsDisponiblesParaTecnico(tecnicoActualId).map((t) => {
      const cat = categorias.find((c) => c.id === t.categoriaId);
      const amb = ambientes.find((a) => a.id === t.ambienteId);
      const usr = usuarios.find((u) => u.id === t.usuarioId);

      return {
        ...t,
        categoriaNombre: cat ? cat.nombre : 'General',
        ambienteCodigo: amb ? amb.codigo : (t.ambiente || 'A-201'),
        solicitanteNombre: usr ? `${usr.nombres} ${usr.apellidos}` : 'Usuario Ulima',
      };
    });
  }, [tickets, tecnicoActualId, categorias, ambientes, usuarios]);

  // Acción de Autoasignación
  const ejecutarAutoasignacion = (ticket) => {
    servicioCola.autoasignarTicket(ticket.id, tecnicoActualId);
    refrescar();
    setNotificacion({
      tipo: 'exito',
      mensaje: `Ticket ${ticket.id} autoasignado correctamente a tu bandeja de atención.`,
    });
  };

  return (
    <div className="cola-contenedor">
      {/* Banner de notificación */}
      {notificacion && (
        <div className={`notificacion-banner notificacion-${notificacion.tipo}`}>
          <span>{notificacion.mensaje}</span>
          <button
            type="button"
            className="btn-cerrar-modal"
            style={{ fontSize: '16px' }}
            onClick={() => setNotificacion(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Cabecera (Mockup 4.5) */}
      <div className="cola-cabecera">
        <div className="cola-titulo-seccion">
          <h1>Mi bandeja</h1>
          <p className="cola-subtitulo">
            {nombreTecnico} · {especialidadesNombres} · {misTickets.length} tickets asignados
          </p>
        </div>

        {/* Contadores por estado en cabecera */}
        <div className="cola-resumen-badges">
          <button
            type="button"
            className={`cola-badge-estado-btn ${filtroEstado === 'Abierto' ? 'activo' : ''}`}
            onClick={() => {
              setFiltroEstado(filtroEstado === 'Abierto' ? '' : 'Abierto');
              setFiltroRapido('');
            }}
          >
            <span>Abiertos</span>
            <span className="cola-badge-numero">{contadores.abiertos}</span>
          </button>
          <button
            type="button"
            className={`cola-badge-estado-btn ${filtroEstado === 'En atención' ? 'activo' : ''}`}
            onClick={() => {
              setFiltroEstado(filtroEstado === 'En atención' ? '' : 'En atención');
              setFiltroRapido('');
            }}
          >
            <span>En atención</span>
            <span className="cola-badge-numero">{contadores.enAtencion}</span>
          </button>
          <button
            type="button"
            className={`cola-badge-estado-btn ${filtroEstado === 'En espera' ? 'activo' : ''}`}
            onClick={() => {
              setFiltroEstado(filtroEstado === 'En espera' ? '' : 'En espera');
              setFiltroRapido('');
            }}
          >
            <span>En espera</span>
            <span className="cola-badge-numero">{contadores.enEspera}</span>
          </button>
          <button
            type="button"
            className={`cola-badge-estado-btn ${filtroEstado === 'Resuelto' ? 'activo' : ''}`}
            onClick={() => {
              setFiltroEstado(filtroEstado === 'Resuelto' ? '' : 'Resuelto');
              setFiltroRapido('');
            }}
          >
            <span>Resueltos</span>
            <span className="cola-badge-numero">{contadores.resueltos}</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros rápidos (Mockup 4.5) */}
      <div className="cola-filtros-barra" style={{ justifyContent: 'space-between' }}>
        <div className="bandeja-pildoras-filtro">
          <button
            type="button"
            className={`bandeja-pildora-btn ${filtroRapido === 'todos' && !filtroEstado ? 'activa' : ''}`}
            onClick={() => {
              setFiltroRapido('todos');
              setFiltroEstado('');
            }}
          >
            Todos ({misTickets.length})
          </button>
          <button
            type="button"
            className={`bandeja-pildora-btn ${filtroRapido === 'criticos' ? 'activa' : ''}`}
            onClick={() => {
              setFiltroRapido('criticos');
              setFiltroEstado('');
            }}
          >
            Solo críticos ({contadores.criticos})
          </button>
          <button
            type="button"
            className={`bandeja-pildora-btn ${filtroRapido === 'fueraPlazo' ? 'activa' : ''}`}
            onClick={() => {
              setFiltroRapido('fueraPlazo');
              setFiltroEstado('');
            }}
          >
            Fuera de plazo ({contadores.fueraPlazo})
          </button>
          <button
            type="button"
            className={`bandeja-pildora-btn ${filtroRapido === 'hoy' ? 'activa' : ''}`}
            onClick={() => {
              setFiltroRapido('hoy');
              setFiltroEstado('');
            }}
          >
            Hoy
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Orden:</span>
          <select
            className="cola-select-filtro"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="prioridad_plazo">Prioridad y plazo</option>
            <option value="antiguedad">Antigüedad</option>
            <option value="codigo">Código</option>
          </select>
        </div>
      </div>

      {/* Tabla de Tickets de la Bandeja (Mockup 4.5) */}
      {misTicketsFiltrados.length === 0 ? (
        <div className="catalogo-vacio-caja">
          <div className="catalogo-vacio-icono">📥</div>
          <div className="catalogo-vacio-titulo">Sin tickets asignados</div>
          <p className="catalogo-vacio-desc">
            Cuando el supervisor te asigne un ticket o te autoasignes uno disponible de tus categorías, aparecerá aquí.
          </p>
        </div>
      ) : (
        <table className="cola-tabla">
          <thead>
            <tr>
              <th style={{ width: '14%' }}>CÓDIGO</th>
              <th style={{ width: '24%' }}>ASUNTO</th>
              <th style={{ width: '16%' }}>CATEGORÍA</th>
              <th style={{ width: '8%' }}>AMBIENTE</th>
              <th style={{ width: '14%' }}>SOLICITANTE</th>
              <th style={{ width: '8%' }}>PRIORIDAD</th>
              <th style={{ width: '9%' }}>ESTADO</th>
              <th style={{ width: '15%' }}>PLAZO</th>
              <th style={{ width: '10%', textAlign: 'right' }}>ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {misTicketsFiltrados.map((ticket) => {
              const prioridadClase = ticket.prioridad ? `prioridad-${ticket.prioridad}` : '';

              return (
                <tr key={ticket.id} className={`cola-fila-ticket ${prioridadClase}`}>
                  <td>
                    <span className="cola-codigo-mono">{ticket.id}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{ticket.asunto}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{ticket.categoriaNombre}</td>
                  <td style={{ fontWeight: 600 }}>{ticket.ambienteCodigo}</td>
                  <td className="cola-solicitante-celda">{ticket.solicitanteNombre}</td>
                  <td>
                    <EtiquetaPrioridad prioridad={ticket.prioridad} />
                  </td>
                  <td>
                    <EtiquetaEstado estado={ticket.estado} />
                  </td>
                  <td>
                    <span
                      className={`bandeja-plazo-texto ${
                        ticket.plazoTipo === 'vencido'
                          ? 'bandeja-plazo-vencido'
                          : ticket.plazoTipo === 'espera'
                          ? 'bandeja-plazo-por-vencer'
                          : 'bandeja-plazo-ok'
                      }`}
                    >
                      {ticket.plazoTexto}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn-secundario"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      onClick={() => navigate(`/tecnico/ticket/${ticket.id}`)}
                    >
                      Abrir bitácora
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Alerta de ticket retrasado (Mockup 4.5) */}
      {contadores.fueraPlazo > 0 && (
        <div className="bandeja-alerta-retraso">
          <div>
            <strong>1 ticket fuera del tiempo esperado: </strong>
            <span>TCK-2026-00140 lleva 1 h 50 min de retraso. Atiéndelo o cámbialo a En espera con motivo.</span>
          </div>
          <button
            type="button"
            className="btn-destructivo"
            style={{ padding: '4px 10px', fontSize: '12px' }}
            onClick={() => navigate('/tecnico/ticket/TCK-2026-00140')}
          >
            Atender ahora
          </button>
        </div>
      )}

      {/* SECCIÓN DE AUTOASIGNACIÓN (Requerimiento HU-4: Autoasignación por parte del técnico sobre los tickets de sus categorías) */}
      <div className="bandeja-seccion-autoasignar">
        <div className="bandeja-seccion-autoasignar-cabecera">
          <div>
            <h3 style={{ fontSize: '15px', margin: 0, color: 'var(--color-primary)' }}>
              Disponibles en mis categorías (Autoasignación)
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Tickets sin asignar correspondientes a tus especialidades ({especialidadesNombres}).
            </span>
          </div>
          <span className="badge-conteo">{ticketsAutoasignables.length} disponibles</span>
        </div>

        {ticketsAutoasignables.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
            No hay tickets pendientes de asignar en tus categorías actualmente.
          </div>
        ) : (
          <table className="cola-tabla">
            <thead>
              <tr>
                <th style={{ width: '14%' }}>CÓDIGO</th>
                <th style={{ width: '30%' }}>ASUNTO</th>
                <th style={{ width: '18%' }}>CATEGORÍA</th>
                <th style={{ width: '10%' }}>AMBIENTE</th>
                <th style={{ width: '10%' }}>PRIORIDAD</th>
                <th style={{ width: '18%', textAlign: 'right' }}>ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {ticketsAutoasignables.map((ticket) => (
                <tr key={ticket.id} className="cola-fila-ticket">
                  <td>
                    <span className="cola-codigo-mono">{ticket.id}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{ticket.asunto}</td>
                  <td>{ticket.categoriaNombre}</td>
                  <td style={{ fontWeight: 600 }}>{ticket.ambienteCodigo}</td>
                  <td>
                    <EtiquetaPrioridad prioridad={ticket.prioridad} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn-primario"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => ejecutarAutoasignacion(ticket)}
                    >
                      Autoasignarme
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MiBandeja;
