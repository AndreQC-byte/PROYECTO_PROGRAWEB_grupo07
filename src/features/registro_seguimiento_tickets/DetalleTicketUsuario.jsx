import { useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import "../../styles/registro.css";
import Encabezado from "../../components/layouts/Encabezado";
import NavegacionSidebar from "../../components/layouts/NavegacionSidebar";
import EtiquetaPrioridad from "../../components/common/EtiquetaPrioridad";
import EtiquetaEstado from "../../components/common/EtiquetaEstado";
import Footer from "../../components/layouts/Footer";

// Usuario de PRUEBA que escribe los comentarios: luego saldrá de la sesión
const USUARIO_ACTUAL = {
    nombre: "Camila Quispe Ramos",
    iniciales: "CQ",
    rol: "Usuario",
};

// Tickets de PRUEBA con su detalle (por ahora solo existe uno completo)
const ticketsDetalle = {
    "TCK-2026-00147": {
        codigo: "TCK-2026-00147",
        asunto: "Proyector no enciende en aula A-201",
        prioridad: "Crítica",
        estado: "En atención",
        categoria: "Audiovisuales",
        subcategoria: "Proyector no enciende",
        ambiente: "A-201",
        registrado: "07/09/2026 08:12",
        tecnico: "Julio Paredes Soto",
        atencionEsperada: "Antes de 10:12",
        bitacora: [
            {
                iniciales: "CQ",
                nombre: "Camila Quispe Ramos",
                rol: "Usuario",
                fecha: "07/09/2026 08:12",
                texto: "El proyector enciende el foco pero la imagen no llega. Ya probé con dos laptops distintas y el mismo cable.",
            },
            {
                iniciales: "LM",
                nombre: "Lucía Mendoza Ríos",
                rol: "Supervisor",
                fecha: "07/09/2026 08:20",
                texto: "Asignamos tu ticket a Julio Paredes. Se atenderá antes del inicio de la clase de 10:00.",
            },
            {
                iniciales: "JP",
                nombre: "Julio Paredes Soto",
                rol: "Técnico",
                fecha: "07/09/2026 09:05",
                texto: "Subí al aula con un cable de reemplazo. La imagen vuelve con conexión directa; el problema está en el extensor del rack.",
            },
        ],
        hitos: [
            { tipo: "abierto", titulo: "Abierto", detalle: "07/09/2026 08:12 - registrado por ti" },
            { tipo: "asignado", titulo: "Asignado", detalle: "07/09/2026 08:20 - Lucía Mendoza Ríos" },
            { tipo: "actual", titulo: "En atención", detalle: "07/09/2026 08:41 - Julio Paredes Soto" },
            { tipo: "pendiente", titulo: "Resuelto", detalle: "Pendiente" },
        ],
    },
};

// Arma el detalle de un ticket recién registrado con los datos del formulario
function crearTicketNuevo(datos) {
    return {
        codigo: datos.codigo,
        asunto: datos.asunto,
        prioridad: datos.prioridad,
        estado: "Abierto",
        categoria: datos.categoria,
        subcategoria: datos.subcategoria,
        ambiente: datos.ambiente,
        registrado: datos.registrado,
        tecnico: "Sin asignar",
        atencionEsperada: "2 horas hábiles desde el registro",
        bitacora: [
            {
                iniciales: USUARIO_ACTUAL.iniciales,
                nombre: USUARIO_ACTUAL.nombre,
                rol: USUARIO_ACTUAL.rol,
                fecha: datos.registrado,
                texto: datos.descripcion,
            },
        ],
        hitos: [
            { tipo: "abierto", titulo: "Abierto", detalle: `${datos.registrado} - registrado por ti` },
            { tipo: "pendiente", titulo: "Asignado", detalle: "Pendiente" },
            { tipo: "pendiente", titulo: "En atención", detalle: "Pendiente" },
            { tipo: "pendiente", titulo: "Resuelto", detalle: "Pendiente" },
        ],
    };
}

function DetalleTicketUsuario() {
    const { codigo } = useParams();
    const { state } = useLocation();

    // Primero busca en los tickets de prueba; si no está, usa los datos del ticket recién registrado
    const ticket =
        ticketsDetalle[codigo] ||
        (state && state.codigo === codigo ? crearTicketNuevo(state) : null);

    const [bitacora, setBitacora] = useState(ticket ? ticket.bitacora : []);
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

        setBitacora([
            ...bitacora,
            {
                iniciales: USUARIO_ACTUAL.iniciales,
                nombre: USUARIO_ACTUAL.nombre,
                rol: USUARIO_ACTUAL.rol,
                fecha: fechaActual(),
                texto,
            },
        ]);
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
                                            {ticket.hitos.map((h) => (
                                                <li key={h.titulo} className={`hito-${h.tipo}`}>
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
            <Footer />
        </>
    );
}

export default DetalleTicketUsuario;