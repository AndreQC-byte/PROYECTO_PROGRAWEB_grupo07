import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEncuestas } from './ContextoEncuestas';
import EstadoVacio from './EstadoVacio';
import { resumenUsuario } from './servicioEncuestas';

// Enlace "Encuesta pendiente" del menú: abre la encuesta que vence primero
export default function EncuestaPendiente() {
  const { usuario } = useAuth();
  const { encuestas, ahora } = useEncuestas();
  const [siguiente] = resumenUsuario(encuestas, usuario.id, ahora).pendientes;

  if (siguiente) return <Navigate to={`/encuestas/${siguiente.ticketId}`} replace />;

  return (
    <EstadoVacio
      titulo="No tienes encuestas pendientes"
      texto="Cuando se cierre uno de tus tickets te pediremos calificar la atención."
    >
      <Link to="/encuestas" className="btn-primario enc-enlace-boton">Ver mis encuestas</Link>
    </EstadoVacio>
  );
}
