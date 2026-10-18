import { Outlet } from 'react-router-dom';
import Encabezado from '../../components/layouts/Encabezado';
import NavegacionSidebar from '../../components/layouts/NavegacionSidebar';
import { ProveedorAtencion } from './ContextoAtencion';

// Ruta padre de la HU-5: cabecera y navegación compartidas, contenido a 1200 px y pie de 44 px.
// El proveedor vive aquí para que el detalle y el historial compartan el mismo estado.
export default function LayoutAtencion() {
  return (
    <ProveedorAtencion>
      <Encabezado />
      <div className="atc-marco">
        <NavegacionSidebar />
        <main className="atc-area">
          <div className="atc-contenido">
            <Outlet />
          </div>
        </main>
      </div>
      <footer className="atc-pie">
        <span>Mesa de Ayuda de Servicios del Campus · Universidad de Lima</span>
        <span>soporte.campus@ulima.edu.pe · anexo 30500 · Términos · Privacidad</span>
      </footer>
    </ProveedorAtencion>
  );
}
