// Capa de datos y reglas de negocio de la HU-3 (Registro y seguimiento de tickets).
import db from '../../data/db.json';
import {
    construirHistorialInicial,
    nombreCorto,
    obtenerSubcategoria,
    obtenerUsuario,
} from '../atencion_cierre_tickets/servicioAtencion';

export const ESTADOS_TERMINADOS = ['Resuelto', 'Cerrado'];
export const ESTADOS = ['Abierto', 'Asignado', 'En atención', 'En espera', 'Resuelto', 'Cerrado', 'Reabierto', 'Cancelado'];
export const PRIORIDADES = ['Crítica', 'Alta', 'Media', 'Baja'];
export const DIAS_PLAZO_ENCUESTA = 7; // la encuesta y la reapertura se admiten hasta 7 días después del cierre

const MS_MINUTO = 60 * 1000;
const MS_HORA = 60 * MS_MINUTO;
const MS_DIA = 24 * MS_HORA;

// En curso = no terminó y no fue cancelado
export const estaEnCurso = (ticket) =>
    !ESTADOS_TERMINADOS.includes(ticket.estado) && ticket.estado !== 'Cancelado';

// Solo se cancela si nadie lo tomó todavía
export const puedeCancelar = (ticket) =>
    ticket.estado === 'Abierto' && !ticket.tecnicoAsignadoId;

// ---------- Formato de fechas ----------

// "2026-09-07T14:30:00Z" -> "07/09/2026 09:30" (hora de Lima)
export const formatearFechaHora = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Lima',
    }).replace(',', '');
};

// Día en hora de Lima como "AAAA-MM-DD" (para comparar con los filtros de fecha)
export const diaLima = (iso) =>
    new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Lima' });

// "2026-09-07" o ISO completo -> "07/09/2026" (hora de Lima)
export const formatearDia = (iso) => {
    if (!iso) return '';
    if (iso.length === 10) return iso.split('-').reverse().join('/');
    return diaLima(iso).split('-').reverse().join('/');
};

// Cantidad de tickets del usuario y cuántos siguen en curso (para el sidebar y "Mis tickets")
export const contarTickets = (tickets, usuarioId) => {
    const mios = tickets.filter((t) => t.usuarioId === usuarioId);
    return { total: mios.length, enCurso: mios.filter(estaEnCurso).length };
};

// ---------- Catálogo (categorías, subcategorías, ambientes) ----------

export const obtenerCategoriasActivas = () =>
    db.categorias.filter((c) => c.estado === 'Activa');

export const obtenerSubcategoriasDe = (categoriaId) =>
    db.subcategorias.filter((s) => s.categoriaPadreId === categoriaId && s.estado === 'Activa');

export const buscarAmbientePorCodigo = (codigo) =>
    db.ambientes.find((a) => a.codigo.toLowerCase() === codigo.trim().toLowerCase());

// "Aula - Pabellón A - piso 2"
export const describirAmbiente = (ambiente) =>
    `${ambiente.tipo} - Pabellón ${ambiente.pabellon} - piso ${ambiente.piso}`;

export const obtenerEncuestasSemilla = () => db.encuestas.map((e) => ({ ...e }));

// ---------- Consultas sobre tickets y encuestas ----------

// Los tickets del usuario, del más reciente al más antiguo
export const ticketsDeUsuario = (tickets, usuarioId) =>
    tickets
        .filter((t) => t.usuarioId === usuarioId)
        .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro));

export const encuestasDeUsuario = (encuestas, usuarioId, estado) =>
    encuestas.filter((e) => e.usuarioId === usuarioId && (!estado || e.estado === estado));

// Encuestas que el usuario aún puede responder: pendientes y dentro del plazo de 7 días
export const contarEncuestasPendientes = (encuestas, usuarioId) =>
    encuestasDeUsuario(encuestas, usuarioId, 'Pendiente').filter(
        (e) => Date.now() <= new Date(e.fechaEnvio).getTime() + DIAS_PLAZO_ENCUESTA * MS_DIA
    ).length;

// Solo lo que el usuario puede ver: las notas internas del equipo técnico no
export const comentariosPublicos = (ticket) =>
    ticket.bitacora.filter((b) => b.tipo === 'Comentario Público');

// Fecha límite = fecha de registro + tiempo esperado de la subcategoría
export const fechaLimiteAtencion = (ticket) =>
    new Date(new Date(ticket.fechaRegistro).getTime() + ticket.tiempoEsperadoHoras * MS_HORA).toISOString();

// Minutos que pasaron desde una fecha hasta ahora
export const minutosDesde = (iso) =>
    Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / MS_MINUTO));

// La encuesta se envía al cerrar el ticket, así que su fecha de envío es la del cierre
export const fechaCierre = (ticket, encuestas) =>
    encuestas.find((e) => e.ticketId === ticket.id)?.fechaEnvio || null;

// ---------- Encuesta pendiente y reapertura ----------

// Devuelve la encuesta pendiente del ticket o null
// (se asume que el estado de una encuesta sin responder es 'Pendiente')
export const encuestaPendienteDe = (ticket, encuestas) =>
    encuestas.find((e) => e.ticketId === ticket.id && e.estado === 'Pendiente') || null;

// Datos que muestra TicketCerradoEncuesta: quién resolvió, cuándo, la solución y el plazo de 7 días
export const datosCierre = (ticket, encuestas) => {
    const cierre = fechaCierre(ticket, encuestas);
    const limite = cierre ? new Date(new Date(cierre).getTime() + DIAS_PLAZO_ENCUESTA * MS_DIA).toISOString() : null;

    // La solución es la última respuesta pública de alguien del equipo (no del usuario)
    const respuestas = comentariosPublicos(ticket).filter(
        (c) => obtenerUsuario(c.autorId)?.rol !== 'Usuario'
    );
    const ultima = respuestas[respuestas.length - 1];
    const autor = obtenerUsuario(ultima?.autorId) || obtenerUsuario(ticket.tecnicoAsignadoId);

    return {
        fechaResolucion: cierre,
        resueltoPor: autor ? nombreCorto(autor) : '',
        solucion: ultima?.mensaje || '',
        fechaLimite: limite,
        vencido: limite ? Date.now() > new Date(limite).getTime() : false,
    };
};

// ---------- Filtros de "Mis tickets" ----------
// estado: 'todos' | 'en curso' | un estado exacto ('Abierto', 'Cerrado'...)
// desde y hasta: 'AAAA-MM-DD' o vacío
export const filtrarTickets = (
    tickets,
    { busqueda = '', estado = 'todos', categoriaId = 'todas', prioridad = 'todas', desde = '', hasta = '' }
) =>
    tickets.filter((t) => {
        const texto = busqueda.trim().toLowerCase();
        if (texto && !t.id.toLowerCase().includes(texto)) return false;
        if (estado === 'en curso' && !estaEnCurso(t)) return false;
        if (estado !== 'todos' && estado !== 'en curso' && t.estado !== estado) return false;
        if (categoriaId !== 'todas' && t.categoriaId !== categoriaId) return false;
        if (prioridad !== 'todas' && t.prioridad !== prioridad) return false;
        const dia = diaLima(t.fechaRegistro);
        if (desde && dia < desde) return false;
        if (hasta && dia > hasta) return false;
        return true;
    });

// ---------- Registro de un ticket nuevo ----------

// Hay duplicado si ya existe un ticket en curso con el mismo ambiente y la misma categoría
export const buscarDuplicado = (tickets, ambienteId, categoriaId) =>
    tickets.find(
        (t) => t.ambienteId === ambienteId && t.categoriaId === categoriaId && estaEnCurso(t)
    );

// Siguiente código: si el último es TCK-2026-00158, el nuevo es TCK-2026-00159
export const generarCodigo = (tickets) => {
    const ultimo = Math.max(0, ...tickets.map((t) => Number(t.id.slice(-5))));
    return `TCK-2026-${String(ultimo + 1).padStart(5, '0')}`;
};

// Arma el ticket con la misma forma que los de db.json.
// La prioridad y el tiempo esperado salen de la subcategoría elegida.
// datos.origen (opcional) = { ticketId, motivo } cuando se registra a partir de una reapertura.
export const crearTicket = (tickets, datos) => {
    const subcategoria = obtenerSubcategoria(datos.subcategoriaId);
    if (!datos.usuarioId || !subcategoria) {
        throw new Error('No se pudo registrar el ticket: faltan datos');
    }

    const ahora = new Date().toISOString();
    const id = generarCodigo(tickets);

    const bitacora = datos.origen
        ? [
            {
                id: `BIT-${id}-1`,
                autorId: datos.usuarioId,
                fecha: ahora,
                tipo: 'Comentario Público',
                mensaje: `Reapertura de ${datos.origen.ticketId}. Motivo: ${datos.origen.motivo}`,
            },
        ]
        : [];

    return {
        id,
        asunto: datos.asunto,
        descripcion: datos.descripcion,
        usuarioId: datos.usuarioId,
        categoriaId: datos.categoriaId,
        subcategoriaId: datos.subcategoriaId,
        ambienteId: datos.ambienteId,
        tecnicoAsignadoId: null,
        prioridad: subcategoria.prioridadDefecto,
        estado: 'Abierto',
        fechaRegistro: ahora,
        fechaAsignacion: null,
        tiempoEsperadoHoras: subcategoria.tiempoEsperadoHoras,
        bitacora,
        evidencia: datos.evidencia || null,
    };
};

export const crearEntradaBitacora = (ticket, autorId, mensaje) => ({
    id: `BIT-${ticket.id}-${ticket.bitacora.length + 1}`,
    autorId,
    fecha: new Date().toISOString(),
    tipo: 'Comentario Público',
    mensaje,
});

// ---------- Línea de tiempo del detalle ----------
// Devuelve [{ tipo, titulo, fecha, detalle }]; fecha es null si todavía no ocurrió.
export const construirLineaTiempo = (ticket, encuestas) => {
    const tecnico = obtenerUsuario(ticket.tecnicoAsignadoId);
    const nombreTecnico = tecnico ? nombreCorto(tecnico) : '';

    const hitos = construirHistorialInicial(ticket).map((e) => {
        if (e.estado === 'Abierto') {
            return { tipo: 'abierto', titulo: 'Abierto', fecha: e.fecha, detalle: 'registrado por ti' };
        }
        if (e.estado === 'Asignado') {
            return { tipo: 'asignado', titulo: 'Asignado', fecha: e.fecha, detalle: nombreTecnico };
        }
        return { tipo: 'actual', titulo: 'En atención', fecha: e.fecha, detalle: nombreTecnico };
    });

    // Ticket cancelado: la línea termina en "Cancelado" y no muestra pasos pendientes
    if (ticket.estado === 'Cancelado') {
        hitos.push({
            tipo: 'cerrado',
            titulo: 'Cancelado',
            fecha: ticket.fechaCancelacion || null,
            detalle: 'cancelado por ti',
        });
        return hitos;
    }

    if (ESTADOS_TERMINADOS.includes(ticket.estado)) {
        // El ticket ya terminó: el último paso deja de ser "actual"
        hitos.forEach((h) => {
            if (h.tipo === 'actual') h.tipo = 'asignado';
        });
        hitos.push({
            tipo: 'cerrado',
            titulo: ticket.estado,
            fecha: fechaCierre(ticket, encuestas),
            detalle: nombreTecnico,
        });
    } else {
        ['Asignado', 'En atención', 'Resuelto']
            .filter((titulo) => !hitos.some((h) => h.titulo === titulo))
            .forEach((titulo) =>
                hitos.push({ tipo: 'pendiente', titulo, fecha: null, detalle: 'Pendiente' })
            );
    }

    return hitos;
};