import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import "../../styles/registro.css";
import Encabezado from "../../components/layouts/Encabezado";
import NavegacionSidebar from "../../components/layouts/NavegacionSidebar";
import EtiquetaPrioridad from "../../components/common/EtiquetaPrioridad";
import EtiquetaEstado from "../../components/common/EtiquetaEstado";
import Footer from "../../components/layouts/Footer";

function ConfirmacionTicket() {
  const { state } = useLocation();
  const [copiado, setCopiado] = useState(false);

  // Si entran directo a esta dirección, no hay datos: vuelven al formulario
  if (!state) return <Navigate to="/mis-tickets/nuevo" replace />;

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
                {/* Texto fijo por ahora: el cálculo real se hace después */}
                <p>2 horas hábiles - antes de las 10:12 del 07/09/2026</p>
              </div>
              <div className="amb">
                <small>Ambiente</small>
                <p id="place">
                  {state.ambiente} - {state.categoria}
                </p>
              </div>
            </div>

            <div className="botoncitos">
              {/* TEMPORAL: cuando exista el detalle del ticket, cambiar esta ruta */}
              <Link to="/mis-tickets" className="btn-primario">
                Ver el detalle del ticket
              </Link>
              <Link to="/mis-tickets" className="btn-secundario">
                Ir a mis tickets
              </Link>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}

export default ConfirmacionTicket;