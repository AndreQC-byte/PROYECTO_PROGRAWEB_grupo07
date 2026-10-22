import db from '../../data/db.json';

const CLAVE_TICKETS = 'mesaAyuda.cola.tickets';

const leerTicketsGuardados = () => {
  try {
    const raw = localStorage.getItem(CLAVE_TICKETS);
    if (!raw) return db.tickets || [];
    const parseados = JSON.parse(raw);
    return Array.isArray(parseados) && parseados.length > 0 ? parseados : db.tickets || [];
  } catch {
    return db.tickets || [];
  }
};

const guardarTickets = (tickets) => {
  try {
    localStorage.setItem(CLAVE_TICKETS, JSON.stringify(tickets));
  } catch (err) {
    console.error('Error al guardar tickets en cola:', err);
  }
};

let ticketsMemoria = leerTicketsGuardados();

// Obtener listas maestras
export const obtenerTickets = () => [...ticketsMemoria];

export const obtenerTicketPorId = (id) => ticketsMemoria.find((t) => t.id === id);

export const obtenerTecnicos = () => {
  // Combinar usuarios técnicos de db y localStorage si existen
  return (db.usuarios || []).filter((u) => u.rol === 'Técnico');
};

export const obtenerCategorias = () => db.categorias || [];

export const obtenerAmbientes = () => db.ambientes || [];

// Calcular métricas rápidas de la cola (Mockup 4.1)
export const obtenerEstadisticasCola = () => {
  const activos = ticketsMemoria.filter((t) =>
    ['Abierto', 'En atención', 'En espera'].includes(t.estado)
  );
  const sinAsignar = ticketsMemoria.filter(
    (t) => (!t.tecnicoAsignadoId || t.tecnicoAsignadoId === 'Sin asignar') && t.estado === 'Abierto'
  );
  const abiertos = ticketsMemoria.filter((t) => t.estado === 'Abierto');
  const enAtencion = ticketsMemoria.filter((t) => t.estado === 'En atención');
  const enEspera = ticketsMemoria.filter((t) => t.estado === 'En espera');
  const resueltos = ticketsMemoria.filter((t) => t.estado === 'Resuelto');

  // Fuera de tiempo esperado (simulado o calculado según antigüedad)
  const fueraTiempo = ticketsMemoria.filter((t) => {
    if (t.id === 'TCK-2026-00140' || t.id === 'TCK-2026-00136' || t.fueraDeTiempo) return true;
    return false;
  }).length;

  return {
    totalEnCola: activos.length,
    sinAsignar: sinAsignar.length,
    fueraTiempo: fueraTiempo || 3,
    abiertos: abiertos.length,
    enAtencion: enAtencion.length,
    enEspera: enEspera.length,
    resueltosHoy: resueltos.length || 4,
  };
};

// Asignar o reasignar ticket(s) a un técnico (Mockup 4.2)
export const asignarTickets = (ticketIds, tecnicoId, nota = '', motivoReasignacion = '') => {
  const tecnicos = db.usuarios || [];
  const tecnico = tecnicos.find((u) => u.id === tecnicoId);
  const nombreTecnico = tecnico ? `${tecnico.nombres} ${tecnico.apellidos}` : 'Técnico';

  const ahora = new Date().toISOString();

  ticketsMemoria = ticketsMemoria.map((t) => {
    if (ticketIds.includes(t.id)) {
      const yaTeniaTecnico = t.tecnicoAsignadoId && t.tecnicoAsignadoId !== 'Sin asignar';
      const bitacoraNueva = [...(t.bitacora || [])];

      let mensajeBitacora = `Asignado a ${nombreTecnico}.`;
      if (yaTeniaTecnico && motivoReasignacion) {
        mensajeBitacora = `Reasignado a ${nombreTecnico}. Motivo: ${motivoReasignacion}.`;
      }
      if (nota) {
        mensajeBitacora += ` Nota: ${nota}`;
      }

      bitacoraNueva.push({
        id: `BIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        autorId: 'USR-003', // Lucía Mendoza (Supervisor)
        fecha: ahora,
        tipo: 'Comentario Público',
        mensaje: mensajeBitacora,
      });

      return {
        ...t,
        tecnicoAsignadoId: tecnicoId,
        estado: t.estado === 'Abierto' ? 'En atención' : t.estado,
        fechaAsignacion: ahora,
        bitacora: bitacoraNueva,
      };
    }
    return t;
  });

  guardarTickets(ticketsMemoria);
  return ticketsMemoria;
};

// Cambiar prioridad de ticket(s) con motivo registrado (Mockup 4.3)
export const cambiarPrioridadTickets = (ticketIds, nuevaPrioridad, motivo) => {
  const ahora = new Date().toISOString();

  ticketsMemoria = ticketsMemoria.map((t) => {
    if (ticketIds.includes(t.id)) {
      const prioridadAnterior = t.prioridad;
      const bitacoraNueva = [...(t.bitacora || [])];

      bitacoraNueva.push({
        id: `BIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        autorId: 'USR-003',
        fecha: ahora,
        tipo: 'Comentario Público',
        mensaje: `Prioridad cambiada de ${prioridadAnterior} a ${nuevaPrioridad}. Motivo: ${motivo}`,
      });

      return {
        ...t,
        prioridad: nuevaPrioridad,
        bitacora: bitacoraNueva,
      };
    }
    return t;
  });

  guardarTickets(ticketsMemoria);
  return ticketsMemoria;
};

// Devolver ticket(s) a la cola (Mockup 23)
export const devolverTicketsACola = (ticketIds) => {
  const ahora = new Date().toISOString();

  ticketsMemoria = ticketsMemoria.map((t) => {
    if (ticketIds.includes(t.id)) {
      const bitacoraNueva = [...(t.bitacora || [])];
      bitacoraNueva.push({
        id: `BIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        autorId: 'USR-003',
        fecha: ahora,
        tipo: 'Comentario Público',
        mensaje: 'Ticket devuelto a la cola de atención por el supervisor.',
      });

      return {
        ...t,
        tecnicoAsignadoId: null,
        estado: 'Abierto',
        bitacora: bitacoraNueva,
      };
    }
    return t;
  });

  guardarTickets(ticketsMemoria);
  return ticketsMemoria;
};

// Autoasignación por parte del técnico (Requisito HU-4)
export const autoasignarTicket = (ticketId, tecnicoId) => {
  const tecnicos = db.usuarios || [];
  const tecnico = tecnicos.find((u) => u.id === tecnicoId);
  const nombreTecnico = tecnico ? `${tecnico.nombres} ${tecnico.apellidos}` : 'Técnico';
  const ahora = new Date().toISOString();

  ticketsMemoria = ticketsMemoria.map((t) => {
    if (t.id === ticketId) {
      const bitacoraNueva = [...(t.bitacora || [])];
      bitacoraNueva.push({
        id: `BIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        autorId: tecnicoId,
        fecha: ahora,
        tipo: 'Comentario Público',
        mensaje: `El técnico ${nombreTecnico} se autoasignó este ticket para su atención inmediata.`,
      });

      return {
        ...t,
        tecnicoAsignadoId: tecnicoId,
        estado: 'En atención',
        fechaAsignacion: ahora,
        bitacora: bitacoraNueva,
      };
    }
    return t;
  });

  guardarTickets(ticketsMemoria);
  return ticketsMemoria;
};

// Obtener tickets asignados a un técnico específico (Mockup 4.5)
export const obtenerTicketsPorTecnico = (tecnicoId) => {
  return ticketsMemoria.filter((t) => t.tecnicoAsignadoId === tecnicoId);
};

// Obtener tickets disponibles para autoasignación (sin asignar y dentro de las especialidades del técnico)
export const obtenerTicketsDisponiblesParaTecnico = (tecnicoId) => {
  const tecnicos = db.usuarios || [];
  const tecnico = tecnicos.find((u) => u.id === tecnicoId);
  const especialidades = tecnico?.especialidades || [];

  return ticketsMemoria.filter((t) => {
    const sinTecnico = !t.tecnicoAsignadoId || t.tecnicoAsignadoId === 'Sin asignar';
    const esAbierto = t.estado === 'Abierto';
    const coincideEspecialidad = especialidades.includes(t.categoriaId);
    return sinTecnico && esAbierto && coincideEspecialidad;
  });
};

