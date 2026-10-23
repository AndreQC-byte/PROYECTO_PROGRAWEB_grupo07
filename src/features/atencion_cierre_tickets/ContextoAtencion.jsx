import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerTickets, reemplazarTickets } from '../cola_asignacion/servicioCola';
import { guardarHistoriales, leerHistorialesGuardados, obtenerHistorialTicket } from './servicioAtencion';

const ContextoAtencion = createContext();

// Estado compartido entre el detalle del ticket y su historial de cambios (HU-5).
// Los tickets salen del almacén compartido (servicioCola) y cada cambio se guarda en
// localStorage: sobrevive a una recarga y lo ven la cola y el usuario dueño del ticket.
export const ProveedorAtencion = ({ children }) => {
  const { usuario } = useAuth();
  const [tickets, setTickets] = useState(obtenerTickets);
  const [historiales, setHistoriales] = useState(() => {
    const guardados = leerHistorialesGuardados();
    return Object.fromEntries(obtenerTickets().map((t) => [t.id, obtenerHistorialTicket(t, guardados)]));
  });
  const [notificacion, setNotificacion] = useState(null);

  useEffect(() => {
    reemplazarTickets(tickets);
  }, [tickets]);

  useEffect(() => {
    guardarHistoriales(historiales);
  }, [historiales]);

  const notificar = useCallback((tipo, mensaje) => setNotificacion({ tipo, mensaje }), []);

  useEffect(() => {
    if (!notificacion) return undefined;
    const temporizador = setTimeout(() => setNotificacion(null), 5000);
    return () => clearTimeout(temporizador);
  }, [notificacion]);

  const actualizarTicket = (id, cambios) =>
    setTickets((previos) => previos.map((t) => (t.id === id ? { ...t, ...cambios } : t)));

  const registrarEvento = (id, evento) =>
    setHistoriales((previos) => ({ ...previos, [id]: [...previos[id], evento] }));

  const agregarEntradaBitacora = (id, tipo, mensaje) => {
    const entrada = { id: `BIT-${Date.now()}`, autorId: usuario?.id, fecha: new Date().toISOString(), tipo, mensaje };
    setTickets((previos) => previos.map((t) => (t.id === id ? { ...t, bitacora: [...t.bitacora, entrada] } : t)));
  };

  const cambiarEstado = (id, nuevoEstado, { motivo = '', fechaRetorno = '' } = {}) => {
    const retorno = fechaRetorno && `retorno estimado ${fechaRetorno.split('-').reverse().join('/')}`;
    actualizarTicket(id, { estado: nuevoEstado });
    registrarEvento(id, {
      estado: nuevoEstado,
      fecha: new Date().toISOString(),
      autorId: usuario?.id,
      detalle: [motivo, retorno].filter(Boolean).join(' · '),
    });
  };

  const cerrarTicket = (id, solucion) => {
    actualizarTicket(id, { estado: 'Cerrado', solucion });
    registrarEvento(id, {
      estado: 'Cerrado',
      fecha: new Date().toISOString(),
      autorId: usuario?.id,
      detalle: 'encuesta enviada al usuario',
    });
  };

  return (
    <ContextoAtencion.Provider value={{ tickets, historiales, notificar, agregarEntradaBitacora, cambiarEstado, cerrarTicket }}>
      {children}
      {notificacion && (
        <div className={`atc-notificacion atc-notificacion-${notificacion.tipo}`} role="status">
          {notificacion.mensaje}
        </div>
      )}
    </ContextoAtencion.Provider>
  );
};

export const useAtencion = () => {
  const contexto = useContext(ContextoAtencion);
  if (!contexto) throw new Error('useAtencion debe usarse dentro de ProveedorAtencion');
  return contexto;
};
