// Capa de datos y reglas de negocio de la HU-6 (Encuesta de satisfacción).
// Los componentes visuales no leen db.json: pasan por este módulo (separación por capas).
import db from '../../data/db.json';

const MS_MINUTO = 60 * 1000;
const MS_DIA = 24 * 60 * MS_MINUTO;
const ZONA_HORARIA = 'America/Lima';

// Días que tiene el usuario para responder la encuesta y, una vez enviada, para editarla
export const DIAS_PLAZO = 7;
export const LIMITE_COMENTARIO = 500;

export const ESCALA = [1, 2, 3, 4, 5];

export const ETIQUETA_PUNTAJE = {
  1: 'Muy mala atención',
  2: 'Mala atención',
  3: 'Atención regular',
  4: 'Buena atención',
  5: 'Excelente atención',
};

export const ASPECTOS = [
  { campo: 'puntajeRapidez', nombre: 'Rapidez', corto: 'Rapidez', error: 'Califica la rapidez' },
  { campo: 'puntajeTrato', nombre: 'Trato del técnico', corto: 'Trato', error: 'Califica el trato del técnico' },
  { campo: 'puntajeSolucion', nombre: 'Solución del problema', corto: 'Solución', error: 'Califica la solución del problema' },
];

export const FILTROS_PUNTAJE = [
  { valor: 'todos', etiqueta: 'Puntaje: todos', min: 1, max: 5 },
  { valor: 'bajos', etiqueta: 'Puntaje: 1 a 3', min: 1, max: 3 },
  { valor: 'altos', etiqueta: 'Puntaje: 4 a 5', min: 4, max: 5 },
];

export const PERIODOS_RAPIDOS = [
  { dias: 7, etiqueta: 'Últimos 7 días' },
  { dias: 30, etiqueta: 'Últimos 30 días' },
  { dias: 90, etiqueta: 'Últimos 90 días' },
];

// ---------- Lectura de datos semilla (solo lectura) ----------

export const obtenerEncuestasSemilla = () => (db.encuestas || []).map((e) => ({ ...e }));

const obtenerTicket = (id) => db.tickets.find((t) => t.id === id);
const obtenerUsuario = (id) => db.usuarios.find((u) => u.id === id);
const obtenerCategoria = (id) => db.categorias.find((c) => c.id === id);
const obtenerAmbiente = (id) => db.ambientes.find((a) => a.id === id);

// "Julio César" + "Paredes Soto" → "Julio Paredes Soto" (como en los mockups)
const nombreCorto = (usuario) => (usuario ? `${usuario.nombres.split(' ')[0]} ${usuario.apellidos}` : 'Usuario desconocido');

// Datos del ticket que se muestran junto a la encuesta. La fecha de envío de la encuesta es la del cierre del ticket.
export const detalleTicketEvaluado = (encuesta) => {
  const ticket = obtenerTicket(encuesta.ticketId);
  return {
    codigo: encuesta.ticketId,
    asunto: ticket?.asunto || 'Ticket no disponible',
    categoria: obtenerCategoria(ticket?.categoriaId)?.nombre || 'Sin categoría',
    ambiente: obtenerAmbiente(ticket?.ambienteId)?.codigo || 'Sin ambiente',
    tecnico: nombreCorto(obtenerUsuario(encuesta.tecnicoId)),
    fechaCierre: encuesta.fechaEnvio,
    minutosAtencion: ticket ? minutosEntre(ticket.fechaRegistro, encuesta.fechaEnvio) : null,
  };
};

// ---------- Fechas ----------

export const fechaActual = () => new Date().toISOString();

const sumarDias = (iso, dias) => new Date(new Date(iso).getTime() + dias * MS_DIA).toISOString();
const esPosterior = (a, b) => new Date(a) > new Date(b);
const minutosEntre = (desde, hasta) => Math.max(0, Math.round((new Date(hasta) - new Date(desde)) / MS_MINUTO));

// Día calendario en Lima con el formato de <input type="date"> (AAAA-MM-DD)
export const diaEnLima = (iso) => new Date(iso).toLocaleDateString('en-CA', { timeZone: ZONA_HORARIA });

// ---------- Reglas de la encuesta ----------

export const plazoRespuesta = (encuesta) => sumarDias(encuesta.fechaEnvio, DIAS_PLAZO);
export const plazoEdicion = (encuesta) => (encuesta.fechaRespuesta ? sumarDias(encuesta.fechaRespuesta, DIAS_PLAZO) : null);

// Una encuesta "Pendiente" pasa a "Vencida" cuando se cumple el plazo sin respuesta
export const estadoEncuesta = (encuesta, ahora) => {
  if (encuesta.estado === 'Respondida') return 'Respondida';
  return esPosterior(ahora, plazoRespuesta(encuesta)) ? 'Vencida' : 'Pendiente';
};

export const puedeResponder = (encuesta, ahora) => estadoEncuesta(encuesta, ahora) === 'Pendiente';
export const puedeEditar = (encuesta, ahora) => encuesta.estado === 'Respondida' && !esPosterior(ahora, plazoEdicion(encuesta));

export const validarRespuesta = (respuesta) => {
  const errores = {};
  if (!respuesta.puntajeGeneral) errores.puntajeGeneral = 'Selecciona un puntaje general';
  ASPECTOS.forEach(({ campo, error }) => {
    if (!respuesta[campo]) errores[campo] = error;
  });
  if (respuesta.comentario.trim().length > LIMITE_COMENTARIO) {
    errores.comentario = `El comentario no puede superar los ${LIMITE_COMENTARIO} caracteres`;
  }
  return errores;
};

// ---------- Vistas del usuario (6.1 y 6.2) ----------

const promedio = (valores) =>
  valores.length ? Math.round((valores.reduce((suma, v) => suma + v, 0) / valores.length) * 10) / 10 : null;

const masReciente = (campo) => (a, b) => new Date(b[campo]) - new Date(a[campo]);

export const resumenUsuario = (encuestas, usuarioId, ahora) => {
  const propias = encuestas.filter((e) => e.usuarioId === usuarioId);
  const respondidas = propias.filter((e) => e.estado === 'Respondida').sort(masReciente('fechaRespuesta'));
  const pendientes = propias
    .filter((e) => estadoEncuesta(e, ahora) === 'Pendiente')
    .sort((a, b) => new Date(plazoRespuesta(a)) - new Date(plazoRespuesta(b)));
  return { respondidas, pendientes, promedio: promedio(respondidas.map((e) => e.puntajeGeneral)) };
};

// ---------- Vista del supervisor (6.3) ----------

// Periodo desde la primera encuesta enviada hasta hoy
export const periodoCompleto = (encuestas, ahora) => {
  const dias = encuestas.map((e) => diaEnLima(e.fechaEnvio)).sort();
  const hoy = diaEnLima(ahora);
  return { desde: dias[0] && dias[0] < hoy ? dias[0] : hoy, hasta: dias.at(-1) > hoy ? dias.at(-1) : hoy };
};

export const periodoUltimosDias = (dias, ahora) => ({
  desde: diaEnLima(sumarDias(ahora, -(dias - 1))),
  hasta: diaEnLima(ahora),
});

export const validarPeriodo = ({ desde, hasta }) => {
  const errores = {};
  if (!desde) errores.desde = 'Indica la fecha de inicio';
  if (!hasta) errores.hasta = 'Indica la fecha de fin';
  if (desde && hasta && desde > hasta) errores.desde = 'La fecha de inicio no puede ser posterior a la fecha de fin';
  return errores;
};

// Se filtra por la fecha de envío (cierre del ticket) para que la tasa de respuesta sea comparable
export const filtrarPorPeriodo = (encuestas, { desde, hasta }) =>
  encuestas.filter((e) => {
    const dia = diaEnLima(e.fechaEnvio);
    return dia >= desde && dia <= hasta;
  });

const soloRespondidas = (encuestas) => encuestas.filter((e) => e.estado === 'Respondida');

export const resumenSatisfaccion = (encuestas) => {
  const respondidas = soloRespondidas(encuestas);
  return {
    enviadas: encuestas.length,
    respondidas: respondidas.length,
    tasaRespuesta: encuestas.length ? Math.round((respondidas.length / encuestas.length) * 100) : 0,
    promedioGeneral: promedio(respondidas.map((e) => e.puntajeGeneral)),
  };
};

const agruparPor = (lista, clave) =>
  lista.reduce((grupos, item) => {
    const valor = clave(item);
    return { ...grupos, [valor]: [...(grupos[valor] || []), item] };
  }, {});

const categoriaDeEncuesta = (encuesta) => obtenerTicket(encuesta.ticketId)?.categoriaId;

// Categoría que más se repite en los tickets evaluados del técnico (si no hay, su primera especialidad)
const categoriaPrincipal = (tecnicoId, encuestas) => {
  const conteo = agruparPor(encuestas.filter(categoriaDeEncuesta), categoriaDeEncuesta);
  const [masFrecuente] = Object.entries(conteo).sort((a, b) => b[1].length - a[1].length);
  const categoriaId = masFrecuente?.[0] || obtenerUsuario(tecnicoId)?.especialidades?.[0];
  return obtenerCategoria(categoriaId)?.nombre || 'Sin categoría';
};

export const promediosPorTecnico = (encuestas) =>
  Object.entries(agruparPor(soloRespondidas(encuestas), (e) => e.tecnicoId))
    .map(([tecnicoId, lista]) => ({
      tecnicoId,
      tecnico: nombreCorto(obtenerUsuario(tecnicoId)),
      categoriaPrincipal: categoriaPrincipal(tecnicoId, lista),
      general: promedio(lista.map((e) => e.puntajeGeneral)),
      aspectos: Object.fromEntries(ASPECTOS.map(({ campo }) => [campo, promedio(lista.map((e) => e[campo]))])),
      encuestas: lista.length,
    }))
    .sort((a, b) => a.tecnico.localeCompare(b.tecnico, 'es'));

const menorPromedio = (opciones) =>
  opciones.filter((o) => o.promedio !== null).sort((a, b) => a.promedio - b.promedio)[0] || null;

// Hallazgos que se muestran bajo la tabla: categoría y aspecto con el promedio más bajo
export const hallazgosDelPeriodo = (encuestas) => {
  const respondidas = soloRespondidas(encuestas);
  if (respondidas.length === 0) return null;
  const porCategoria = agruparPor(respondidas.filter(categoriaDeEncuesta), categoriaDeEncuesta);
  return {
    categoria: menorPromedio(
      Object.entries(porCategoria).map(([id, lista]) => ({
        nombre: obtenerCategoria(id)?.nombre || 'Sin categoría',
        promedio: promedio(lista.map((e) => e.puntajeGeneral)),
      }))
    ),
    aspecto: menorPromedio(ASPECTOS.map(({ campo, corto }) => ({ nombre: corto, promedio: promedio(respondidas.map((e) => e[campo])) }))),
  };
};

export const comentariosRecibidos = (encuestas, valorFiltro) => {
  const filtro = FILTROS_PUNTAJE.find((f) => f.valor === valorFiltro) || FILTROS_PUNTAJE[0];
  return soloRespondidas(encuestas)
    .filter((e) => e.comentario?.trim() && e.puntajeGeneral >= filtro.min && e.puntajeGeneral <= filtro.max)
    .sort(masReciente('fechaRespuesta'))
    .map((e) => ({
      id: e.id,
      puntaje: e.puntajeGeneral,
      categoria: obtenerCategoria(categoriaDeEncuesta(e))?.nombre || 'Sin categoría',
      tecnico: nombreCorto(obtenerUsuario(e.tecnicoId)),
      fecha: e.fechaRespuesta,
      comentario: e.comentario.trim(),
    }));
};

// Color del puntaje: rojo hasta 2, ámbar en 3 y verde desde 4
export const tonoPuntaje = (puntaje) => {
  if (puntaje <= 2) return 'peligro';
  if (puntaje === 3) return 'alerta';
  return 'exito';
};

const celdaCsv = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`;

export const generarCsvSatisfaccion = (filas, periodo) => {
  const encabezado = ['Técnico', 'Categoría principal', 'General', ...ASPECTOS.map((a) => a.corto), 'Encuestas'];
  const lineas = filas.map((f) =>
    [f.tecnico, f.categoriaPrincipal, formatearPromedio(f.general), ...ASPECTOS.map((a) => formatearPromedio(f.aspectos[a.campo])), f.encuestas]
      .map(celdaCsv)
      .join(',')
  );
  // El BOM inicial permite que Excel muestre bien las tildes
  return '﻿' + [
    celdaCsv(`Periodo: ${formatearDia(periodo.desde)} - ${formatearDia(periodo.hasta)}`),
    encabezado.map(celdaCsv).join(','),
    ...lineas,
  ].join('\r\n');
};

// ---------- Formato ----------

export const plural = (cantidad, singular, varios) => `${cantidad} ${cantidad === 1 ? singular : varios}`;

export const formatearPromedio = (valor) => (valor === null || valor === undefined ? '—' : valor.toFixed(1));

export const formatearFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: ZONA_HORARIA });

// "2026-09-07" → "07/09/2026"
export const formatearDia = (dia) => dia.split('-').reverse().join('/');

export const formatearDuracion = (minutos) => {
  if (minutos === null || minutos === undefined) return 'Sin dato';
  const dias = Math.floor(minutos / 1440);
  const horas = Math.floor((minutos % 1440) / 60);
  const mins = minutos % 60;
  const partes = [];
  if (dias) partes.push(`${dias} d`);
  if (horas) partes.push(`${horas} h`);
  if (mins || partes.length === 0) partes.push(`${mins} min`);
  return partes.join(' ');
};
