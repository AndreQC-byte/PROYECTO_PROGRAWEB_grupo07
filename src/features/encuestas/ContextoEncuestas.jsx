import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fechaActual, obtenerEncuestasSemilla, puedeEditar, puedeResponder } from './servicioEncuestas';

const ContextoEncuestas = createContext();

// Estado compartido por las vistas de la HU-6 (responder, mis encuestas y satisfacción).
// En la Entrega 1 las respuestas viven en memoria; db.json no se modifica.
export const ProveedorEncuestas = ({ children }) => {
  const [encuestas, setEncuestas] = useState(obtenerEncuestasSemilla);
  const [notificacion, setNotificacion] = useState(null);
  // Momento de referencia para los plazos; se actualiza cada minuto para no calcular fechas durante el render
  const [ahora, setAhora] = useState(fechaActual);

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(fechaActual()), 60 * 1000);
    return () => clearInterval(intervalo);
  }, []);

  const notificar = useCallback((tipo, mensaje) => setNotificacion({ tipo, mensaje }), []);

  useEffect(() => {
    if (!notificacion) return undefined;
    const temporizador = setTimeout(() => setNotificacion(null), 5000);
    return () => clearTimeout(temporizador);
  }, [notificacion]);

  // Guarda la primera respuesta o una edición dentro del plazo. Devuelve false si el plazo ya venció.
  const guardarRespuesta = (id, respuesta) => {
    const momento = fechaActual();
    const encuesta = encuestas.find((e) => e.id === id);
    if (!encuesta || !(puedeResponder(encuesta, momento) || puedeEditar(encuesta, momento))) return false;
    setEncuestas((previas) =>
      previas.map((e) =>
        e.id === id ? { ...e, ...respuesta, estado: 'Respondida', fechaRespuesta: e.fechaRespuesta || momento } : e
      )
    );
    return true;
  };

  return (
    <ContextoEncuestas.Provider value={{ encuestas, ahora, notificar, guardarRespuesta }}>
      {children}
      {notificacion && (
        <div className={`enc-notificacion enc-notificacion-${notificacion.tipo}`} role="status">
          {notificacion.mensaje}
        </div>
      )}
    </ContextoEncuestas.Provider>
  );
};

export const useEncuestas = () => {
  const contexto = useContext(ContextoEncuestas);
  if (!contexto) throw new Error('useEncuestas debe usarse dentro de ProveedorEncuestas');
  return contexto;
};
