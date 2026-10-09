import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import ListaCategorias from '../features/catalogo/ListaCategorias';
// Importaciones simuladas para las demás historias en desarrollo
const VistaTemporal = ({ nombre }) => <div className="contenedor-principal"><h2>Vista en desarrollo: {nombre}</h2></div>;
const AccesoDenegado = () => <div className="contenedor-principal"><h2>403 - No tienes permiso para ver esta sección</h2></div>; // Vista requerida por HU-1[cite: 3]

// Componente para proteger rutas según el rol[cite: 3]
const RutaProtegida = ({ children, rolesPermitidos }) => {
  const { usuario } = useAuth();
  
  if (!usuario) return <Navigate to="/login" />;
  if (!rolesPermitidos.includes(usuario.rol)) return <Navigate to="/403" />;
  
  return children;
};

const AppRouter = () => {
  const { usuario } = useAuth();

  return (
    <BrowserRouter>
      {/* Aquí irá el <Encabezado /> y <NavegacionSidebar /> del módulo compartido[cite: 3] */}
      <Routes>
        {/* Rutas de Visitante[cite: 4] */}
        <Route path="/" element={<VistaTemporal nombre="Landing Pública" />} />
        <Route path="/login" element={<VistaTemporal nombre="Inicio de Sesión" />} />

        {/* Redirección a la vista principal según el rol (Requerimiento HU-1)[cite: 3] */}
        <Route path="/dashboard" element={
          usuario?.rol === 'Usuario' ? <Navigate to="/mis-tickets" /> :
          usuario?.rol === 'Técnico' ? <Navigate to="/tecnico/bandeja" /> :
          usuario?.rol === 'Supervisor' ? <Navigate to="/supervisor/cola" /> :
          <Navigate to="/" />
        } />

        {/* Rutas de Usuario[cite: 4] */}
        <Route path="/mis-tickets" element={
          <RutaProtegida rolesPermitidos={['Usuario']}>
            <VistaTemporal nombre="Mis Tickets" />
          </RutaProtegida>
        } />

        {/* Rutas de Técnico[cite: 4] */}
        <Route path="/tecnico/bandeja" element={
          <RutaProtegida rolesPermitidos={['Técnico']}>
            <VistaTemporal nombre="Mi Bandeja" />
          </RutaProtegida>
        } />

        {/* Rutas de Supervisor (Incluye tu HU-2)[cite: 4] */}
        <Route path="/supervisor/cola" element={
          <RutaProtegida rolesPermitidos={['Supervisor']}>
            <VistaTemporal nombre="Cola de Atención" />
          </RutaProtegida>
        } />
        <Route path="/catalogo/categorias" element={
          <RutaProtegida rolesPermitidos={['Supervisor']}>
            <ListaCategorias />
          </RutaProtegida>
        } />

        {/* Rutas de Error */}
        <Route path="/403" element={<AccesoDenegado />} />
        <Route path="*" element={<VistaTemporal nombre="404 - No encontrado" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;