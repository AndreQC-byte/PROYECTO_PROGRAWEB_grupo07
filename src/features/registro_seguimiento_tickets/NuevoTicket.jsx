import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../styles/registro.css";
import Encabezado from "../../components/layouts/Encabezado";
import NavegacionSidebar from "../../components/layout/NavegacionSidebar";
import EtiquetaPrioridad from "../../components/common/EtiquetaPrioridad";
import { useAuth } from "../../context/AuthContext";
import { useTickets } from "./almacenTickets";
import {
    obtenerCategoriasActivas,
    obtenerSubcategoriasDe,
    buscarAmbientePorCodigo,
    describirAmbiente,
    buscarDuplicado,
    minutosDesde,
} from "./servicioTickets";
import {
    obtenerAmbiente,
    obtenerCategoria,
    formatearDuracion,
} from "../atencion_cierre_tickets/servicioAtencion";

const recomendaciones = [
    "El código del ambiente tal como aparece en la puerta.",
    "Desde cuándo ocurre la falla y si es intermitente.",
    "Qué ya intentaste (cambiar cable, reiniciar equipo).",
    "Si hay clase o evento en las próximas horas.",
    "Un teléfono de contacto si hay que coordinar el acceso.",
];

function NuevoTicket() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { usuario } = useAuth();
    const { tickets, registrarTicket } = useTickets();

    // Si venimos de "Reabrir ticket", llegan la categoría, la subcategoría y el ambiente del ticket anterior
    const reabrir = state?.reabrir;

    const categorias = obtenerCategoriasActivas();
    const categoriaInicial = reabrir?.categoriaId || categorias[0].id;

    const [categoriaId, setCategoriaId] = useState(categoriaInicial);
    const [subcategoriaId, setSubcategoriaId] = useState(
        reabrir?.subcategoriaId || obtenerSubcategoriasDe(categoriaInicial)[0]?.id || ""
    );
    const [ambiente, setAmbiente] = useState(reabrir?.ambienteCodigo || "");
    const [asunto, setAsunto] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [duplicado, setDuplicado] = useState(null); // null o el ticket repetido
    const [errorRegistro, setErrorRegistro] = useState(false);

    const subcategorias = obtenerSubcategoriasDe(categoriaId);
    const subcategoria = subcategorias.find((s) => s.id === subcategoriaId);
    const ambienteEncontrado = ambiente.trim() ? buscarAmbientePorCodigo(ambiente) : null;
    const ambienteInvalido = ambiente.trim() !== "" && !ambienteEncontrado;

    function cambiarCategoria(e) {
        const nueva = e.target.value;
        setCategoriaId(nueva);
        setSubcategoriaId(obtenerSubcategoriasDe(nueva)[0]?.id || "");
        setDuplicado(null);
    }

    function cambiarAmbiente(e) {
        setAmbiente(e.target.value);
        setDuplicado(null);
    }

    function registrar(e) {
        e.preventDefault();
        setErrorRegistro(false);

        // El texto de ayuda del campo ya explica que ese ambiente no existe
        if (!ambienteEncontrado) return;

        const repetido = buscarDuplicado(tickets, ambienteEncontrado.id, categoriaId);
        if (repetido) {
            setDuplicado(repetido);
            return;
        }

        try {
            const nuevo = registrarTicket({
                usuarioId: usuario.id,
                categoriaId,
                subcategoriaId,
                ambienteId: ambienteEncontrado.id,
                asunto: asunto.trim(),
                descripcion: descripcion.trim(),
                origen: reabrir ? { ticketId: reabrir.ticketId, motivo: reabrir.motivo } : null,
            });
            navigate("/mis-tickets/nuevo/registrado", { state: { ticketId: nuevo.id } });
        } catch (error) {
            console.error(error);
            setErrorRegistro(true);
        }
    }

    return (
        <>
            <Encabezado />
            <div className="nuevo-ticket-marco">
                <NavegacionSidebar />
                <main className="nuevo-ticket">
                    <h1>Registrar un ticket</h1>
                    <p id="guia">
                        Indica qué falla y dónde. La prioridad se sugiere según la categoría y
                        el supervisor puede ajustarla.
                    </p>

                    {reabrir && (
                        <p className="aviso-reapertura">
                            Estás registrando un ticket a partir de {reabrir.ticketId}. Copiamos la
                            categoría, la subcategoría y el ambiente: falta que escribas el asunto y la
                            descripción.
                        </p>
                    )}

                    {duplicado && (
                        <div id="alerta">
                            <p>
                                Ya existe un ticket abierto para {obtenerAmbiente(duplicado.ambienteId)?.codigo} en{" "}
                                {obtenerCategoria(duplicado.categoriaId)?.nombre}: {duplicado.id}, registrado hace{" "}
                                {formatearDuracion(minutosDesde(duplicado.fechaRegistro))}. Revísalo antes de crear otro.
                            </p>
                            <Link to={`/mis-tickets/${duplicado.id}`}>Ver ese ticket</Link>
                        </div>
                    )}

                    {errorRegistro && (
                        <div className="notificacion-error" role="alert">
                            No pudimos registrar el ticket. Revisa tu conexión e inténtalo otra vez.
                        </div>
                    )}

                    <div id="llenardatos">
                        <form className="card" onSubmit={registrar}>
                            <div id="primerafila">
                                <div id="catego">
                                    <label htmlFor="categoria">Categoría</label>
                                    <select id="categoria" value={categoriaId} onChange={cambiarCategoria}>
                                        {categorias.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div id="subcatego">
                                    <label htmlFor="subcategoria">Subcategoría</label>
                                    <select
                                        id="subcategoria"
                                        value={subcategoriaId}
                                        onChange={(e) => setSubcategoriaId(e.target.value)}
                                    >
                                        {subcategorias.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <small>Depende de la categoría elegida.</small>
                                </div>
                            </div>

                            <div className="segundafila">
                                <div className="ambi">
                                    <label htmlFor="ambiente">Ambiente</label>
                                    <div className="inputconbtn">
                                        <input
                                            id="ambiente"
                                            type="text"
                                            placeholder="Ej. A-201"
                                            value={ambiente}
                                            onChange={cambiarAmbiente}
                                            required
                                        />
                                        <button type="button">Buscar</button>
                                    </div>
                                    <small className={ambienteInvalido ? "error-campo" : undefined}>
                                        {ambienteEncontrado
                                            ? describirAmbiente(ambienteEncontrado)
                                            : ambienteInvalido
                                                ? "No encontramos ese ambiente. Revisa el código."
                                                : "Escribe el código del ambiente."}
                                    </small>
                                </div>
                                <div className="prio">
                                    <label>Prioridad sugerida</label>
                                    <div className="prioridad">
                                        {subcategoria && (
                                            <EtiquetaPrioridad prioridad={subcategoria.prioridadDefecto} />
                                        )}
                                        <span>Sugerida por la subcategoría</span>
                                    </div>
                                </div>
                            </div>

                            <div className="asunt">
                                <label htmlFor="asunto">Asunto</label>
                                <input
                                    id="asunto"
                                    type="text"
                                    value={asunto}
                                    onChange={(e) => setAsunto(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="desc">
                                <label htmlFor="descripcion">Descripción</label>
                                <textarea
                                    id="descripcion"
                                    maxLength={500}
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    required
                                />
                                <div className="letritas">
                                    <small>Indica qué probaste y desde cuándo ocurre.</small>
                                    <small>{descripcion.length} / 500</small>
                                </div>
                            </div>

                            <div className="evi">
                                <label>Evidencia (opcional)</label>
                                <div className="archivo">
                                    Arrastra una foto o pulsa para elegir - JPG o PNG hasta 5 MB
                                    <input id="evidencia" type="file" accept=".jpg,.jpeg,.png" />
                                </div>
                            </div>

                            <div className="botoncitos">
                                <button type="submit" className="btn-primario">
                                    Registrar ticket
                                </button>
                                <button
                                    type="button"
                                    className="btn-secundario"
                                    onClick={() => navigate("/mis-tickets")}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>

                        <div className="columna2">
                            <div className="infor">
                                <h2>Qué conviene incluir</h2>
                                <ul>
                                    {recomendaciones.map((r) => (
                                        <li key={r}>{r}</li>
                                    ))}
                                </ul>
                            </div>
                            {subcategoria && (
                                <div className="aviso">
                                    <p>Tiempo esperado para esta categoría</p>
                                    <p>
                                        Prioridad {subcategoria.prioridadDefecto.toLowerCase()}: atención dentro de{" "}
                                        {subcategoria.tiempoEsperadoHoras} horas hábiles desde el registro.
                                    </p>
                                </div>
                            )}
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

export default NuevoTicket;