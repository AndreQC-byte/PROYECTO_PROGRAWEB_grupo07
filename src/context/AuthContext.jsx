import { createContext, useState, useContext } from 'react';
import * as servicioAuth from '../features/auth/servicioAuth';

const AuthContext = createContext();

const CLAVE_SESION = 'mesaAyuda.sesion';

// Solo se guarda el id del usuario. Con "Recordarme" va a localStorage (dura al cerrar
// el navegador); sin "Recordarme" va a sessionStorage (dura hasta cerrar la pestaña).
const leerSesionGuardada = () => {
  try {
    const id = localStorage.getItem(CLAVE_SESION) || sessionStorage.getItem(CLAVE_SESION);
    return id ? servicioAuth.obtenerUsuarioPorId(id) : null;
  } catch {
    return null;
  }
};

const guardarSesion = (id, recordar) => {
  try {
    (recordar ? localStorage : sessionStorage).setItem(CLAVE_SESION, id);
  } catch {
    // Sin almacenamiento disponible: la sesión dura hasta recargar la página
  }
};

const borrarSesion = () => {
  try {
    localStorage.removeItem(CLAVE_SESION);
    sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    // Nada que borrar
  }
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(leerSesionGuardada);

  // Devuelve el resultado del servicio: { ok, usuario } o { ok: false, tipo, mensaje }
  const iniciarSesion = (correo, contrasena, recordar = false) => {
    const resultado = servicioAuth.iniciarSesion(correo, contrasena);
    if (resultado.ok) {
      guardarSesion(resultado.usuario.id, recordar);
      setUsuario(resultado.usuario);
    }
    return resultado;
  };

  const cerrarSesion = () => {
    borrarSesion();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};