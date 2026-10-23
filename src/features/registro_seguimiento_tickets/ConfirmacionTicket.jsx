import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import "../../styles/registro.css";
import Encabezado from "../../components/layouts/Encabezado";
import NavegacionSidebar from "../../components/layout/NavegacionSidebar";
import EtiquetaPrioridad from "../../components/common/EtiquetaPrioridad";
import EtiquetaEstado from "../../components/common/EtiquetaEstado";
import { useTickets } from "./almacenTickets";
import { fechaLimiteAtencion } from "./servicioTickets";
import {
  obtenerAmbiente,
  obtenerCategoria,
  obtenerSubcategoria,
  formatearHora,
  formatearFechaCorta,
} from "../atencion_cierre_tickets/servicioAtencion";

function ConfirmacionTicket() {
  const { state } = useLocation();
  const { tickets } = useTickets();
  const [copiado, setCopiado] = useState(false);

  const ticket = tickets.find((t) => t.id === state?.ticketId);

  // Si entran directo a esta dirección, no hay ticket: vuelven al formulario
  if (!ticket) return <Navigate to="/mis-tickets/nuevo" replace />;

  const limite = fechaLimiteAtencion(ticket);

  function copiarCodigo() {
    navigator.clipboard.writeText(ticket.id);
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
              <span id="numero">{ticket.id}</span>
              <button type="button" id="copiar" onClick={copiarCodigo}>
                {copiado ? "Copiado" : "Copiar"}
              </button>
            </div>

            <div className="datos">
              <div className="asig">
                <small>Prioridad asignada</small>
                <EtiquetaPrioridad prioridad={ticket.prioridad} />
                <EtiquetaEstado estado={ticket.estado} />
              </div>
              <div className="horario">
                <small>Tiempo de atención esperado</small>
                <p>
                  {ticket.tiempoEsperadoHoras} horas hábiles - antes de las {formatearHora(limite)} del{" "}
                  {formatearFechaCorta(limite)}
                </p>
              </div>
              <div className="amb">
                <small>Ambiente</small>
                <p id="place">
                  {obtenerAmbiente(ticket.ambienteId)?.codigo} - {obtenerCategoria(ticket.categoriaId)?.nombre}
                </p>
                <p>{obtenerSubcategoria(ticket.subcategoriaId)?.nombre}</p>
              </div>
            </div>

            <div className="detalle-registrado">
              <small>Asunto</small>
              <p>{ticket.asunto}</p>
              <small>Descripción</small>
              <p>{ticket.descripcion}</p>
            </div>

            <div className="botoncitos">
              <Link to={`/mis-tickets/${ticket.id}`} className="btn-primario">
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