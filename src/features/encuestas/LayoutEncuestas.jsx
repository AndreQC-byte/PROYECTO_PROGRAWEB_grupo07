import { Outlet } from 'react-router-dom';
import Encabezado from '../../components/layouts/Encabezado';
import NavegacionSidebar from '../../components/layouts/NavegacionSideBar';
import { ProveedorEncuestas } from './ContextoEncuestas';

// Ruta padre de la HU-6: cabecera y navegación compartidas, contenido a 1200 px y pie de 44 px.
// El proveedor vive aquí para que las vistas de la HU compartan las respuestas y la notificación.
export default function LayoutEncuestas() {
  return (
    <ProveedorEncuestas>
      <Encabezado />
      <div className="enc-marco">
        <NavegacionSidebar />
        <main className="enc-area">
          <div className="enc-contenido">
            <Outlet />
          </div>
        </main>
      </div>
      <footer className="enc-pie">
        <span>Mesa de Ayuda de Servicios del Campus · Universidad de Lima</span>
        <span>soporte.campus@ulima.edu.pe · anexo 30500 · Términos · Privacidad</span>
      </footer>
    </ProveedorEncuestas>
  );
}
