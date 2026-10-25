import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../../styles/registro.css";
import Encabezado from "../../components/layouts/Encabezado";
import NavegacionSidebar from "../../components/layout/NavegacionSidebar";
import EtiquetaPrioridad from "../../components/common/EtiquetaPrioridad";
import EtiquetaEstado from "../../components/common/EtiquetaEstado";
import TicketCerradoEncuesta from "./TicketCerradoEncuesta";
import ModalCancelarTicket from "./ModalCancelarTicket";
import { useAuth } from "../../context/AuthContext";
import { useTickets } from "./almacenTickets";
import {
    ESTADOS_TERMINADOS,
    comentariosPublicos,
    construirLineaTiempo,
    datosCierre,
    encuestaPendienteDe,
    fechaLimiteAtencion,
    formatearDia,
    formatearFechaHora,
    puedeCancelar,
} from "./servicioTickets";
import {
    iniciales,
    nombreCorto,
    obtenerAmbiente,
    obtenerCategoria,
    obtenerSubcategoria,
    obtenerUsuario,
} from "../atencion_cierre_tickets/servicioAtencion";

function DetalleTicketUsuario() {
    const { codigo } = useParams();
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const { tickets, encuestas, agregarComentario, cancelarTicket } = useTickets();

    const ticket = tickets.find((t) => t.id === codigo);

    const [comentario, setComentario] = useState("");
    const [mostrarCancelar, setMostrarCancelar] = useState(false);
    const comentarioRef = useRef(null);

    const cancelado = ticket?.estado === "Cancelado";
    // Un ticket cerrado o cancelado ya no admite comentarios
    const cerrado = ticket?.estado === "Cerrado" || cancelado;
    const terminado = ticket ? ESTADOS_TERMINADOS.includes(ticket.estado) : false;
    const tecnico = ticket ? obtenerUsuario(ticket.tecnicoAsignadoId) : null;
    const hitos = ticket ? construirLineaTiempo(ticket, encuestas) : [];
    const cierre = ticket && terminado ? datosCierre(ticket, encuestas) : null;
    const encuestaPendiente = ticket ? Boolean(encuestaPendienteDe(ticket, encuestas)) : false;

    // Primero la descripción del usuario; luego los comentarios públicos del equipo (las notas internas no se ven)
    const mensajes = ticket
        ? [
            { autorId: ticket.usuarioId, fecha: ticket.fechaRegistro, mensaje: ticket.descripcion, evidencia: ticket.evidencia },
            ...[...comentariosPublicos(ticket)].sort((a, b) => new Date(a.fecha) - new Date(b.fecha)),
        ]
        : [];

    function irAComentario() {
        comentarioRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        comentarioRef.current.focus();
    }

    function enviarComentario(e) {
        e.preventDefault();

        const texto = comentario.trim();
        if (!texto) return;

        agregarComentario(ticket.id, usuario.id, texto);
        setComentario("");
    }

    function confirmarCancelacion() {
        cancelarTicket(ticket.id);
        setMostrarCancelar(false);
    }

    // Al confirmar el motivo en el modal, se va al formulario con los datos del ticket copiados
    function reabrir(motivo) {
        navigate("/nuevo-ticket", {
            state: {
                reabrir: {
                    ticketId: ticket.id,
                    motivo,
                    categoriaId: ticket.categoriaId,
                    subcategoriaId: ticket.subcategoriaId,
                    ambienteCodigo: obtenerAmbiente(ticket.ambienteId)?.codigo,
                },
            },
        });
    }

    return (
        <>
            <Encabezado />
            <div className="detalle-ticket-marco">
                <NavegacionSidebar />
                <main className="detalle-ticket">
                    {!ticket ? (
                        <div className="sin-ticket">
                            <h1>Ticket no encontrado</h1>
                            <p>No hay un ticket con el código {codigo}.</p>
                            <Link to="/mis-tickets" className="btn-secundario">
                                Volver a mis tickets
                            </Link>
                        </div>
                    ) : (
                        <>
                            <p id="ticketselecc">
                                <Link to="/mis-tickets">Mis tickets</Link> - {ticket.id}
                            </p>

                            <div className="contenido">
                                <div className="codigoestado">
                                    <h1 id="codigo">{ticket.id}</h1>
                                    <EtiquetaPrioridad prioridad={ticket.prioridad} />
                                    <EtiquetaEstado estado={ticket.estado} />
                                </div>
                                {!cerrado && (
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        {puedeCancelar(ticket) && (
                                            <button
                                                type="button"
                                                className="btn-secundario"
                                                onClick={() => setMostrarCancelar(true)}
                                            >
                                                Cancelar ticket
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="btn-secundario botonagregar"
                                            onClick={irAComentario}
                                        >
                                            Agregar información
                                        </button>
                                    </div>
                                )}
                            </div>

                            <h2 id="asunto">{ticket.asunto}</h2>

                            {terminado && cierre && (
                                <TicketCerradoEncuesta
                                    codigo={ticket.id}
                                    estado={ticket.estado}
                                    fechaResolucion={formatearFechaHora(cierre.fechaResolucion)}
                                    resueltoPor={cierre.resueltoPor}
                                    solucion={cierre.solucion}
                                    fechaLimite={formatearDia(cierre.fechaLimite)}
                                    encuestaPendiente={encuestaPendiente}
                                    vencido={cierre.vencido}
                                    // TODO: cambia esta ruta por la de tu pantalla de encuesta
                                    onResponderEncuesta={() => navigate(`/encuestas/${ticket.id}`)}
                                    onReabrirConfirmado={reabrir}
                                />
                            )}

                            <div className="columnas">
                                <section className="dt-bitacora">
                                    <h3>Bitácora de la atención</h3>

                                    {mensajes.map((m, i) => {
                                        const autor = obtenerUsuario(m.autorId);
                                        const rol = autor?.rol || "Usuario";
                                        return (
                                            <div className="mensaje" key={m.id || i}>
                                                <div className="persona">
                                                    <span className={rol === "Usuario" ? "avatar" : "avatar azul"}>
                                                        {iniciales(autor)}
                                                    </span>
                                                    <strong>{nombreCorto(autor)}</strong>
                                                    <small>
                                                        {rol} - {formatearFechaHora(m.fecha)}
                                                    </small>
                                                </div>
                                                <p>{m.mensaje}</p>
                                                {m.evidencia && (                                                              // ← nuevo
                                                    <img className="evidencia-detalle" src={m.evidencia.url} alt={m.evidencia.nombre} />
                                                )}
                                            </div>
                                        );
                                    })}

                                    {cerrado ? (
                                        <p className="aviso-cerrado">
                                            {cancelado
                                                ? "Este ticket fue cancelado: ya no admite nuevos comentarios."
                                                : "Este ticket está cerrado: ya no admite nuevos comentarios."}
                                        </p>
                                    ) : (
                                        <form onSubmit={enviarComentario}>
                                            <label htmlFor="comentario">Agregar información</label>
                                            <textarea
                                                id="comentario"
                                                ref={comentarioRef}
                                                placeholder="Escribe aquí si tienes un dato nuevo que ayude al técnico..."
                                                value={comentario}
                                                onChange={(e) => setComentario(e.target.value)}
                                                required
                                            />
                                            <div className="enviar">
                                                <button type="submit" className="btn-primario">
                                                    Enviar comentario
                                                </button>
                                                <small>
                                                    Las notas internas del equipo técnico no se muestran aquí.
                                                </small>
                                            </div>
                                        </form>
                                    )}
                                </section>

                                <div className="lateral">
                                    <section className="reporte">
                                        <h3>Datos del reporte</h3>
                                        <div className="fila">
                                            <span>Categoría</span>
                                            <span>{obtenerCategoria(ticket.categoriaId)?.nombre}</span>
                                        </div>
                                        <div className="fila">
                                            <span>Subcategoría</span>
                                            <span>{obtenerSubcategoria(ticket.subcategoriaId)?.nombre}</span>
                                        </div>
                                        <div className="fila">
                                            <span>Ambiente</span>
                                            <span>{obtenerAmbiente(ticket.ambienteId)?.codigo}</span>
                                        </div>
                                        <div className="fila">
                                            <span>Registrado</span>
                                            <span>{formatearFechaHora(ticket.fechaRegistro)}</span>
                                        </div>
                                        <div className="fila">
                                            <span>Técnico asignado</span>
                                            <span>{tecnico ? nombreCorto(tecnico) : "Sin asignar"}</span>
                                        </div>
                                        <div className="fila">
                                            <span>Atención esperada</span>
                                            <span>Antes de {formatearFechaHora(fechaLimiteAtencion(ticket))}</span>
                                        </div>
                                    </section>

                                    <section className="lineatemp">
                                        <h3>Línea de tiempo</h3>
                                        <ul className="tiempo">
                                            {hitos.map((h) => (
                                                <li key={h.titulo} className={`hito-${h.tipo}`}>
                                                    <strong>{h.titulo}</strong>
                                                    <small>
                                                        {[h.fecha && formatearFechaHora(h.fecha), h.detalle]
                                                            .filter(Boolean)
                                                            .join(" - ")}
                                                    </small>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
            <footer className="nuevo-ticket-pie">
                <span>Mesa de Ayuda de Servicios del Campus - Universidad de Lima</span>
                <span>soporte.campus@ulima.edu.pe - anexo 30500 - Términos - Privacidad</span>
            </footer>

            {mostrarCancelar && ticket && (
                <ModalCancelarTicket
                    codigo={ticket.id}
                    onCerrar={() => setMostrarCancelar(false)}
                    onConfirmar={confirmarCancelacion}
                />
            )}
        </>
    );
}

export default DetalleTicketUsuario;