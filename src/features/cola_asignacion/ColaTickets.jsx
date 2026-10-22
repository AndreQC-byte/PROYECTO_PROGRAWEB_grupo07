import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as servicioCola from './servicioCola';
import EtiquetaPrioridad from '../../components/common/EtiquetaPrioridad';
import EtiquetaEstado from '../../components/common/EtiquetaEstado';
import DialogoConfirmacion from '../../components/common/DialogoConfirmacion';
import db from '../../data/db.json';

const PRIORIDADES_PESO = { Crítica: 1, Alta: 2, Media: 3, Baja: 4 };

const ColaTickets = () => {
  const [searchParams] = useSearchParams();
  const busquedaParam = searchParams.get('buscar') || '';

  const [tickets, setTickets] = useState(() => servicioCola.obtenerTickets());
  const [seleccionados, setSeleccionados] = useState([]);

  // Filtros
  const [buscar, setBuscar] = useState(busquedaParam);
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroAmbiente, setFiltroAmbiente] = useState('');
  const [orden, setOrden] = useState('antiguedad'); // 'antiguedad' | 'prioridad' | 'sinatencion'

  // Notificación de resultado (Requerimiento obligatorio)
  const [notificacion, setNotificacion] = useState(null);

  // Modales
  const [modalAsignar, setModalAsignar] = useState(false);
  const [modalPrioridad, setModalPrioridad] = useState(false);
  const [modalDevolver, setModalDevolver] = useState(false);

  // Datos del modal de asignación (Mockup 4.2)
  const [tecnicoSeleccionadoId, setTecnicoSeleccionadoId] = useState('');
  const [notaTecnico, setNotaTecnico] = useState('');
  const [motivoReasignacion, setMotivoReasignacion] = useState('');
  const [errorAsignacion, setErrorAsignacion] = useState('');

  // Datos del modal de cambio de prioridad (Mockup 4.3)
  const [nuevaPrioridad, setNuevaPrioridad] = useState('Crítica');
  const [motivoPrioridad, setMotivoPrioridad] = useState('');
  const [errorPrioridad, setErrorPrioridad] = useState('');

  // Sincronizar parámetro de búsqueda URL
  useEffect(() => {
    if (busquedaParam) {
      setBuscar(busquedaParam);
    }
  }, [busquedaParam]);

  const refrescarTickets = () => {
    setTickets(servicioCola.obtenerTickets());
  };

  const estadisticas = useMemo(() => servicioCola.obtenerEstadisticasCola(), [tickets]);

  // Técnicos, Categorías, Ambientes
  const tecnicos = useMemo(() => servicioCola.obtenerTecnicos(), []);
  const categorias = useMemo(() => servicioCola.obtenerCategorias(), []);
  const ambientes = useMemo(() => servicioCola.obtenerAmbientes(), []);
  const usuarios = useMemo(() => db.usuarios || [], []);
  const subcategorias = useMemo(() => db.subcategorias || [], []);

  // Enriquecer tickets con nombres de solicitante, categoría, etc.
  const ticketsEnriquecidos = useMemo(() => {
    return tickets.map((t, index) => {
      const usr = usuarios.find((u) => u.id === t.usuarioId);
      const cat = categorias.find((c) => c.id === t.categoriaId);
      const sub = subcategorias.find((s) => s.id === t.subcategoriaId);
      const amb = ambientes.find((a) => a.id === t.ambienteId);
      const tec = tecnicos.find((u) => u.id === t.tecnicoAsignadoId);

      // Antigüedad simulada/calculada para fidelidad con Mockup 4.1
      const antiguedadesMock = ['18 min', '42 min', '1 h 10 min', '1 h 35 min', '2 h 05 min', '2 h 40 min', '3 h 15 min', '3 h 50 min', '4 h 20 min', '5 h 05 min', '6 h 30 min', '8 h 10 min', '10 h 45 min'];
      const minutosMock = [18, 42, 70, 95, 125, 160, 195, 230, 260, 305, 390, 490, 645];

      const antiguedadTexto = antiguedadesMock[index % antiguedadesMock.length];
      const antiguedadMinutos = minutosMock[index % minutosMock.length];

      return {
        ...t,
        solicitanteNombre: usr ? `${usr.nombres} ${usr.apellidos}` : 'Usuario Ulima',
        categoriaNombre: cat ? cat.nombre : 'General',
        subcategoriaNombre: sub ? sub.nombre : '',
        ambienteCodigo: amb ? amb.codigo : (t.ambiente || 'A-201'),
        tecnicoNombre: tec ? `${tec.nombres} ${tec.apellidos}` : 'Sin asignar',
        antiguedadTexto,
        antiguedadMinutos,
      };
    });
  }, [tickets, usuarios, categorias, subcategorias, ambientes, tecnicos]);

  // Filtrado
  const ticketsFiltrados = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    return ticketsEnriquecidos.filter((t) => {
      const coincideQ =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.asunto.toLowerCase().includes(q) ||
        t.solicitanteNombre.toLowerCase().includes(q) ||
        t.ambienteCodigo.toLowerCase().includes(q);
      const coincidePrioridad = !filtroPrioridad || t.prioridad === filtroPrioridad;
      const coincideEstado = !filtroEstado || t.estado === filtroEstado;
      const coincideCategoria = !filtroCategoria || t.categoriaId === filtroCategoria;
      const coincideAmbiente = !filtroAmbiente || t.ambienteCodigo === filtroAmbiente;

      return coincideQ && coincidePrioridad && coincideEstado && coincideCategoria && coincideAmbiente;
    });
  }, [ticketsEnriquecidos, buscar, filtroPrioridad, filtroEstado, filtroCategoria, filtroAmbiente]);

  // Ordenamiento
  const ticketsOrdenados = useMemo(() => {
    const copia = [...ticketsFiltrados];
    if (orden === 'prioridad') {
      copia.sort((a, b) => (PRIORIDADES_PESO[a.prioridad] || 4) - (PRIORIDADES_PESO[b.prioridad] || 4));
    } else if (orden === 'sinatencion') {
      copia.sort((a, b) => b.antiguedadMinutos - a.antiguedadMinutos);
    } else {
      // Por antigüedad (los más antiguos primero o según registro)
      copia.sort((a, b) => b.antiguedadMinutos - a.antiguedadMinutos);
    }
    return copia;
  }, [ticketsFiltrados, orden]);

  // Manejo de Selección
  const toggleSeleccionarTodo = () => {
    if (seleccionados.length === ticketsOrdenados.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(ticketsOrdenados.map((t) => t.id));
    }
  };

  const toggleSeleccionarUno = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const limpiarFiltros = () => {
    setBuscar('');
    setFiltroPrioridad('');
    setFiltroEstado('');
    setFiltroCategoria('');
    setFiltroAmbiente('');
  };

  // Filtrar técnicos habilitados para los tickets seleccionados (Mockup 4.2)
  const tecnicosHabilitados = useMemo(() => {
    const catsSeleccionadas = new Set(
      tickets.filter((t) => seleccionados.includes(t.id)).map((t) => t.categoriaId)
    );

    return tecnicos.map((tec) => {
      const ticketsAsignados = tickets.filter((t) => t.tecnicoAsignadoId === tec.id && ['Abierto', 'En atención', 'En espera'].includes(t.estado));
      const criticos = ticketsAsignados.filter((t) => t.prioridad === 'Crítica').length;
      const esHabilitado = Array.from(catsSeleccionadas).some((cId) => (tec.especialidades || []).includes(cId));

      return {
        ...tec,
        cargaTotal: ticketsAsignados.length,
        criticos,
        esHabilitado,
      };
    });
  }, [tecnicos, tickets, seleccionados]);

  // Verificar si alguno de los seleccionados ya tenía técnico
  const algunoTieneTecnico = useMemo(() => {
    return tickets.some(
      (t) => seleccionados.includes(t.id) && t.tecnicoAsignadoId && t.tecnicoAsignadoId !== 'Sin asignar'
    );
  }, [tickets, seleccionados]);

  // Operación: Asignar / Reasignar (Mockup 4.2)
  const procesarAsignacion = (e) => {
    e.preventDefault();
    if (!tecnicoSeleccionadoId) {
      setErrorAsignacion('Debes seleccionar un técnico habilitado.');
      return;
    }

    if (algunoTieneTecnico && !motivoReasignacion.trim()) {
      setErrorAsignacion('El motivo de reasignación es obligatorio cuando el ticket ya tenía técnico.');
      return;
    }

    servicioCola.asignarTickets(seleccionados, tecnicoSeleccionadoId, notaTecnico, motivoReasignacion);
    refrescarTickets();

    const tec = tecnicos.find((u) => u.id === tecnicoSeleccionadoId);
    setNotificacion({
      tipo: 'exito',
      mensaje: `${seleccionados.length} ticket(s) asignado(s) exitosamente a ${tec?.nombres} ${tec?.apellidos}.`,
    });

    setModalAsignar(false);
    setSeleccionados([]);
    setTecnicoSeleccionadoId('');
    setNotaTecnico('');
    setMotivoReasignacion('');
    setErrorAsignacion('');
  };

  // Operación: Cambiar Prioridad (Mockup 4.3)
  const procesarCambioPrioridad = (e) => {
    e.preventDefault();
    if (!motivoPrioridad.trim()) {
      setErrorPrioridad('El motivo del cambio de prioridad es obligatorio.');
      return;
    }

    servicioCola.cambiarPrioridadTickets(seleccionados, nuevaPrioridad, motivoPrioridad);
    refrescarTickets();

    setNotificacion({
      tipo: 'exito',
      mensaje: `Prioridad de ${seleccionados.length} ticket(s) actualizada a "${nuevaPrioridad}". Motivo registrado en bitácora.`,
    });

    setModalPrioridad(false);
    setSeleccionados([]);
    setMotivoPrioridad('');
    setErrorPrioridad('');
  };

  // Operación: Devolver a la cola (Mockup 23)
  const procesarDevolucion = () => {
    servicioCola.devolverTicketsACola(seleccionados);
    refrescarTickets();

    setNotificacion({
      tipo: 'advertencia',
      mensaje: `${seleccionados.length} ticket(s) devuelto(s) a la cola con estado Abierto y sin técnico asignado.`,
    });

    setModalDevolver(false);
    setSeleccionados([]);
  };

  return (
    <div className="cola-contenedor">
      {/* Notificación de resultado */}
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

      {/* Cabecera de la Cola (Mockup 4.1) */}
      <div className="cola-cabecera">
        <div className="cola-titulo-seccion">
          <h1>Cola de atención</h1>
          <p className="cola-subtitulo">
            {estadisticas.totalEnCola} tickets en cola · {estadisticas.sinAsignar} sin asignar · {estadisticas.fueraTiempo} fuera del tiempo esperado
          </p>
        </div>

        {/* Badges rápidos de estado (Mockup 4.1) */}
        <div className="cola-resumen-badges">
          <button
            type="button"
            className={`cola-badge-estado-btn ${filtroEstado === 'Abierto' ? 'activo' : ''}`}
            onClick={() => setFiltroEstado(filtroEstado === 'Abierto' ? '' : 'Abierto')}
          >
            <span>Abiertos</span>
            <span className="cola-badge-numero">{estadisticas.abiertos}</span>
          </button>
          <button
            type="button"
            className={`cola-badge-estado-btn ${filtroEstado === 'En atención' ? 'activo' : ''}`}
            onClick={() => setFiltroEstado(filtroEstado === 'En atención' ? '' : 'En atención')}
          >
            <span>En atención</span>
            <span className="cola-badge-numero">{estadisticas.enAtencion}</span>
          </button>
          <button
            type="button"
            className={`cola-badge-estado-btn ${filtroEstado === 'En espera' ? 'activo' : ''}`}
            onClick={() => setFiltroEstado(filtroEstado === 'En espera' ? '' : 'En espera')}
          >
            <span>En espera</span>
            <span className="cola-badge-numero">{estadisticas.enEspera}</span>
          </button>
          <button
            type="button"
            className={`cola-badge-estado-btn ${filtroEstado === 'Resuelto' ? 'activo' : ''}`}
            onClick={() => setFiltroEstado(filtroEstado === 'Resuelto' ? '' : 'Resuelto')}
          >
            <span>Resueltos hoy</span>
            <span className="cola-badge-numero">{estadisticas.resueltosHoy}</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros (Mockup 4.1) */}
      <div className="cola-filtros-barra">
        <input
          type="text"
          className="cola-input-buscar"
          placeholder="Buscar código, asunto o solicitante"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />

        <select
          className="cola-select-filtro"
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value)}
        >
          <option value="">Prioridad: todas</option>
          <option value="Crítica">Crítica</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>

        <select
          className="cola-select-filtro"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Estado: todos</option>
          <option value="Abierto">Abierto</option>
          <option value="En atención">En atención</option>
          <option value="En espera">En espera</option>
          <option value="Resuelto">Resuelto</option>
        </select>

        <select
          className="cola-select-filtro"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="">Categoría: todas</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>

        <select
          className="cola-select-filtro"
          value={filtroAmbiente}
          onChange={(e) => setFiltroAmbiente(e.target.value)}
        >
          <option value="">Ambiente: todos</option>
          {ambientes.map((amb) => (
            <option key={amb.id} value={amb.codigo}>
              {amb.codigo}
            </option>
          ))}
        </select>

        {(buscar || filtroPrioridad || filtroEstado || filtroCategoria || filtroAmbiente) && (
          <button
            type="button"
            className="catalogo-btn-limpiar"
            onClick={limpiarFiltros}
            style={{ fontSize: '13px' }}
          >
            Limpiar filtros
          </button>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Orden:</span>
          <select
            className="cola-select-filtro"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="antiguedad">Antigüedad</option>
            <option value="prioridad">Prioridad</option>
            <option value="sinatencion">Tiempo sin atención</option>
          </select>
        </div>
      </div>

      {/* Tabla de Tickets (Mockup 4.1) */}
      {ticketsOrdenados.length === 0 ? (
        // Estado vacío (Mockup 23)
        <div className="catalogo-vacio-caja">
          <div className="catalogo-vacio-icono">✓</div>
          <div className="catalogo-vacio-titulo">No hay tickets con estos filtros</div>
          <p className="catalogo-vacio-desc">
            La cola está al día para los filtros seleccionados o no se encontraron coincidencias.
          </p>
          <button type="button" className="btn-primario" onClick={limpiarFiltros}>
            Quitar filtros
          </button>
        </div>
      ) : (
        <table className="cola-tabla">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={
                    seleccionados.length === ticketsOrdenados.length &&
                    ticketsOrdenados.length > 0
                  }
                  onChange={toggleSeleccionarTodo}
                  title="Seleccionar todos"
                />
              </th>
              <th style={{ width: '13%' }}>CÓDIGO</th>
              <th style={{ width: '22%' }}>ASUNTO</th>
              <th style={{ width: '18%' }}>CATEGORÍA</th>
              <th style={{ width: '8%' }}>AMBIENTE</th>
              <th style={{ width: '14%' }}>SOLICITANTE</th>
              <th style={{ width: '8%' }}>ANTIGÜEDAD</th>
              <th style={{ width: '8%' }}>PRIORIDAD</th>
              <th style={{ width: '9%' }}>ESTADO</th>
              <th style={{ width: '14%' }}>TÉCNICO</th>
            </tr>
          </thead>
          <tbody>
            {ticketsOrdenados.map((ticket) => {
              const estaSeleccionado = seleccionados.includes(ticket.id);
              const prioridadClase = ticket.prioridad ? `prioridad-${ticket.prioridad}` : '';

              return (
                <tr
                  key={ticket.id}
                  className={`cola-fila-ticket ${prioridadClase} ${
                    estaSeleccionado ? 'seleccionada' : ''
                  }`}
                >
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={estaSeleccionado}
                      onChange={() => toggleSeleccionarUno(ticket.id)}
                    />
                  </td>
                  <td>
                    <span className="cola-codigo-mono">{ticket.id}</span>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                    {ticket.asunto}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>
                    {ticket.categoriaNombre}
                    {ticket.subcategoriaNombre && ` · ${ticket.subcategoriaNombre}`}
                  </td>
                  <td style={{ fontWeight: 600 }}>{ticket.ambienteCodigo}</td>
                  <td className="cola-solicitante-celda">{ticket.solicitanteNombre}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                    {ticket.antiguedadTexto}
                  </td>
                  <td>
                    <EtiquetaPrioridad prioridad={ticket.prioridad} />
                  </td>
                  <td>
                    <EtiquetaEstado estado={ticket.estado} />
                  </td>
                  <td className="cola-tecnico-celda">
                    {ticket.tecnicoNombre === 'Sin asignar' ? (
                      <span className="cola-tecnico-sin-asignar">Sin asignar</span>
                    ) : (
                      ticket.tecnicoNombre
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Barra de Acciones en Lote (Mockup 4.4) */}
      {seleccionados.length > 0 && (
        <div className="cola-barra-lote-flotante">
          <div className="cola-barra-lote-contador">
            {seleccionados.length} ticket(s) seleccionado(s)
          </div>
          <button
            type="button"
            className="cola-barra-lote-btn cola-barra-lote-btn-primario"
            onClick={() => setModalAsignar(true)}
          >
            Asignar a técnico
          </button>
          <button
            type="button"
            className="cola-barra-lote-btn cola-barra-lote-btn-secundario"
            onClick={() => setModalPrioridad(true)}
          >
            Cambiar prioridad
          </button>
          <button
            type="button"
            className="cola-barra-lote-btn cola-barra-lote-btn-destructivo"
            onClick={() => setModalDevolver(true)}
          >
            Devolver a la cola
          </button>
          <button
            type="button"
            className="cola-barra-lote-btn cola-barra-lote-btn-quitar"
            onClick={() => setSeleccionados([])}
          >
            Quitar selección
          </button>
        </div>
      )}

      {/* Modal Asignar / Reasignar Técnico (Mockup 4.2) */}
      {modalAsignar && (
        <div className="modal-overlay">
          <div className="modal-contenido modal">
            <div className="modal-cabecera">
              <h3>
                {seleccionados.length === 1
                  ? `Asignar ${seleccionados[0]}`
                  : `Asignar ${seleccionados.length} tickets seleccionados`}
              </h3>
              <button
                type="button"
                className="btn-cerrar-modal"
                onClick={() => setModalAsignar(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={procesarAsignacion}>
              <div className="modal-cuerpo">
                {errorAsignacion && (
                  <div className="notificacion-banner notificacion-error" style={{ marginBottom: '12px' }}>
                    <span>{errorAsignacion}</span>
                  </div>
                )}

                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', display: 'block', marginBottom: '8px' }}>
                  TÉCNICO HABILITADO
                </label>

                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
                  {tecnicosHabilitados.map((tec) => (
                    <div
                      key={tec.id}
                      className={`cola-modal-tarjeta-tecnico ${
                        tecnicoSeleccionadoId === tec.id ? 'seleccionado' : ''
                      }`}
                      onClick={() => {
                        setTecnicoSeleccionadoId(tec.id);
                        setErrorAsignacion('');
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>
                          {tec.nombres} {tec.apellidos}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {tec.esHabilitado ? '✓ Especialista habilitado' : 'Disponible'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '12px' }}>
                        <span style={{ fontWeight: 600 }}>{tec.cargaTotal} tickets</span>
                        <span style={{ color: 'var(--color-text-muted)' }}> · {tec.criticos} críticos</span>
                      </div>
                    </div>
                  ))}
                </div>

                {algunoTieneTecnico && (
                  <div className="catalogo-form-grupo">
                    <label>MOTIVO DE REASIGNACIÓN (OBLIGATORIO)</label>
                    <textarea
                      rows="2"
                      className="catalogo-form-textarea"
                      placeholder="Explica el motivo del cambio de técnico..."
                      value={motivoReasignacion}
                      onChange={(e) => setMotivoReasignacion(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="catalogo-form-grupo">
                  <label>NOTA PARA EL TÉCNICO</label>
                  <textarea
                    rows="2"
                    className="catalogo-form-textarea"
                    placeholder="Ej. Hay clase de 10:00 a 13:00; atender antes de esa hora."
                    value={notaTecnico}
                    onChange={(e) => setNotaTecnico(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-acciones">
                <button
                  type="button"
                  className="btn-secundario"
                  onClick={() => setModalAsignar(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primario">
                  Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cambiar Prioridad (Mockup 4.3) */}
      {modalPrioridad && (
        <div className="modal-overlay">
          <div className="modal-contenido modal">
            <div className="modal-cabecera">
              <h3>Cambiar prioridad</h3>
              <button
                type="button"
                className="btn-cerrar-modal"
                onClick={() => setModalPrioridad(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={procesarCambioPrioridad}>
              <div className="modal-cuerpo">
                {errorPrioridad && (
                  <div className="notificacion-banner notificacion-error" style={{ marginBottom: '12px' }}>
                    <span>{errorPrioridad}</span>
                  </div>
                )}

                <div className="cola-modal-prioridad-indicador">
                  <span>Actual: <strong>Varios</strong></span>
                  <span>➔</span>
                  <div style={{ flex: 1 }}>
                    <select
                      className="catalogo-form-select"
                      value={nuevaPrioridad}
                      onChange={(e) => setNuevaPrioridad(e.target.value)}
                    >
                      <option value="Crítica">Crítica</option>
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>
                </div>

                <div className="catalogo-form-grupo">
                  <label>MOTIVO (OBLIGATORIO)</label>
                  <textarea
                    rows="3"
                    className="catalogo-form-textarea"
                    placeholder="Ej. Afecta al auditorio con evento institucional programado..."
                    value={motivoPrioridad}
                    onChange={(e) => setMotivoPrioridad(e.target.value)}
                    required
                  />
                </div>

                <div className="cola-modal-aviso-cambio">
                  <span>
                    El ticket subirá al inicio de la cola y su tiempo esperado se ajustará según la nueva prioridad.
                  </span>
                </div>
              </div>

              <div className="modal-acciones">
                <button
                  type="button"
                  className="btn-secundario"
                  onClick={() => setModalPrioridad(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primario">
                  Guardar prioridad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmación Destructiva: Devolver a la cola (Mockup 23) */}
      {modalDevolver && (
        <DialogoConfirmacion
          titulo={`¿Devolver ${seleccionados.length} ticket(s) a la cola?`}
          mensaje="Se quitará el técnico asignado y los tickets volverán al estado Abierto. La bitácora conserva el historial."
          textoConfirmar="Devolver a la cola"
          onConfirmar={procesarDevolucion}
          onCancelar={() => setModalDevolver(false)}
        />
      )}
    </div>
  );
};

export default ColaTickets;
