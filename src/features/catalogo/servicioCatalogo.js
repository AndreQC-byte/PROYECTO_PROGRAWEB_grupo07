import db from '../../data/db.json';

const CLAVE_CATEGORIAS = 'mesaAyuda.catalogo.categorias';
const CLAVE_SUBCATEGORIAS = 'mesaAyuda.catalogo.subcategorias';
const CLAVE_AMBIENTES = 'mesaAyuda.catalogo.ambientes';
const CLAVE_TECNICOS = 'mesaAyuda.catalogo.tecnicos';

const leerDeAlmacenamiento = (clave, porDefecto) => {
  try {
    const raw = localStorage.getItem(clave);
    if (!raw) return porDefecto;
    const data = JSON.parse(raw);
    return Array.isArray(data) && data.length > 0 ? data : porDefecto;
  } catch {
    return porDefecto;
  }
};

const guardarEnAlmacenamiento = (clave, data) => {
  try {
    localStorage.setItem(clave, JSON.stringify(data));
  } catch (err) {
    console.error('Error al guardar en localStorage:', err);
  }
};

// Carga inicial
let categoriasMemoria = leerDeAlmacenamiento(CLAVE_CATEGORIAS, db.categorias || []);
let subcategoriasMemoria = leerDeAlmacenamiento(CLAVE_SUBCATEGORIAS, db.subcategorias || []);
let ambientesMemoria = leerDeAlmacenamiento(CLAVE_AMBIENTES, db.ambientes || []);

// Técnicos iniciales filtrados de db.usuarios
const tecnicosIniciales = (db.usuarios || []).filter((u) => u.rol === 'Técnico');
let tecnicosMemoria = leerDeAlmacenamiento(CLAVE_TECNICOS, tecnicosIniciales);

export const obtenerCategorias = () => [...categoriasMemoria];

export const obtenerSubcategorias = () => [...subcategoriasMemoria];

export const obtenerAmbientes = () => [...ambientesMemoria];

export const obtenerTecnicos = () => [...tecnicosMemoria];

// Contar tickets activos en curso (Abierto, En atención, En espera)
export const obtenerTicketsAbiertosPorCategoria = (categoriaId) => {
  const tickets = db.tickets || [];
  return tickets.filter(
    (t) =>
      t.categoriaId === categoriaId &&
      ['Abierto', 'En atención', 'En espera'].includes(t.estado)
  ).length;
};

export const obtenerTicketsAbiertosPorSubcategoria = (subcategoriaId) => {
  const tickets = db.tickets || [];
  return tickets.filter(
    (t) =>
      t.subcategoriaId === subcategoriaId &&
      ['Abierto', 'En atención', 'En espera'].includes(t.estado)
  ).length;
};

export const obtenerTicketsAbiertosPorAmbiente = (ambienteCodigo, ambienteId) => {
  const tickets = db.tickets || [];
  return tickets.filter((t) => {
    const coincideId = ambienteId && t.ambienteId === ambienteId;
    const coincideCodigo = ambienteCodigo && (t.ambiente === ambienteCodigo || t.ambiente?.includes(ambienteCodigo));
    const estaActivo = ['Abierto', 'En atención', 'En espera'].includes(t.estado);
    return (coincideId || coincideCodigo) && estaActivo;
  }).length;
};

// Acciones sobre Categorías
export const crearCategoria = ({ nombre, prioridadDefecto = 'Media', tiempoEsperadoHoras = 8, descripcion = '', estado = 'Activa' }) => {
  const nuevoId = `CAT-${String(categoriasMemoria.length + 1).padStart(3, '0')}`;
  const nueva = {
    id: nuevoId,
    nombre: nombre.trim(),
    prioridadDefecto,
    tiempoEsperadoHoras: Number(tiempoEsperadoHoras),
    descripcion: descripcion.trim(),
    estado,
  };
  categoriasMemoria = [nueva, ...categoriasMemoria];
  guardarEnAlmacenamiento(CLAVE_CATEGORIAS, categoriasMemoria);
  return nueva;
};

export const actualizarCategoria = (id, datos) => {
  categoriasMemoria = categoriasMemoria.map((cat) => {
    if (cat.id === id) {
      return {
        ...cat,
        ...datos,
        tiempoEsperadoHoras: datos.tiempoEsperadoHoras !== undefined ? Number(datos.tiempoEsperadoHoras) : cat.tiempoEsperadoHoras,
      };
    }
    return cat;
  });
  guardarEnAlmacenamiento(CLAVE_CATEGORIAS, categoriasMemoria);
  return categoriasMemoria.find((c) => c.id === id);
};

export const cambiarEstadoCategoria = (id, nuevoEstado) => {
  categoriasMemoria = categoriasMemoria.map((cat) => (cat.id === id ? { ...cat, estado: nuevoEstado } : cat));
  guardarEnAlmacenamiento(CLAVE_CATEGORIAS, categoriasMemoria);
  return categoriasMemoria.find((c) => c.id === id);
};

// Acciones sobre Subcategorías
export const crearSubcategoria = ({
  nombre,
  categoriaPadreId,
  prioridadDefecto = 'Media',
  tiempoEsperadoHoras = 4,
  descripcion = '',
  estado = 'Activa',
}) => {
  const nuevoId = `SUB-${String(subcategoriasMemoria.length + 1).padStart(3, '0')}`;
  const nueva = {
    id: nuevoId,
    categoriaPadreId,
    nombre: nombre.trim(),
    prioridadDefecto,
    tiempoEsperadoHoras: Number(tiempoEsperadoHoras),
    descripcion: descripcion.trim(),
    estado,
  };
  subcategoriasMemoria = [...subcategoriasMemoria, nueva];
  guardarEnAlmacenamiento(CLAVE_SUBCATEGORIAS, subcategoriasMemoria);
  return nueva;
};

export const actualizarSubcategoria = (id, datos) => {
  subcategoriasMemoria = subcategoriasMemoria.map((sub) => {
    if (sub.id === id) {
      return {
        ...sub,
        ...datos,
        tiempoEsperadoHoras: datos.tiempoEsperadoHoras !== undefined ? Number(datos.tiempoEsperadoHoras) : sub.tiempoEsperadoHoras,
      };
    }
    return sub;
  });
  guardarEnAlmacenamiento(CLAVE_SUBCATEGORIAS, subcategoriasMemoria);
  return subcategoriasMemoria.find((s) => s.id === id);
};

export const cambiarEstadoSubcategoria = (id, nuevoEstado) => {
  subcategoriasMemoria = subcategoriasMemoria.map((sub) => (sub.id === id ? { ...sub, estado: nuevoEstado } : sub));
  guardarEnAlmacenamiento(CLAVE_SUBCATEGORIAS, subcategoriasMemoria);
  return subcategoriasMemoria.find((s) => s.id === id);
};

// Acciones sobre Ambientes
export const crearAmbiente = ({ codigo, tipo = 'Aula', pabellon = 'A', piso = 1, sede = 'Campus Monterrico', capacidad = 30 }) => {
  const nuevoId = `AMB-${String(ambientesMemoria.length + 1).padStart(3, '0')}`;
  const nuevo = {
    id: nuevoId,
    codigo: codigo.trim().toUpperCase(),
    tipo: tipo.trim(),
    pabellon: pabellon.trim(),
    piso: Number(piso) || 1,
    sede: sede.trim() || 'Campus Monterrico',
    capacidad: Number(capacidad) || 30,
  };
  ambientesMemoria = [nuevo, ...ambientesMemoria];
  guardarEnAlmacenamiento(CLAVE_AMBIENTES, ambientesMemoria);
  return nuevo;
};

// Matriz de Técnicos
export const actualizarMatrizTecnicos = (nuevosTecnicos) => {
  tecnicosMemoria = [...nuevosTecnicos];
  guardarEnAlmacenamiento(CLAVE_TECNICOS, tecnicosMemoria);
  return tecnicosMemoria;
};

// Invitar nuevo técnico
export const invitarTecnico = ({ nombres, apellidos, correo, especialidades = [] }) => {
  const nuevoId = `USR-${String(tecnicosMemoria.length + 10).padStart(3, '0')}`;
  const nuevoTecnico = {
    id: nuevoId,
    nombres: nombres.trim(),
    apellidos: apellidos.trim(),
    correo: correo.trim().toLowerCase(),
    rol: 'Técnico',
    telefono: '',
    especialidades: [...especialidades],
    estado: 'Activo',
  };
  tecnicosMemoria = [...tecnicosMemoria, nuevoTecnico];
  guardarEnAlmacenamiento(CLAVE_TECNICOS, tecnicosMemoria);
  return nuevoTecnico;
};

// Exportar catálogo en formato CSV
export const exportarCatalogoCSV = () => {
  const filas = [
    ['TIPO', 'CODIGO', 'NOMBRE', 'CATEGORIA_PADRE', 'PRIORIDAD_DEFECTO', 'TIEMPO_ESPERADO_HORAS', 'ESTADO'],
  ];

  categoriasMemoria.forEach((cat) => {
    filas.push([
      'CATEGORÍA',
      cat.id,
      `"${cat.nombre}"`,
      '-',
      cat.prioridadDefecto || 'Alta',
      cat.tiempoEsperadoHoras || 4,
      cat.estado,
    ]);

    const subs = subcategoriasMemoria.filter((s) => s.categoriaPadreId === cat.id);
    subs.forEach((sub) => {
      filas.push([
        'SUBCATEGORÍA',
        sub.id,
        `"${sub.nombre}"`,
        `"${cat.nombre}"`,
        sub.prioridadDefecto || 'Media',
        sub.tiempoEsperadoHoras || 8,
        sub.estado,
      ]);
    });
  });

  const contenido = filas.map((f) => f.join(',')).join('\n');
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `catalogo_servicios_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

