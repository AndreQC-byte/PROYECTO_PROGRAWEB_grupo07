// Capa de datos y reglas de negocio de la HU-5 (Atención y cierre).
// Los componentes visuales no leen db.json: pasan por este módulo (separación por capas).
import db from '../../data/db.json';

const MS_MINUTO = 60 * 1000;

// Transiciones de estado permitidas para el técnico
export const TRANSICIONES = {
  'Abierto': ['En atención'],
  'En atención': ['En espera', 'Resuelto'],
  'En espera': ['En atención'],
  'Resuelto': [],
  'Cerrado': [],
};

export const ESTADOS_SELECCIONABLES = ['En atención', 'En espera', 'Resuelto', 'Abierto'];

export const DESCRIPCION_ESTADO = {
  'En atención': 'En atención · se retoma el trabajo sobre el ticket',
  'En espera': 'En espera · falta un repuesto o depende de un tercero',
  'Resuelto': 'Resuelto · la falla ya no se presenta',
};

export const puedeCerrar = (estado) => estado === 'En atención' || estado === 'Resuelto';

// ---------- Lectura de datos semilla (solo lectura) ----------

export const obtenerTicketsSemilla = () =>
  db.tickets.map((t) => ({ ...t, bitacora: [...(t.bitacora || [])] }));

export const obtenerUsuario = (id) => db.usuarios.find((u) => u.id === id);
export const obtenerAmbiente = (id) => db.ambientes.find((a) => a.id === id);
export const obtenerCategoria = (id) => db.categorias.find((c) => c.id === id);
export const obtenerSubcategoria = (id) => db.subcategorias.find((s) => s.id === id);

export const nombreCompleto = (usuario) => (usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Usuario desconocido');

// "Julio César" + "Paredes Soto" → "Julio Paredes Soto" (como en los mockups)
export const nombreCorto = (usuario) => (usuario ? `${usuario.nombres.split(' ')[0]} ${usuario.apellidos}` : 'Usuario desconocido');

export const iniciales = (usuario) => (usuario ? `${usuario.nombres[0]}${usuario.apellidos[0]}` : '??');

// ---------- Historial de estados ----------

// db.json no guarda las transiciones una por una, así que se reconstruye el historial inicial
export const construirHistorialInicial = (ticket) => {
  const eventos = [
    { estado: 'Abierto', fecha: ticket.fechaRegistro, autorId: ticket.usuarioId, detalle: `prioridad inicial ${ticket.prioridad.toLowerCase()}` },
  ];

  if (ticket.fechaAsignacion) {
    eventos.push({ estado: 'Asignado', fecha: ticket.fechaAsignacion, autorId: null, detalle: '' });
  }

  if (ticket.estado !== 'Abierto') {
    // Inicio de la atención = primera entrada de bitácora del técnico asignado
    const primera = ticket.bitacora.find((b) => b.autorId === ticket.tecnicoAsignadoId);
    eventos.push({
      estado: 'En atención',
      fecha: primera?.fecha || ticket.fechaAsignacion || ticket.fechaRegistro,
      autorId: ticket.tecnicoAsignadoId,
      detalle: '',
    });
  }

  return eventos;
};

// ---------- Cálculo de tiempos ----------

const minutosEntre = (desde, hasta) => Math.max(0, Math.round((new Date(hasta) - new Date(desde)) / MS_MINUTO));

// Minutos que permaneció cada evento; el último llega hasta "ahora" (salvo que sea el cierre)
export const calcularDuraciones = (eventos, ahora) =>
  eventos.map((evento, i) => {
    const siguiente = eventos[i + 1];
    if (!siguiente && evento.estado === 'Cerrado') return { ...evento, minutos: null };
    return { ...evento, minutos: minutosEntre(evento.fecha, siguiente ? siguiente.fecha : ahora) };
  });

export const calcularTiempoPorEtapa = (eventos, ahora) => {
  const etapas = [
    { nombre: 'Abierto', estados: ['Abierto', 'Asignado'], color: 'info', minutos: 0 },
    { nombre: 'En atención', estados: ['En atención'], color: 'warning', minutos: 0 },
    { nombre: 'En espera', estados: ['En espera'], color: 'muted', minutos: 0 },
    { nombre: 'Resuelto → cerrado', estados: ['Resuelto'], color: 'success', minutos: 0 },
  ];
  calcularDuraciones(eventos, ahora).forEach((e) => {
    const etapa = etapas.find((x) => x.estados.includes(e.estado));
    if (etapa && e.minutos) etapa.minutos += e.minutos;
  });
  const total = etapas.reduce((suma, e) => suma + e.minutos, 0);
  const maximo = Math.max(...etapas.map((e) => e.minutos), 1);
  return {
    total,
    etapas: etapas.map((e) => ({
      ...e,
      porcentajeDelTotal: total ? Math.round((e.minutos / total) * 100) : 0,
      anchoBarra: Math.round((e.minutos / maximo) * 100),
    })),
  };
};

// El tiempo en espera no cuenta para el tiempo esperado de atención
const minutosEnEspera = (eventos, ahora) =>
  calcularDuraciones(eventos, ahora)
    .filter((e) => e.estado === 'En espera')
    .reduce((suma, e) => suma + (e.minutos || 0), 0);

export const minutosDeAtencion = (ticket, eventos, ahora) => {
  const fin = eventos.find((e) => e.estado === 'Cerrado')?.fecha || ahora;
  return Math.max(0, minutosEntre(ticket.fechaRegistro, fin) - minutosEnEspera(eventos, fin));
};

// Minutos que faltan para vencer (negativo si ya venció)
export const minutosParaVencer = (ticket, eventos, ahora) =>
  ticket.tiempoEsperadoHoras * 60 - minutosDeAtencion(ticket, eventos, ahora);

// ---------- Formato ----------

export const formatearDuracion = (minutos) => {
  if (minutos === null || minutos === undefined) return '';
  const dias = Math.floor(minutos / 1440);
  const horas = Math.floor((minutos % 1440) / 60);
  const mins = minutos % 60;
  const partes = [];
  if (dias) partes.push(`${dias} d`);
  if (horas) partes.push(`${horas} h`);
  if (mins || partes.length === 0) partes.push(`${mins} min`);
  return partes.join(' ');
};

export const formatearFecha = (iso) =>
  new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Lima' });

export const formatearHora = (iso) =>
  new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Lima' });

export const formatearFechaCorta = (iso) =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Lima' });
