import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { obtenerCategorias, obtenerSubcategorias, obtenerAmbientes } from "../catalogo/servicioCatalogo";
import { esTerminado, obtenerTicketsDelUsuario } from "./servicioTickets";
import "../../styles/registro.css";
import Encabezado from "../../components/layouts/Encabezado";
import NavegacionSidebar from "../../components/layouts/NavegacionSideBar";
import EtiquetaPrioridad from "../../components/common/EtiquetaPrioridad";
import EtiquetaEstado from "../../components/common/EtiquetaEstado";
import SinTickets from "./SinTickets";

const POR_PAGINA = 8;
const HOY = new Date().toISOString().slice(0, 10);

// "2026-09-07" -> "07/09/2026"
const formatearFecha = (iso) => iso.split("-").reverse().join("/");

// Arma las filas de la tabla a partir de los tickets guardados, resolviendo nombres del catálogo
function construirFilas(usuarioId) {
    const categorias = obtenerCategorias();
    const subcategorias = obtenerSubcategorias();
    const ambientes = obtenerAmbientes();
    return obtenerTicketsDelUsuario(usuarioId).map((t) => ({
        codigo: t.id,
        asunto: t.asunto,
        categoria: categorias.find((c) => c.id === t.categoriaId)?.nombre ?? "",
        subcategoria: subcategorias.find((s) => s.id === t.subcategoriaId)?.nombre ?? "",
        ambiente: ambientes.find((a) => a.id === t.ambienteId)?.codigo ?? "",
        fecha: t.fechaRegistro.slice(0, 10),
        prioridad: t.prioridad,
        estado: t.estado,
    }));
}

function MisTickets() {
    const { usuario } = useAuth();
    const tickets = construirFilas(usuario.id);
    const nombresCategorias = obtenerCategorias().map((c) => c.nombre);

    // Rango de fechas por defecto: desde el ticket más antiguo hasta hoy (o el más reciente)
    const fechas = tickets.map((t) => t.fecha).sort();
    const DESDE = fechas[0];
    const HASTA = fechas.length && fechas[fechas.length - 1] > HOY ? fechas[fechas.length - 1] : HOY;

    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState(true);
    const [filtroFechas, setFiltroFechas] = useState(true);
    const [categoria, setCategoria] = useState("todas");
    const [pagina, setPagina] = useState(1);

    if (tickets.length === 0) return <SinTickets />;

    const enCurso = tickets.filter((t) => !esTerminado(t.estado)).length;

    const ticketsFiltrados = tickets.filter((t) => {
        const texto = busqueda.trim().toLowerCase();
        if (texto && !t.codigo.toLowerCase().includes(texto)) return false;
        if (filtroEstado && esTerminado(t.estado)) return false;
        if (filtroFechas && (t.fecha < DESDE || t.fecha > HASTA)) return false;
        if (categoria !== "todas" && t.categoria !== categoria) return false;
        return true;
    });

    const total = ticketsFiltrados.length;
    const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
    const inicio = (pagina - 1) * POR_PAGINA;
    const visibles = ticketsFiltrados.slice(inicio, inicio + POR_PAGINA);

    function limpiarFiltros(e) {
        e.preventDefault();
        setBusqueda("");
        setFiltroEstado(false);
        setFiltroFechas(false);
        setCategoria("todas");
        setPagina(1);
    }

    return (
        <>
            <Encabezado />
            <div className="mis-tickets-marco">
                <NavegacionSidebar />
                <main className="mis-tickets">
                    <div className="principal">
                        <div>
                            <h1>Mis tickets</h1>
                            <p id="resumen">
                                {tickets.length} tickets registrados - {enCurso} en curso
                            </p>
                        </div>
                        <Link to="/mis-tickets/nuevo" className="btn-primario">
                            Registrar un ticket
                        </Link>
                    </div>

                    <div className="filtros">
                        <input
                            id="buscar"
                            type="text"
                            placeholder="TCK-2026-..."
                            value={busqueda}
                            onChange={(e) => {
                                setBusqueda(e.target.value);
                                setPagina(1);
                            }}
                        />

                        {filtroEstado && (
                            <span className="opcion">
                                Estado: en curso
                                <button
                                    type="button"
                                    className="quitar"
                                    aria-label="Quitar filtro de estado"
                                    onClick={() => {
                                        setFiltroEstado(false);
                                        setPagina(1);
                                    }}
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {filtroFechas && (
                            <span className="opcion">
                                {formatearFecha(DESDE)} – {formatearFecha(HASTA)}
                                <button
                                    type="button"
                                    className="quitar"
                                    aria-label="Quitar filtro de fechas"
                                    onClick={() => {
                                        setFiltroFechas(false);
                                        setPagina(1);
                                    }}
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        <select
                            value={categoria}
                            onChange={(e) => {
                                setCategoria(e.target.value);
                                setPagina(1);
                            }}
                        >
                            <option value="todas">Categoría: todas</option>
                            {nombresCategorias.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>

                        <a href="#" id="limpiar" onClick={limpiarFiltros}>
                            Limpiar filtros
                        </a>
                    </div>

                    <div className="tabla">
                        <table>
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Asunto</th>
                                    <th>Categoría</th>
                                    <th>Ambiente</th>
                                    <th>Registrado</th>
                                    <th>Prioridad</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>

                            <tbody>
                                {visibles.length === 0 && (
                                    <tr>
                                        <td colSpan={7}>No se encontraron tickets con esos filtros.</td>
                                    </tr>
                                )}

                                {visibles.map((t) => (
                                    <tr key={t.codigo}>
                                        <td>
                                            <Link to={`/mis-tickets/${t.codigo}`} className="codigoticket">
                                                {t.codigo}
                                            </Link>
                                        </td>
                                        <td>{t.asunto}</td>
                                        <td>
                                            {t.categoria} - {t.subcategoria}
                                        </td>
                                        <td className="ambiente">{t.ambiente}</td>
                                        <td>{formatearFecha(t.fecha)}</td>
                                        <td>
                                            <EtiquetaPrioridad prioridad={t.prioridad} />
                                        </td>
                                        <td>
                                            <EtiquetaEstado estado={t.estado} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="resumentabla">
                            <span>
                                {total === 0
                                    ? "Sin resultados"
                                    : `Mostrando ${inicio + 1}-${inicio + visibles.length} de ${total} tickets`}
                            </span>

                            <div className="pagina">
                                <button
                                    type="button"
                                    disabled={pagina === 1}
                                    onClick={() => setPagina(pagina - 1)}
                                >
                                    Anterior
                                </button>

                                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        className={n === pagina ? "actual" : undefined}
                                        onClick={() => setPagina(n)}
                                    >
                                        {n}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    disabled={pagina === totalPaginas}
                                    onClick={() => setPagina(pagina + 1)}
                                >
                                    Siguiente
                                </button>
                            </div>
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

export default MisTickets;