import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as servicioCatalogo from './servicioCatalogo';
import EtiquetaPrioridad from '../../components/common/EtiquetaPrioridad';
import EtiquetaEstado from '../../components/common/EtiquetaEstado';
import DialogoConfirmacion from '../../components/common/DialogoConfirmacion';

const FILAS_POR_PAGINA = 13;

const ListaCategorias = () => {
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState(() => servicioCatalogo.obtenerCategorias());
  const [subcategorias, setSubcategorias] = useState(() => servicioCatalogo.obtenerSubcategorias());

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [soloActivas, setSoloActivas] = useState(true);
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  // Notificación de resultado (Requerimiento obligatorio: toda operación notifica su resultado)
  const [notificacion, setNotificacion] = useState(null);

  // Diálogo de confirmación destructiva
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [elementoADesactivar, setElementoADesactivar] = useState(null); // { tipo: 'cat' | 'sub', item, ticketsEnCurso }

  const refrescarDatos = () => {
    setCategorias(servicioCatalogo.obtenerCategorias());
    setSubcategorias(servicioCatalogo.obtenerSubcategorias());
  };

  // Contadores del resumen superior
  const categoriasActivasConteo = useMemo(
    () => categorias.filter((c) => c.estado === 'Activa').length,
    [categorias]
  );

  const subcategoriasActivasConteo = useMemo(
    () => subcategorias.filter((s) => s.estado === 'Activa').length,
    [subcategorias]
  );

  // Construcción del árbol y filtrado
  const filasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const resultado = [];

    categorias.forEach((cat) => {
      // Tickets abiertos de la categoría
      const ticketsCat = servicioCatalogo.obtenerTicketsAbiertosPorCategoria(cat.id);
      const subsDeCat = subcategorias.filter((s) => s.categoriaPadreId === cat.id);

      // Evaluar subcategorías
      const subsCoincidentes = subsDeCat.filter((sub) => {
        const coincideQ =
          !q ||
          sub.nombre.toLowerCase().includes(q) ||
          cat.nombre.toLowerCase().includes(q);
        const coincideEstado = !soloActivas || sub.estado === 'Activa';
        const coincidePri = !filtroPrioridad || sub.prioridadDefecto === filtroPrioridad;
        return coincideQ && coincideEstado && coincidePri;
      });

      // Evaluar categoría padre
      const catCoincideQ = !q || cat.nombre.toLowerCase().includes(q);
      const catCoincideEstado = !soloActivas || cat.estado === 'Activa';
      const catCoincidePri = !filtroPrioridad || cat.prioridadDefecto === filtroPrioridad;

      const debeMostrarPadre = (catCoincideQ && catCoincideEstado && catCoincidePri) || subsCoincidentes.length > 0;

      if (debeMostrarPadre) {
        resultado.push({
          tipo: 'categoria',
          id: cat.id,
          nombre: cat.nombre,
          prioridad: cat.prioridadDefecto || 'Alta',
          tiempoEsperado: cat.tiempoEsperadoHoras || 4,
          ticketsAbiertos: ticketsCat,
          estado: cat.estado,
          itemOriginal: cat,
        });

        subsCoincidentes.forEach((sub) => {
          const ticketsSub = servicioCatalogo.obtenerTicketsAbiertosPorSubcategoria(sub.id);
          resultado.push({
            tipo: 'subcategoria',
            id: sub.id,
            categoriaPadreId: cat.id,
            nombre: sub.nombre,
            prioridad: sub.prioridadDefecto || 'Media',
            tiempoEsperado: sub.tiempoEsperadoHoras || 8,
            ticketsAbiertos: ticketsSub,
            estado: sub.estado,
            itemOriginal: sub,
          });
        });
      }
    });

    return resultado;
  }, [categorias, subcategorias, busqueda, soloActivas, filtroPrioridad]);

  // Paginación
  const totalPaginas = Math.ceil(filasFiltradas.length / FILAS_POR_PAGINA) || 1;
  const filasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * FILAS_POR_PAGINA;
    return filasFiltradas.slice(inicio, inicio + FILAS_POR_PAGINA);
  }, [filasFiltradas, paginaActual]);

  const filtrosActivosConteo = (soloActivas ? 1 : 0) + (filtroPrioridad ? 1 : 0) + (busqueda ? 1 : 0);

  const limpiarFiltros = () => {
    setBusqueda('');
    setSoloActivas(false);
    setFiltroPrioridad('');
    setPaginaActual(1);
  };

  // Acción para desactivar (abre diálogo de confirmación explícita si hay tickets en curso)
  const iniciarDesactivacion = (fila) => {
    const esCat = fila.tipo === 'categoria';
    const tickets = esCat
      ? servicioCatalogo.obtenerTicketsAbiertosPorCategoria(fila.id)
      : servicioCatalogo.obtenerTicketsAbiertosPorSubcategoria(fila.id);

    setElementoADesactivar({
      tipo: fila.tipo,
      item: fila.itemOriginal,
      ticketsEnCurso: tickets,
    });
    setModalConfirmacion(true);
  };

  const ejecutarDesactivacion = () => {
    if (!elementoADesactivar) return;
    const { tipo, item } = elementoADesactivar;

    if (tipo === 'categoria') {
      servicioCatalogo.cambiarEstadoCategoria(item.id, 'Inactiva');
      setNotificacion({
        tipo: 'exito',
        mensaje: `Categoría "${item.nombre}" desactivada correctamente. Las categorías inactivas no admiten tickets nuevos.`,
      });
    } else {
      servicioCatalogo.cambiarEstadoSubcategoria(item.id, 'Inactiva');
      setNotificacion({
        tipo: 'exito',
        mensaje: `Subcategoría "${item.nombre}" desactivada correctamente.`,
      });
    }

    setModalConfirmacion(false);
    setElementoADesactivar(null);
    refrescarDatos();
  };

  const activarElemento = (fila) => {
    if (fila.tipo === 'categoria') {
      servicioCatalogo.cambiarEstadoCategoria(fila.id, 'Activa');
      setNotificacion({
        tipo: 'exito',
        mensaje: `Categoría "${fila.nombre}" activada correctamente. Ya admite tickets nuevos.`,
      });
    } else {
      servicioCatalogo.cambiarEstadoSubcategoria(fila.id, 'Activa');
      setNotificacion({
        tipo: 'exito',
        mensaje: `Subcategoría "${fila.nombre}" activada correctamente.`,
      });
    }
    refrescarDatos();
  };

  const handleExportar = () => {
    servicioCatalogo.exportarCatalogoCSV();
    setNotificacion({
      tipo: 'info',
      mensaje: 'Catálogo de servicios exportado correctamente en formato CSV.',
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

      {/* Cabecera con Título y Acciones (Mockup 2.1) */}
      <div className="catalogo-cabecera">
        <div className="catalogo-titulo-seccion">
          <h1>Categorías de servicio</h1>
          <p className="catalogo-subtitulo">
            {categoriasActivasConteo} categorías activas · {subcategoriasActivasConteo} subcategorías · la prioridad por defecto se aplica a cada ticket nuevo.
          </p>
        </div>
        <div className="catalogo-acciones-cabecera">
          <button type="button" className="btn-secundario" onClick={handleExportar}>
            Exportar catálogo
          </button>
          <button
            type="button"
            className="btn-primario"
            onClick={() => navigate('/catalogo/categorias/nueva')}
          >
            Nueva categoría
          </button>
        </div>
      </div>

      {/* Barra de Filtros (Mockup 2.1) */}
      <div className="catalogo-filtros-barra">
        <input
          type="text"
          className="catalogo-input-buscar"
          placeholder="Buscar categoría o subcategoría"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPaginaActual(1);
          }}
        />

        <button
          type="button"
          className={`catalogo-chip-filtro ${soloActivas ? 'activo' : ''}`}
          onClick={() => {
            setSoloActivas(!soloActivas);
            setPaginaActual(1);
          }}
          title={soloActivas ? 'Quitar filtro de solo activas' : 'Mostrar solo activas'}
        >
          <span>Solo activas</span>
          {soloActivas && <span>×</span>}
        </button>

        <select
          className="catalogo-select-filtro"
          value={filtroPrioridad}
          onChange={(e) => {
            setFiltroPrioridad(e.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="">Prioridad: todas</option>
          <option value="Crítica">Prioridad: Crítica</option>
          <option value="Alta">Prioridad: Alta</option>
          <option value="Media">Prioridad: Media</option>
          <option value="Baja">Prioridad: Baja</option>
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

      {/* Tabla Jerárquica de 2 Niveles (Mockup 2.1) */}
      {filasFiltradas.length === 0 ? (
        // Estado Vacío (Mockup 15)
        <div className="catalogo-vacio-caja">
          <div className="catalogo-vacio-icono">📂</div>
          <div className="catalogo-vacio-titulo">
            {categorias.length === 0
              ? 'Aún no hay categorías de servicio'
              : 'No hay categorías o subcategorías con estos filtros'}
          </div>
          <p className="catalogo-vacio-desc">
            {categorias.length === 0
              ? 'Crea la primera categoría para que la comunidad pueda registrar tickets. Puedes empezar con Audiovisuales y Redes.'
              : 'Intenta modificar el término de búsqueda o limpiar los filtros seleccionados.'}
          </p>
          {categorias.length === 0 ? (
            <button
              type="button"
              className="btn-primario"
              onClick={() => navigate('/catalogo/categorias/nueva')}
            >
              Crear primera categoría
            </button>
          ) : (
            <button type="button" className="btn-secundario" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <table className="catalogo-tabla">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>CATEGORÍA · SUBCATEGORÍA</th>
                <th style={{ width: '12%' }}>PRIORIDAD</th>
                <th style={{ width: '15%' }}>TIEMPO ESPERADO</th>
                <th style={{ width: '12%' }}>TICKETS ABIERTOS</th>
                <th style={{ width: '10%' }}>ESTADO</th>
                <th style={{ width: '11%', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filasPaginadas.map((fila) => {
                const esPadre = fila.tipo === 'categoria';
                return (
                  <tr
                    key={fila.id}
                    className={esPadre ? 'catalogo-fila-padre' : 'catalogo-fila-hijo'}
                  >
                    <td>
                      {esPadre ? (
                        <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                          {fila.nombre}
                        </span>
                      ) : (
                        <div className="catalogo-hijo-sangria">
                          <span className="catalogo-hijo-icono">↳</span>
                          <span>{fila.nombre}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <EtiquetaPrioridad prioridad={fila.prioridad} />
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>
                      {fila.tiempoEsperado} h hábiles
                    </td>
                    <td style={{ fontWeight: 600 }}>{fila.ticketsAbiertos}</td>
                    <td>
                      <EtiquetaEstado estado={fila.estado} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="catalogo-acciones-celda" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="catalogo-btn-accion catalogo-btn-editar"
                          onClick={() => navigate(`/catalogo/categorias/editar/${fila.id}`)}
                        >
                          Editar
                        </button>
                        {fila.estado === 'Activa' ? (
                          <button
                            type="button"
                            className="catalogo-btn-accion catalogo-btn-desactivar"
                            onClick={() => iniciarDesactivacion(fila)}
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="catalogo-btn-accion catalogo-btn-activar"
                            onClick={() => activarElemento(fila)}
                          >
                            Activar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Paginación (Mockup 2.1) */}
          <div className="catalogo-paginacion">
            <span>
              Mostrando {filasPaginadas.length} de {filasFiltradas.length} filas · {categorias.length} categorías y {subcategorias.length} subcategorías
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

      {/* Diálogo de Confirmación Destructiva (Mockup 2.1 y regla 4) */}
      {modalConfirmacion && elementoADesactivar && (
        <DialogoConfirmacion
          titulo={`¿Desactivar ${elementoADesactivar.tipo === 'categoria' ? 'categoría' : 'subcategoría'}?`}
          mensaje={
            elementoADesactivar.ticketsEnCurso > 0
              ? `La ${elementoADesactivar.tipo === 'categoria' ? 'categoría' : 'subcategoría'} "${elementoADesactivar.item.nombre}" tiene ${elementoADesactivar.ticketsEnCurso} tickets abiertos en curso. Las categorías inactivas no admiten tickets nuevos. ¿Deseas confirmar la desactivación?`
              : `¿Estás seguro de desactivar "${elementoADesactivar.item.nombre}"? Las categorías inactivas no admiten tickets nuevos.`
          }
          textoConfirmar="Desactivar"
          onConfirmar={ejecutarDesactivacion}
          onCancelar={() => {
            setModalConfirmacion(false);
            setElementoADesactivar(null);
          }}
        />
      )}
    </div>
  );
};

export default ListaCategorias;
