// Lista de tickets compartida por todas las pantallas, sin contexto ni Provider.
// Guarda los datos en memoria (se reinician al recargar la página) y avisa a las
// pantallas cuando cambian, para que el sidebar y "Mis tickets" se actualicen solos.
import { useSyncExternalStore } from 'react';
import db from '../../data/db.json';
import { crearTicket, crearEntradaBitacora, obtenerEncuestasSemilla, puedeCancelar } from './servicioTickets';

let estado = {
    tickets: db.tickets.map((t) => ({ ...t, bitacora: [...(t.bitacora || [])] })),
    encuestas: obtenerEncuestasSemilla(),
};

const oyentes = new Set();
const avisar = () => oyentes.forEach((f) => f());
const suscribir = (f) => {
    oyentes.add(f);
    return () => oyentes.delete(f);
};
const leer = () => estado;

// Devuelve el ticket nuevo; lanza un error si faltan datos (NuevoTicket lo captura y muestra el aviso)
export const registrarTicket = (datos) => {
    const nuevo = crearTicket(estado.tickets, datos);
    estado = { ...estado, tickets: [...estado.tickets, nuevo] };
    avisar();
    return nuevo;
};

export const agregarComentario = (ticketId, autorId, mensaje) => {
    estado = {
        ...estado,
        tickets: estado.tickets.map((t) =>
            t.id === ticketId
                ? { ...t, bitacora: [...t.bitacora, crearEntradaBitacora(t, autorId, mensaje)] }
                : t
        ),
    };
    avisar();
};

// Cancela el ticket solo si todavía se puede (Abierto y sin asignación)
export const cancelarTicket = (ticketId) => {
    estado = {
        ...estado,
        tickets: estado.tickets.map((t) =>
            t.id === ticketId && puedeCancelar(t)
                ? { ...t, estado: 'Cancelado', fechaCancelacion: new Date().toISOString() }
                : t
        ),
    };
    avisar();
};

// Se usa igual que antes: const { tickets, encuestas, registrarTicket, agregarComentario, cancelarTicket } = useTickets();
export const useTickets = () => {
    const { tickets, encuestas } = useSyncExternalStore(suscribir, leer);
    return { tickets, encuestas, registrarTicket, agregarComentario, cancelarTicket };
};