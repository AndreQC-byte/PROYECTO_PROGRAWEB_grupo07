import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import LayoutPublico from '../features/auth/LayoutPublico';
import Landing from '../features/auth/Landing';
import Login from '../features/auth/Login';
import Registro from '../features/auth/Registro';
import AltaInvitacion from '../features/auth/AltaInvitacion';
import ListaCategorias from '../features/catalogo/ListaCategorias';
import LayoutAtencion from '../features/atencion_cierre_tickets/LayoutAtencion';
import DetalleTicket from '../features/atencion_cierre_tickets/DetalleTicket';
import HistorialCambios from '../features/atencion_cierre_tickets/HistorialCambios';
import NuevoTicket from '../features/registro_seguimiento_tickets/NuevoTicket';
import ConfirmacionTicket from '../features/registro_seguimiento_tickets/ConfirmacionTicket';
import MisTickets from '../features/registro_seguimiento_tickets/MisTickets';
import DetalleTicketUsuario from '../features/registro_seguimiento_tickets/DetalleTicketUsuario';
import TicketCerradoEncuesta from '../features/registro_seguimiento_tickets/TicketCerradoEncuesta';

import LayoutEncuestas from '../features/encuestas/LayoutEncuestas';
import MisEncuestas from '../features/encuestas/MisEncuestas';
import EncuestaPendiente from '../features/encuestas/EncuestaPendiente';
import ResponderEncuesta from '../features/encuestas/ResponderEncuesta';
import SatisfaccionSupervisor from '../features/encuestas/SatisfaccionSupervisor';
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
        <Route element={<LayoutPublico />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/invitacion/:id" element={<AltaInvitacion />} />
        </Route>

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
            <MisTickets />
          </RutaProtegida>
        } />
        <Route path="/mis-tickets/nuevo" element={<NuevoTicket />} />
        <Route path="/mis-tickets/nuevo/registrado" element={<ConfirmacionTicket />} />
        <Route path="/mis-tickets/:codigo" element={<DetalleTicketUsuario />} />
        <Route path="/mis-tickets/cerrado" element={<TicketCerradoEncuesta />} />
        <Route path="/mis-tickets/cerrado/reabrir" element={<TicketCerradoEncuesta />} />

        {/* HU-6: Encuesta de satisfacción (Usuario). La ruta padre comparte las respuestas entre las vistas */}
        <Route element={
          <RutaProtegida rolesPermitidos={['Usuario']}>
            <LayoutEncuestas />
          </RutaProtegida>
        }>
          <Route path="/encuestas" element={<MisEncuestas />} />
          <Route path="/encuestas/pendiente" element={<EncuestaPendiente />} />
          <Route path="/encuestas/:ticketId" element={<ResponderEncuesta />} />
        </Route>

        {/* Rutas de Técnico[cite: 4] */}
        <Route path="/tecnico/bandeja" element={
          <RutaProtegida rolesPermitidos={['Técnico']}>
            <VistaTemporal nombre="Mi Bandeja" />
          </RutaProtegida>
        } />

        {/* HU-5: Atención y cierre (solo Técnico). La ruta padre comparte el estado entre el detalle y el historial */}
        <Route element={
          <RutaProtegida rolesPermitidos={['Técnico']}>
            <LayoutAtencion />
          </RutaProtegida>
        }>
          <Route path="/tecnico/ticket/:id" element={<DetalleTicket />} />
          <Route path="/tecnico/ticket/:id/historial" element={<HistorialCambios />} />
        </Route>

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

        {/* HU-6: satisfacción por técnico y categoría (solo Supervisor) */}
        <Route element={
          <RutaProtegida rolesPermitidos={['Supervisor']}>
            <LayoutEncuestas />
          </RutaProtegida>
        }>
          <Route path="/supervisor/satisfaccion" element={<SatisfaccionSupervisor />} />
        </Route>

        {/* Rutas de Error */}
        <Route path="/403" element={<AccesoDenegado />} />
        <Route path="*" element={<VistaTemporal nombre="404 - No encontrado" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;