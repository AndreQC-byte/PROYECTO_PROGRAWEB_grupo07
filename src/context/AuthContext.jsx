import { createContext, useState, useContext } from 'react';
import db from '../data/db.json'; // Consumo del archivo JSON semilla acordado por el grupo

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estado inicial simulando a un visitante (sin sesión)
  const [usuario, setUsuario] = useState(null);

  // Función provisional para desarrollo en paralelo
  const iniciarSesion = (correo) => {
    // Busca en los datos semilla el usuario que coincida con el correo
    const usuarioEncontrado = db.usuarios.find(u => u.correo === correo);
    if (usuarioEncontrado) {
      setUsuario(usuarioEncontrado);
      return true;
    }
    return false;
  };

  const cerrarSesion = () => {
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
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};