import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import * as servicioCatalogo from './servicioCatalogo';

const PRIORIDADES = ['Crítica', 'Alta', 'Media', 'Baja'];

const FormularioCategoria = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Si existe, es modo edición

  const [categoriasPadre, setCategoriasPadre] = useState([]);
  const [esEdicion, setEsEdicion] = useState(false);
  const [tipoElemento, setTipoElemento] = useState('subcategoria'); // 'categoria' | 'subcategoria'

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [categoriaPadreId, setCategoriaPadreId] = useState('');
  const [prioridadDefecto, setPrioridadDefecto] = useState('Media');
  const [tiempoEsperadoHoras, setTiempoEsperadoHoras] = useState(8);
  const [descripcion, setDescripcion] = useState('');
  const [activa, setActiva] = useState(true);

  // Errores de validación en línea
  const [errores, setErrores] = useState({});
  const [mensajeGlobalError, setMensajeGlobalError] = useState(null);

  useEffect(() => {
    const cats = servicioCatalogo.obtenerCategorias();
    setCategoriasPadre(cats);

    if (id) {
      setEsEdicion(true);
      // Buscar si es categoría o subcategoría
      const cat = cats.find((c) => c.id === id);
      if (cat) {
        setTipoElemento('categoria');
        setNombre(cat.nombre || '');
        setCategoriaPadreId('');
        setPrioridadDefecto(cat.prioridadDefecto || 'Alta');
        setTiempoEsperadoHoras(cat.tiempoEsperadoHoras || 4);
        setDescripcion(cat.descripcion || '');
        setActiva(cat.estado === 'Activa');
        return;
      }

      const subs = servicioCatalogo.obtenerSubcategorias();
      const sub = subs.find((s) => s.id === id);
      if (sub) {
        setTipoElemento('subcategoria');
        setNombre(sub.nombre || '');
        setCategoriaPadreId(sub.categoriaPadreId || '');
        setPrioridadDefecto(sub.prioridadDefecto || 'Media');
        setTiempoEsperadoHoras(sub.tiempoEsperadoHoras || 8);
        setDescripcion(sub.descripcion || '');
        setActiva(sub.estado === 'Activa');
      }
    } else {
      // Modo nueva: si hay categorías existentes, seleccionar la primera por defecto como padre
      if (cats.length > 0) {
        setCategoriaPadreId(cats[0].id);
      }
    }
  }, [id]);

  // Validaciones en línea
  const validarCampos = () => {
    const nuevosErrores = {};

    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio.';
    }

    const horas = Number(tiempoEsperadoHoras);
    if (isNaN(horas) || horas <= 0) {
      nuevosErrores.tiempo = 'Debe ser un número mayor que cero.';
    }

    if (descripcion.length > 240) {
      nuevosErrores.descripcion = 'La descripción no puede exceder los 240 caracteres.';
    }

    setErrores(nuevosErrores);
    const cant = Object.keys(nuevosErrores).length;
    if (cant > 0) {
      setMensajeGlobalError(`No se pudo guardar: revisa los ${cant} campos marcados.`);
      return false;
    }

    setMensajeGlobalError(null);
    return true;
  };

  const manejarGuardar = (e) => {
    e.preventDefault();
    if (!validarCampos()) return;

    const estado = activa ? 'Activa' : 'Inactiva';
    const esPrimerNivel = !categoriaPadreId;

    if (esEdicion) {
      if (tipoElemento === 'categoria') {
        servicioCatalogo.actualizarCategoria(id, {
          nombre,
          prioridadDefecto,
          tiempoEsperadoHoras: Number(tiempoEsperadoHoras),
          descripcion,
          estado,
        });
      } else {
        servicioCatalogo.actualizarSubcategoria(id, {
          nombre,
          categoriaPadreId,
          prioridadDefecto,
          tiempoEsperadoHoras: Number(tiempoEsperadoHoras),
          descripcion,
          estado,
        });
      }
    } else {
      if (esPrimerNivel) {
        servicioCatalogo.crearCategoria({
          nombre,
          prioridadDefecto,
          tiempoEsperadoHoras: Number(tiempoEsperadoHoras),
          descripcion,
          estado,
        });
      } else {
        servicioCatalogo.crearSubcategoria({
          nombre,
          categoriaPadreId,
          prioridadDefecto,
          tiempoEsperadoHoras: Number(tiempoEsperadoHoras),
          descripcion,
          estado,
        });
      }
    }

    navigate('/catalogo/categorias');
  };

  const tituloPantalla = esEdicion
    ? `Editar ${tipoElemento === 'categoria' ? 'categoría' : 'subcategoría'}`
    : categoriaPadreId
    ? 'Nueva subcategoría'
    : 'Nueva categoría';

  return (
    <div className="catalogo-contenedor">
      {/* Breadcrumb (Mockup 2.2) */}
      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
        <Link to="/catalogo/categorias" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
          Categorías
        </Link>{' '}
        · {tituloPantalla}
      </div>

      <div className="catalogo-cabecera">
        <div className="catalogo-titulo-seccion">
          <h1>{tituloPantalla}</h1>
        </div>
      </div>

      {/* Alerta de error si falla la validación (Mockup 2.2) */}
      {mensajeGlobalError && (
        <div className="notificacion-banner notificacion-error">
          <span>{mensajeGlobalError}</span>
          <button
            type="button"
            className="btn-cerrar-modal"
            style={{ fontSize: '16px' }}
            onClick={() => setMensajeGlobalError(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className="catalogo-form-layout">
        {/* Columna Izquierda: Formulario (Mockup 2.2) */}
        <form onSubmit={manejarGuardar} className="catalogo-form-panel">
          {/* Nombre */}
          <div className="catalogo-form-grupo">
            <label htmlFor="cat-nombre">NOMBRE</label>
            <input
              id="cat-nombre"
              type="text"
              className={`catalogo-form-input ${errores.nombre ? 'error' : ''}`}
              placeholder="Escribe el nombre"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errores.nombre) setErrores({ ...errores, nombre: null });
              }}
            />
            {errores.nombre && (
              <span className="catalogo-form-error-texto">{errores.nombre}</span>
            )}
          </div>

          {/* Categoría Padre */}
          <div className="catalogo-form-grupo">
            <label htmlFor="cat-padre">CATEGORÍA PADRE</label>
            <select
              id="cat-padre"
              className="catalogo-form-select"
              value={categoriaPadreId}
              onChange={(e) => setCategoriaPadreId(e.target.value)}
              disabled={esEdicion && tipoElemento === 'categoria'}
            >
              <option value="">(Ninguna: crear categoría de primer nivel)</option>
              {categoriasPadre.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            <span className="catalogo-form-ayuda-texto">
              Déjalo vacío para crear una categoría de primer nivel.
            </span>
          </div>

          {/* Prioridad por Defecto */}
          <div className="catalogo-form-grupo">
            <label>PRIORIDAD POR DEFECTO</label>
            <div className="catalogo-selector-prioridad">
              {PRIORIDADES.map((pri) => (
                <button
                  key={pri}
                  type="button"
                  className={`catalogo-btn-prioridad-opcion ${
                    prioridadDefecto === pri ? `seleccionada-${pri}` : ''
                  }`}
                  onClick={() => setPrioridadDefecto(pri)}
                >
                  {pri}
                </button>
              ))}
            </div>
          </div>

          {/* Tiempo Esperado (Horas) */}
          <div className="catalogo-form-grupo">
            <label htmlFor="cat-tiempo">TIEMPO ESPERADO (HORAS)</label>
            <input
              id="cat-tiempo"
              type="number"
              min="1"
              step="1"
              className={`catalogo-form-input ${errores.tiempo ? 'error' : ''}`}
              value={tiempoEsperadoHoras}
              onChange={(e) => {
                setTiempoEsperadoHoras(e.target.value);
                if (errores.tiempo) setErrores({ ...errores, tiempo: null });
              }}
            />
            {errores.tiempo && (
              <span className="catalogo-form-error-texto">{errores.tiempo}</span>
            )}
          </div>

          {/* Descripción */}
          <div className="catalogo-form-grupo">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="cat-desc">DESCRIPCIÓN</label>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {descripcion.length} / 240
              </span>
            </div>
            <textarea
              id="cat-desc"
              rows="3"
              maxLength="240"
              className={`catalogo-form-textarea ${errores.descripcion ? 'error' : ''}`}
              placeholder="Describe en qué consiste esta categoría o subcategoría..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            <span className="catalogo-form-ayuda-texto">
              Se muestra al usuario al elegir la subcategoría. Máximo 240 caracteres.
            </span>
            {errores.descripcion && (
              <span className="catalogo-form-error-texto">{errores.descripcion}</span>
            )}
          </div>

          {/* Checkbox Estado */}
          <label className="catalogo-checkbox-fila">
            <input
              type="checkbox"
              checked={activa}
              onChange={(e) => setActiva(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <span>Categoría activa · disponible al registrar tickets</span>
          </label>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn-primario">
              Guardar categoría
            </button>
            <button
              type="button"
              className="btn-secundario"
              onClick={() => navigate('/catalogo/categorias')}
            >
              Cancelar
            </button>
          </div>
        </form>

        {/* Columna Derecha: Panel Informativo (Mockup 2.2) */}
        <aside className="catalogo-sidebar-informativo">
          <div className="catalogo-sidebar-seccion">
            <h4>Efecto del tiempo esperado</h4>
            <p>
              El tiempo esperado define cuándo un ticket aparece como fuera de plazo en la cola y en el tablero. Cambiarlo no altera los tickets ya abiertos.
            </p>
          </div>

          <div className="catalogo-sidebar-seccion">
            <h4>REFERENCIA ACTUAL</h4>
            <div className="catalogo-referencia-caja">
              <strong>Crítica:</strong> 2 h · <strong>Alta:</strong> 8 h<br />
              <strong>Media:</strong> 24 h · <strong>Baja:</strong> 72 h hábiles
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default FormularioCategoria;

