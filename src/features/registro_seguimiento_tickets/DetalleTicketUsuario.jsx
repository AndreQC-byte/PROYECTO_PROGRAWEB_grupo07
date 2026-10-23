import { useReducer, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    formatearFecha,
    iniciales,
    nombreCompleto,
    nombreCorto,
    obtenerAmbiente,
    obtenerCategoria,
    obtenerHistorialTicket,
    obtenerSubcategoria,
    obtenerUsuario,
} from "../atencion_cierre_tickets/servicioAtencion";
import { agregarComentarioUsuario, esTerminado, obtenerTicketDelUsuario } from "./servicioTickets";
import "../../styles/registro.css";
import Encabezado from "../../components/layouts/Encabezado";
import NavegacionSidebar from "../../components/layouts/NavegacionSideBar";
import EtiquetaPrioridad from "../../components/common/EtiquetaPrioridad";
import EtiquetaEstado from "../../components/common/EtiquetaEstado";

// Arma lo que muestra la pantalla a partir del ticket guardado y el catálogo
function construirVista(ticket) {
    const tecnico = obtenerUsuario(ticket.tecnicoAsignadoId);
    const limite = new Date(new Date(ticket.fechaRegistro).getTime() + ticket.tiempoEsperadoHoras * 3600 * 1000);
    const eventos = obtenerHistorialTicket(ticket);
    const terminado = esTerminado(ticket.estado);

    // Las notas internas del equipo técnico no se muestran al usuario
    const bitacora = ticket.bitacora
        .filter((b) => b.tipo !== "Nota Interna")
        .map((b) => {
            const autor = obtenerUsuario(b.autorId);
            return {
                iniciales: iniciales(autor),
                nombre: nombreCompleto(autor),
                rol: autor?.rol ?? "Usuario",
                fecha: formatearFecha(b.fecha),
                texto: b.mensaje,
            };
        });

    const hitos = eventos.map((e, i) => ({
        tipo: i === eventos.length - 1 && !terminado ? "actual" : e.estado === "Asignado" ? "asignado" : "abierto",
        titulo: e.estado,
        detalle: `${formatearFecha(e.fecha)} - ${
            e.estado === "Abierto" ? "registrado por ti" : e.autorId ? nombreCompleto(obtenerUsuario(e.autorId)) : "supervisor"
        }`,
    }));
    if (!terminado) hitos.push({ tipo: "pendiente", titulo: "Resuelto", detalle: "Pendiente" });

    return {
        codigo: ticket.id,
        asunto: ticket.asunto,
        prioridad: ticket.prioridad,
        estado: ticket.estado,
        categoria: obtenerCategoria(ticket.categoriaId)?.nombre ?? "",
        subcategoria: obtenerSubcategoria(ticket.subcategoriaId)?.nombre ?? "",
        ambiente: obtenerAmbiente(ticket.ambienteId)?.codigo ?? "",
        registrado: formatearFecha(ticket.fechaRegistro),
        tecnico: tecnico ? nombreCorto(tecnico) : "Sin asignar",
        atencionEsperada: `Antes del ${formatearFecha(limite.toISOString())}`,
        bitacora,
        hitos,
    };
}

function DetalleTicketUsuario() {
    const { codigo } = useParams();
    const { usuario } = useAuth();
    const [, refrescar] = useReducer((n) => n + 1, 0);

    const ticketGuardado = obtenerTicketDelUsuario(usuario.id, codigo);
    const ticket = ticketGuardado ? construirVista(ticketGuardado) : null;
    const bitacora = ticket ? ticket.bitacora : [];
    const [comentario, setComentario] = useState("");
    const comentarioRef = useRef(null);

    function irAComentario() {
        comentarioRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        comentarioRef.current.focus();
    }

    function enviarComentario(e) {
        e.preventDefault();

        const texto = comentario.trim();
        if (!texto) return;

        agregarComentarioUsuario(ticket.codigo, usuario.id, texto);
        refrescar();
        setComentario("");
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
                                <Link to="/mis-tickets">Mis tickets</Link> - {ticket.codigo}
                            </p>

                            <div className="contenido">
                                <div className="codigoestado">
                                    <h1 id="codigo">{ticket.codigo}</h1>
                                    <EtiquetaPrioridad prioridad={ticket.prioridad} />
                                    <EtiquetaEstado estado={ticket.estado} />
                                </div>
                                <button
                                    type="button"
                                    className="btn-secundario botonagregar"
                                    onClick={irAComentario}
                                >
                                    Agregar información
                                </button>
                            </div>

                            <h2 id="asunto">{ticket.asunto}</h2>

                            <div className="columnas">
                                <section className="dt-bitacora">
                                    <h3>Bitácora de la atención</h3>

                                    {bitacora.map((m, i) => (
                                        <div className="mensaje" key={i}>
                                            <div className="persona">
                                                <span
                                                    className={
                                                        m.rol === "Usuario" ? "avatar" : "avatar azul"
                                                    }
                                                >
                                                    {m.iniciales}
                                                </span>
                                                <strong>{m.nombre}</strong>
                                                <small>
                                                    {m.rol} - {m.fecha}
                                                </small>
                                            </div>
                                            <p>{m.texto}</p>
                                        </div>
                                    ))}

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
                                </section>

                                <div className="lateral">
                                    <section className="reporte">
                                        <h3>Datos del reporte</h3>
                                        <div className="fila"><span>Categoría</span><span>{ticket.categoria}</span></div>
                                        <div className="fila"><span>Subcategoría</span><span>{ticket.subcategoria}</span></div>
                                        <div className="fila"><span>Ambiente</span><span>{ticket.ambiente}</span></div>
                                        <div className="fila"><span>Registrado</span><span>{ticket.registrado}</span></div>
                                        <div className="fila"><span>Técnico asignado</span><span>{ticket.tecnico}</span></div>
                                        <div className="fila"><span>Atención esperada</span><span>{ticket.atencionEsperada}</span></div>
                                    </section>

                                    <section className="lineatemp">
                                        <h3>Línea de tiempo</h3>
                                        <ul className="tiempo">
                                            {ticket.hitos.map((h, i) => (
                                                <li key={i} className={`hito-${h.tipo}`}>
                                                    <strong>{h.titulo}</strong>
                                                    <small>{h.detalle}</small>
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
        </>
    );
}

export default DetalleTicketUsuario;