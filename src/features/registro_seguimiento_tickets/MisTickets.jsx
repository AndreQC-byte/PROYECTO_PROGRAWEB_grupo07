import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/registro.css";
import Encabezado from "../../components/layouts/Encabezado";
import NavegacionSidebar from "../../components/layouts/NavegacionSidebar";
import EtiquetaPrioridad from "../../components/common/EtiquetaPrioridad";
import EtiquetaEstado from "../../components/common/EtiquetaEstado";
import Footer from "../../components/layouts/Footer";

const POR_PAGINA = 8;
const DESDE = "2026-08-01";
const HASTA = "2026-09-07";
const ESTADOS_TERMINADOS = ["Resuelto", "Cerrado"];

const categorias = [
    "Audiovisuales",
    "Redes y conectividad",
    "Climatización",
    "Eléctrico",
    "Accesos y cerraduras",
    "Mobiliario",
    "Limpieza",
];

// Tickets de PRUEBA (los últimos 4 son de ejemplo para que funcione la página 2)
const tickets = [
    { codigo: "TCK-2026-00147", asunto: "Proyector no enciende en aula", categoria: "Audiovisuales", subcategoria: "Proyector no enciende", ambiente: "A-201", fecha: "2026-09-07", prioridad: "Crítica", estado: "Abierto" },
    { codigo: "TCK-2026-00146", asunto: "Punto de red caído en laboratorio", categoria: "Redes y conectividad", subcategoria: "Punto de red caído", ambiente: "H-210", fecha: "2026-09-07", prioridad: "Crítica", estado: "Abierto" },
    { codigo: "TCK-2026-00145", asunto: "Aire acondicionado sin frío", categoria: "Climatización", subcategoria: "Aire sin frío", ambiente: "E-304", fecha: "2026-09-07", prioridad: "Alta", estado: "En atención" },
    { codigo: "TCK-2026-00144", asunto: "Tomacorriente sin energía", categoria: "Eléctrico", subcategoria: "Tomacorriente sin energía", ambiente: "N-402", fecha: "2026-09-07", prioridad: "Alta", estado: "Abierto" },
    { codigo: "TCK-2026-00143", asunto: "Imagen distorsionada del proyector", categoria: "Audiovisuales", subcategoria: "Imagen distorsionada", ambiente: "Q-101", fecha: "2026-09-07", prioridad: "Media", estado: "En atención" },
    { codigo: "TCK-2026-00142", asunto: "Chapa de puerta trabada", categoria: "Accesos y cerraduras", subcategoria: "Chapa trabada", ambiente: "H-105", fecha: "2026-09-07", prioridad: "Alta", estado: "En atención" },
    { codigo: "TCK-2026-00141", asunto: "Cinco sillas rotas en aula", categoria: "Mobiliario", subcategoria: "Silla rota", ambiente: "A-201", fecha: "2026-09-07", prioridad: "Media", estado: "En espera" },
    { codigo: "TCK-2026-00140", asunto: "Fuga de agua en baño de damas", categoria: "Limpieza", subcategoria: "Fuga de agua", ambiente: "Biblioteca piso 2", fecha: "2026-09-07", prioridad: "Crítica", estado: "En atención" },
    { codigo: "TCK-2026-00139", asunto: "Pizarra con rayones permanentes", categoria: "Mobiliario", subcategoria: "Pizarra dañada", ambiente: "B-102", fecha: "2026-08-20", prioridad: "Baja", estado: "Resuelto" },
    { codigo: "TCK-2026-00138", asunto: "Cable HDMI roto en aula", categoria: "Audiovisuales", subcategoria: "Cable roto", ambiente: "C-201", fecha: "2026-08-12", prioridad: "Media", estado: "Cerrado" },
    { codigo: "TCK-2026-00137", asunto: "Aula sin limpiar tras evento", categoria: "Limpieza", subcategoria: "Aula sucia", ambiente: "D-305", fecha: "2026-08-05", prioridad: "Baja", estado: "Resuelto" },
    { codigo: "TCK-2026-00136", asunto: "Wi-Fi lento en cafetería", categoria: "Redes y conectividad", subcategoria: "Wi-Fi lento", ambiente: "Cafetería", fecha: "2026-07-28", prioridad: "Media", estado: "Cerrado" },
];

// "2026-09-07" -> "07/09/2026"
const formatearFecha = (iso) => iso.split("-").reverse().join("/");

function MisTickets() {
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState(true);
    const [filtroFechas, setFiltroFechas] = useState(true);
    const [categoria, setCategoria] = useState("todas");
    const [pagina, setPagina] = useState(1);

    const enCurso = tickets.filter((t) => !ESTADOS_TERMINADOS.includes(t.estado)).length;

    const ticketsFiltrados = tickets.filter((t) => {
        const texto = busqueda.trim().toLowerCase();
        if (texto && !t.codigo.toLowerCase().includes(texto)) return false;
        if (filtroEstado && ESTADOS_TERMINADOS.includes(t.estado)) return false;
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
                            {categorias.map((c) => (
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
                                            {/* TEMPORAL: cuando exista el detalle, cambiar por un Link a esa pantalla */}
                                            <a href="#" className="codigoticket">
                                                {t.codigo}
                                            </a>
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
            <Footer />
        </>
    );
}

export default MisTickets;