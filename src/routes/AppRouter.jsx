import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Módulo compartido de Layout
import LayoutCompartido from '../components/layouts/LayoutCompartido';

// HU-1: Cuenta y acceso
import LayoutPublico from '../features/auth/LayoutPublico';
import Landing from '../features/auth/Landing';
import Login from '../features/auth/Login';
import Registro from '../features/auth/Registro';
import RecuperarPassword from '../features/auth/RecuperarPassword';
import AltaInvitacion from '../features/auth/AltaInvitacion';
import MiCuenta from '../features/auth/MiCuenta';
import AccesoDenegado from '../features/auth/AccesoDenegado';

// HU-2: Catálogo de servicios
import ListaCategorias from '../features/catalogo/ListaCategorias';
import FormularioCategoria from '../features/catalogo/FormularioCategoria';
import SedesYAmbientes from '../features/catalogo/SedesYAmbientes';
import TecnicosPorCategoria from '../features/catalogo/TecnicosPorCategoria';

// HU-3: Registro y seguimiento de tickets
import NuevoTicket from '../features/registro_seguimiento_tickets/NuevoTicket';
import ConfirmacionTicket from '../features/registro_seguimiento_tickets/ConfirmacionTicket';
import MisTickets from '../features/registro_seguimiento_tickets/MisTickets';
import DetalleTicketUsuario from '../features/registro_seguimiento_tickets/DetalleTicketUsuario';
import TicketCerradoEncuesta from '../features/registro_seguimiento_tickets/TicketCerradoEncuesta';

// HU-4: Cola y asignación
import ColaTickets from '../features/cola_asignacion/ColaTickets';
import MiBandeja from '../features/cola_asignacion/MiBandeja';

// HU-5: Atención y cierre
import LayoutAtencion from '../features/atencion_cierre_tickets/LayoutAtencion';
import DetalleTicket from '../features/atencion_cierre_tickets/DetalleTicket';
import HistorialCambios from '../features/atencion_cierre_tickets/HistorialCambios';

// HU-6: Encuestas de satisfacción
import { ProveedorEncuestas } from '../features/encuestas/ContextoEncuestas';
import LayoutEncuestas from '../features/encuestas/LayoutEncuestas';
import MisEncuestas from '../features/encuestas/MisEncuestas';
import EncuestaPendiente from '../features/encuestas/EncuestaPendiente';
import ResponderEncuesta from '../features/encuestas/ResponderEncuesta';
import SatisfaccionSupervisor from '../features/encuestas/SatisfaccionSupervisor';

// Vistas complementarias en desarrollo
const VistaTemporal = ({ nombre }) => (
  <div className="catalogo-vacio-caja" style={{ margin: '40px auto', maxWidth: '600px' }}>
    <div className="catalogo-vacio-icono">⚙️</div>
    <div className="catalogo-vacio-titulo">{nombre}</div>
    <p className="catalogo-vacio-desc">Esta sección complementaria está en proceso de integración.</p>
  </div>
);

// Componente para proteger rutas según el rol
const RutaProtegida = ({ children, rolesPermitidos }) => {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/login" replace />;
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

const AppRouter = () => {
  const { usuario } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas de Visitante (sin sesión) */}
        <Route element={<LayoutPublico />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/invitacion/:id" element={<AltaInvitacion />} />
          <Route path="/recuperar" element={<RecuperarPassword />} />
          <Route path="/recuperar/:token" element={<RecuperarPassword />} />
        </Route>

        {/* Redirección automática según el rol (Requerimiento HU-1) */}
        <Route
          path="/dashboard"
          element={
            usuario?.rol === 'Usuario' ? (
              <Navigate to="/mis-tickets" replace />
            ) : usuario?.rol === 'Técnico' ? (
              <Navigate to="/tecnico/bandeja" replace />
            ) : usuario?.rol === 'Supervisor' ? (
              <Navigate to="/supervisor/cola" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Alias de inicio */}
        <Route path="/inicio" element={<Navigate to="/dashboard" replace />} />

        {/* ============================================================== */}
        {/* RUTAS CON LAYOUT COMPARTIDO: SUPERVISOR (HU-2, HU-4, HU-6)     */}
        {/* ============================================================== */}
        <Route
          element={
            <RutaProtegida rolesPermitidos={['Supervisor']}>
              <LayoutCompartido />
            </RutaProtegida>
          }
        >
          {/* HU-4: Cola de atención */}
          <Route path="/supervisor/cola" element={<ColaTickets />} />
          <Route path="/supervisor/bandejas" element={<ColaTickets />} />

          {/* HU-2: Catálogo de servicios */}
          <Route path="/catalogo/categorias" element={<ListaCategorias />} />
          <Route path="/catalogo/categorias/nueva" element={<FormularioCategoria />} />
          <Route path="/catalogo/categorias/editar/:id" element={<FormularioCategoria />} />
          <Route path="/catalogo/ambientes" element={<SedesYAmbientes />} />
          <Route path="/catalogo/tecnicos" element={<TecnicosPorCategoria />} />

          {/* HU-6: Satisfacción para supervisor (envuelto en ProveedorEncuestas) */}
          <Route
            path="/supervisor/satisfaccion"
            element={
              <ProveedorEncuestas>
                <SatisfaccionSupervisor />
              </ProveedorEncuestas>
            }
          />

          {/* Vistas complementarias HU-7 */}
          <Route path="/supervisor/tablero" element={<VistaTemporal nombre="Tablero de métricas (HU-7)" />} />
          <Route path="/supervisor/carga" element={<VistaTemporal nombre="Carga por técnico (HU-7)" />} />
          <Route path="/supervisor/usuarios" element={<VistaTemporal nombre="Gestión de usuarios (HU-7)" />} />
        </Route>

        {/* ============================================================== */}
        {/* RUTAS CON LAYOUT COMPARTIDO: TÉCNICO (HU-4, HU-5)              */}
        {/* ============================================================== */}
        <Route
          element={
            <RutaProtegida rolesPermitidos={['Técnico']}>
              <LayoutCompartido />
            </RutaProtegida>
          }
        >
          {/* HU-4: Bandeja personal del técnico */}
          <Route path="/tecnico/bandeja" element={<MiBandeja />} />
          <Route path="/tecnico/historial" element={<HistorialCambios />} />
        </Route>

        {/* HU-5: Detalle de Ticket e Historial (Técnico con ProveedorAtencion) */}
        <Route
          element={
            <RutaProtegida rolesPermitidos={['Técnico']}>
              <LayoutAtencion />
            </RutaProtegida>
          }
        >
          <Route path="/tecnico/ticket/:id" element={<DetalleTicket />} />
          <Route path="/tecnico/ticket/:id/historial" element={<HistorialCambios />} />
        </Route>

        {/* ============================================================== */}
        {/* RUTAS DE USUARIO (HU-3)                                        */}
        {/* ============================================================== */}
        <Route
          path="/mis-tickets"
          element={
            <RutaProtegida rolesPermitidos={['Usuario']}>
              <MisTickets />
            </RutaProtegida>
          }
        />
        <Route
          path="/mis-tickets/nuevo"
          element={
            <RutaProtegida rolesPermitidos={['Usuario']}>
              <NuevoTicket />
            </RutaProtegida>
          }
        />
        <Route
          path="/mis-tickets/nuevo/registrado"
          element={
            <RutaProtegida rolesPermitidos={['Usuario']}>
              <ConfirmacionTicket />
            </RutaProtegida>
          }
        />
        <Route
          path="/mis-tickets/:codigo"
          element={
            <RutaProtegida rolesPermitidos={['Usuario']}>
              <DetalleTicketUsuario />
            </RutaProtegida>
          }
        />
        <Route
          path="/mis-tickets/cerrado"
          element={
            <RutaProtegida rolesPermitidos={['Usuario']}>
              <TicketCerradoEncuesta />
            </RutaProtegida>
          }
        />
        <Route
          path="/mis-tickets/cerrado/reabrir"
          element={
            <RutaProtegida rolesPermitidos={['Usuario']}>
              <TicketCerradoEncuesta />
            </RutaProtegida>
          }
        />

        {/* HU-6: Encuestas de satisfacción (Usuario con ProveedorEncuestas) */}
        <Route
          element={
            <RutaProtegida rolesPermitidos={['Usuario']}>
              <LayoutEncuestas />
            </RutaProtegida>
          }
        >
          <Route path="/encuestas" element={<MisEncuestas />} />
          <Route path="/encuestas/pendiente" element={<EncuestaPendiente />} />
          <Route path="/encuestas/:ticketId" element={<ResponderEncuesta />} />
        </Route>

        {/* ============================================================== */}
        {/* RUTAS COMUNES AUTENTICADAS (Cualquier rol con sesión)         */}
        {/* ============================================================== */}
        <Route
          element={
            <RutaProtegida rolesPermitidos={['Usuario', 'Técnico', 'Supervisor']}>
              <LayoutCompartido />
            </RutaProtegida>
          }
        >
          <Route path="/mi-cuenta" element={<MiCuenta />} />
          <Route path="/403" element={<AccesoDenegado />} />
        </Route>

        {/* Ruta 404 */}
        <Route
          path="*"
          element={
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <h1 style={{ fontSize: '48px', color: 'var(--color-primary)' }}>404</h1>
              <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', margin: '16px 0 24px' }}>
                No encontramos la página que buscas.
              </p>
              <a href="/dashboard" className="btn-primario" style={{ textDecoration: 'none' }}>
                Ir al inicio
              </a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
