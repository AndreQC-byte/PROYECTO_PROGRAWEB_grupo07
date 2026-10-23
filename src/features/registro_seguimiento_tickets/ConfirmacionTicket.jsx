import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import "../../styles/registro.css";
import Encabezado from "../../components/layouts/Encabezado";
import NavegacionSidebar from "../../components/layouts/NavegacionSideBar";
import EtiquetaPrioridad from "../../components/common/EtiquetaPrioridad";
import EtiquetaEstado from "../../components/common/EtiquetaEstado";
import { formatearFecha } from "../atencion_cierre_tickets/servicioAtencion";

function ConfirmacionTicket() {
  const { state } = useLocation();
  const [copiado, setCopiado] = useState(false);

  // Si entran directo a esta dirección, no hay datos: vuelven al formulario
  if (!state) return <Navigate to="/mis-tickets/nuevo" replace />;

  const limite = new Date(new Date(state.fechaRegistro).getTime() + state.tiempoEsperadoHoras * 3600 * 1000);

  function copiarCodigo() {
    navigator.clipboard.writeText(state.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <>
      <Encabezado />
      <div className="confirmacion-ticket-marco">
        <NavegacionSidebar />
        <main className="confirmacion-ticket">
          <div className="confirmacion">
            <div className="check"></div>
            <h1>Tu ticket quedó registrado</h1>
            <p id="texto">
              Guarda el código: con él puedes buscar el ticket desde la cabecera en
              cualquier momento.
            </p>

            <div className="codigo">
              <span id="numero">{state.codigo}</span>
              <button type="button" id="copiar" onClick={copiarCodigo}>
                {copiado ? "Copiado" : "Copiar"}
              </button>
            </div>

            <div className="datos">
              <div className="asig">
                <small>Prioridad asignada</small>
                <EtiquetaPrioridad prioridad={state.prioridad} />
                <EtiquetaEstado estado="Abierto" />
              </div>
              <div className="horario">
                <small>Tiempo de atención esperado</small>
                <p>
                  {state.tiempoEsperadoHoras} horas - antes del {formatearFecha(limite.toISOString())}
                </p>
              </div>
              <div className="amb">
                <small>Ambiente</small>
                <p id="place">
                  {state.ambiente} - {state.categoria}
                </p>
              </div>
            </div>

            <div className="botoncitos">
              <Link to={`/mis-tickets/${state.codigo}`} className="btn-primario">
                Ver el detalle del ticket
              </Link>
              <Link to="/mis-tickets" className="btn-secundario">
                Ir a mis tickets
              </Link>
            </div>
          </div>
        </main>
      </div>
      <footer className="nuevo-ticket-pie">
        <span>Mesa de Ayuda de Servicios del Campus - Universidad de Lima</span>
        <span>soporte.campus@ulima.edu.pe - anexo 30500 - Términos - Privacidad</span>
      </footer>
    </>
  );
}

export default ConfirmacionTicket;