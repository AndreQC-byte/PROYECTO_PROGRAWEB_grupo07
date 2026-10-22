import LayoutCompartido from '../../components/layouts/LayoutCompartido';
import { ProveedorEncuestas } from './ContextoEncuestas';

// Ruta padre de la HU-6: utiliza el layout compartido del proyecto manteniendo su contexto
export default function LayoutEncuestas() {
  return (
    <ProveedorEncuestas>
      <LayoutCompartido />
    </ProveedorEncuestas>
  );
}
