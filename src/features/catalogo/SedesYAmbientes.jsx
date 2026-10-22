import React, { useState, useMemo } from 'react';
import * as servicioCatalogo from './servicioCatalogo';
import ModalNuevoAmbiente from './ModalNuevoAmbiente';

const FILAS_POR_PAGINA = 10;

const SedesYAmbientes = () => {
  const [ambientes, setAmbientes] = useState(() => servicioCatalogo.obtenerAmbientes());
  const [mostrarModal, setMostrarModal] = useState(false);
  const [notificacion, setNotificacion] = useState(null);

  // Filtros (Mockup 2.3)
  const [busqueda, setBusqueda] = useState('');
  const [filtroSede, setFiltroSede] = useState('Monterrico');
  const [filtroPabellon, setFiltroPabellon] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  // Obtener lista única de pabellones y tipos para los selects
  const pabellonesDisponibles = useMemo(() => {
    const setPab = new Set(ambientes.map((a) => a.pabellon).filter(Boolean));
    return Array.from(setPab).sort();
  }, [ambientes]);

  const tiposDisponibles = useMemo(() => {
    const setTipos = new Set(ambientes.map((a) => a.tipo).filter(Boolean));
    return Array.from(setTipos).sort();
  }, [ambientes]);

  // Filtrado de ambientes
  const ambientesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return ambientes.filter((amb) => {
      const coincideQ =
        !q ||
        amb.codigo.toLowerCase().includes(q) ||
        amb.tipo.toLowerCase().includes(q) ||
        amb.pabellon.toLowerCase().includes(q);
      const coincideSede = !filtroSede || amb.sede.toLowerCase().includes(filtroSede.toLowerCase());
      const coincidePab = !filtroPabellon || amb.pabellon === filtroPabellon;
      const coincideTipo = !filtroTipo || amb.tipo.toLowerCase() === filtroTipo.toLowerCase();
      return coincideQ && coincideSede && coincidePab && coincideTipo;
    });
  }, [ambientes, busqueda, filtroSede, filtroPabellon, filtroTipo]);

  // Paginación
  const totalPaginas = Math.ceil(ambientesFiltrados.length / FILAS_POR_PAGINA) || 1;
  const ambientesPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * FILAS_POR_PAGINA;
    return ambientesFiltrados.slice(inicio, inicio + FILAS_POR_PAGINA);
  }, [ambientesFiltrados, paginaActual]);

  const filtrosActivosConteo =
    (busqueda ? 1 : 0) +
    (filtroPabellon ? 1 : 0) +
    (filtroTipo ? 1 : 0);

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroPabellon('');
    setFiltroTipo('');
    setPaginaActual(1);
  };

  const guardarNuevoAmbiente = (datosAmbiente) => {
    const nuevo = servicioCatalogo.crearAmbiente(datosAmbiente);
    setAmbientes(servicioCatalogo.obtenerAmbientes());
    setMostrarModal(false);
    setNotificacion({
      tipo: 'exito',
      mensaje: `Ambiente "${nuevo.codigo}" creado correctamente.`,
    });
  };

  return (
    <div className="catalogo-contenedor">
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

      {/* Cabecera (Mockup 2.3) */}
      <div className="catalogo-cabecera">
        <div className="catalogo-titulo-seccion">
          <h1>Sedes y ambientes</h1>
          <p className="catalogo-subtitulo">
            {ambientes.length} ambientes registrados en el Campus Monterrico.
          </p>
        </div>
        <div className="catalogo-acciones-cabecera">
          <button
            type="button"
            className="btn-primario"
            onClick={() => setMostrarModal(true)}
          >
            Nuevo ambiente
          </button>
        </div>
      </div>

      {/* Barra de Filtros (Mockup 2.3) */}
      <div className="catalogo-filtros-barra">
        <input
          type="text"
          className="catalogo-input-buscar"
          placeholder="Buscar por código o nombre"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPaginaActual(1);
          }}
        />

        <select
          className="catalogo-select-filtro"
          value={filtroSede}
          onChange={(e) => {
            setFiltroSede(e.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="Monterrico">Sede: Monterrico</option>
          <option value="">Sede: todas</option>
        </select>

        <select
          className="catalogo-select-filtro"
          value={filtroPabellon}
          onChange={(e) => {
            setFiltroPabellon(e.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="">Pabellón: todos</option>
          {pabellonesDisponibles.map((pab) => (
            <option key={pab} value={pab}>
              Pabellón {pab}
            </option>
          ))}
        </select>

        <select
          className="catalogo-select-filtro"
          value={filtroTipo}
          onChange={(e) => {
            setFiltroTipo(e.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="">Tipo: todos</option>
          {tiposDisponibles.map((tipo) => (
            <option key={tipo} value={tipo}>
              Tipo: {tipo}
            </option>
          ))}
        </select>

        {filtrosActivosConteo > 0 && (
          <div className="catalogo-filtros-info">
            <span>Filtros activos: {filtrosActivosConteo}</span>
            <span>·</span>
            <button type="button" className="catalogo-btn-limpiar" onClick={limpiarFiltros}>
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Tabla de Ambientes (Mockup 2.3) */}
      {ambientesFiltrados.length === 0 ? (
        <div className="catalogo-vacio-caja">
          <div className="catalogo-vacio-icono">🏛️</div>
          <div className="catalogo-vacio-titulo">No hay ambientes con estos filtros</div>
          <p className="catalogo-vacio-desc">
            No se encontraron ambientes que coincidan con los criterios de búsqueda seleccionados.
          </p>
          <button type="button" className="btn-secundario" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <table className="catalogo-tabla">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>CÓDIGO</th>
                <th style={{ width: '25%' }}>TIPO DE AMBIENTE</th>
                <th style={{ width: '12%' }}>PABELLÓN</th>
                <th style={{ width: '10%' }}>PISO</th>
                <th style={{ width: '20%' }}>SEDE</th>
                <th style={{ width: '10%' }}>CAPACIDAD</th>
                <th style={{ width: '11%', textAlign: 'right' }}>TICKETS ABIERTOS</th>
              </tr>
            </thead>
            <tbody>
              {ambientesPaginados.map((amb) => {
                const ticketsAbiertos = servicioCatalogo.obtenerTicketsAbiertosPorAmbiente(
                  amb.codigo,
                  amb.id
                );
                return (
                  <tr key={amb.id} className="catalogo-fila-hijo">
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {amb.codigo}
                    </td>
                    <td>{amb.tipo}</td>
                    <td>{amb.pabellon}</td>
                    <td>{amb.piso}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{amb.sede}</td>
                    <td>{amb.capacidad}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      <span
                        style={{
                          color:
                            ticketsAbiertos > 0
                              ? 'var(--color-primary)'
                              : 'var(--color-text-muted)',
                        }}
                      >
                        {ticketsAbiertos}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Paginación (Mockup 2.3) */}
          <div className="catalogo-paginacion">
            <span>
              Mostrando {ambientesPaginados.length} de {ambientesFiltrados.length} ambientes (total: {ambientes.length})
            </span>
            <div className="catalogo-paginacion-botones">
              <button
                type="button"
                className="catalogo-btn-pagina"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
              >
                Anterior
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`catalogo-btn-pagina ${paginaActual === num ? 'activa' : ''}`}
                  onClick={() => setPaginaActual(num)}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                className="catalogo-btn-pagina"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Nuevo Ambiente (Mockup 15) */}
      {mostrarModal && (
        <ModalNuevoAmbiente
          onCerrar={() => setMostrarModal(false)}
          onGuardar={guardarNuevoAmbiente}
        />
      )}
    </div>
  );
};

export default SedesYAmbientes;
