import LayoutCompartido from '../../components/layouts/LayoutCompartido';
import { ProveedorAtencion } from './ContextoAtencion';

// Ruta padre de la HU-5: utiliza el layout compartido del proyecto manteniendo su contexto
export default function LayoutAtencion() {
  return (
    <ProveedorAtencion>
      <LayoutCompartido />
    </ProveedorAtencion>
  );
}
