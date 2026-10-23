// Capa de datos de la HU-3 (Registro y seguimiento de tickets).
// No guarda nada propio: lee y escribe en el almacén compartido de tickets (servicioCola),
// así lo que registra el usuario lo ven la cola del supervisor y la bandeja del técnico.
import { obtenerTickets, reemplazarTickets } from '../cola_asignacion/servicioCola';
import { obtenerCategorias, obtenerSubcategorias, obtenerAmbientes } from '../catalogo/servicioCatalogo';

const ESTADOS_TERMINADOS = ['Resuelto', 'Cerrado'];

export const esTerminado = (estado) => ESTADOS_TERMINADOS.includes(estado);

export const obtenerTicketsDelUsuario = (usuarioId) =>
  obtenerTickets()
    .filter((t) => t.usuarioId === usuarioId)
    .sort((a, b) => b.fechaRegistro.localeCompare(a.fechaRegistro));

// Solo devuelve el ticket si pertenece al usuario (un usuario no ve tickets ajenos)
export const obtenerTicketDelUsuario = (usuarioId, codigo) =>
  obtenerTickets().find((t) => t.id === codigo && t.usuarioId === usuarioId) || null;

export const obtenerCategoriasActivas = () => obtenerCategorias().filter((c) => c.estado === 'Activa');

export const obtenerSubcategoriasActivas = (categoriaId) =>
  obtenerSubcategorias().filter((s) => s.categoriaPadreId === categoriaId && s.estado === 'Activa');

export const buscarAmbientePorCodigo = (codigo) => {
  const buscado = codigo.trim().toLowerCase();
  return buscado ? obtenerAmbientes().find((a) => a.codigo.toLowerCase() === buscado) || null : null;
};

// Ticket aún no cerrado con la misma categoría y ambiente (aviso de duplicado)
export const buscarTicketDuplicado = (categoriaId, ambienteId) =>
  obtenerTickets().find(
    (t) => t.categoriaId === categoriaId && t.ambienteId === ambienteId && t.estado !== 'Cerrado'
  ) || null;

// Crea el ticket con prioridad y tiempo esperado tomados de la subcategoría
export const registrarTicket = ({ usuarioId, categoriaId, subcategoriaId, ambienteId, asunto, descripcion }) => {
  const existentes = obtenerTickets();
  const subcategoria = obtenerSubcategorias().find((s) => s.id === subcategoriaId);
  const ultimoNumero = Math.max(0, ...existentes.map((t) => Number(t.id.slice(-5))));
  const ahora = new Date().toISOString();

  const ticket = {
    id: `TCK-2026-${String(ultimoNumero + 1).padStart(5, '0')}`,
    asunto: asunto.trim(),
    descripcion: descripcion.trim(),
    usuarioId,
    categoriaId,
    subcategoriaId,
    ambienteId,
    tecnicoAsignadoId: null,
    prioridad: subcategoria?.prioridadDefecto || 'Media',
    estado: 'Abierto',
    fechaRegistro: ahora,
    fechaAsignacion: null,
    tiempoEsperadoHoras: subcategoria?.tiempoEsperadoHoras || 4,
    bitacora: [
      { id: `BIT-${Date.now()}`, autorId: usuarioId, fecha: ahora, tipo: 'Comentario Público', mensaje: descripcion.trim() },
    ],
  };

  reemplazarTickets([ticket, ...existentes]);
  return ticket;
};

// El usuario agrega información a la bitácora de su ticket
export const agregarComentarioUsuario = (codigo, usuarioId, mensaje) => {
  const entrada = {
    id: `BIT-${Date.now()}`,
    autorId: usuarioId,
    fecha: new Date().toISOString(),
    tipo: 'Comentario Público',
    mensaje,
  };
  reemplazarTickets(
    obtenerTickets().map((t) => (t.id === codigo ? { ...t, bitacora: [...(t.bitacora || []), entrada] } : t))
  );
};
