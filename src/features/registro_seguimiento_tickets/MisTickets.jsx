import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/registro.css";
import Encabezado from "../../components/layouts/Encabezado";
import NavegacionSidebar from "../../components/layout/NavegacionSidebar";
import EtiquetaPrioridad from "../../components/common/EtiquetaPrioridad";
import EtiquetaEstado from "../../components/common/EtiquetaEstado";
import SinTickets from "./SinTickets";
import { useAuth } from "../../context/AuthContext";
import { useTickets } from "./almacenTickets";
import {
    ESTADOS,
    PRIORIDADES,
    contarTickets,
    filtrarTickets,
    formatearDia,
    obtenerCategoriasActivas,
    ticketsDeUsuario,
} from "./servicioTickets";
import {
    obtenerAmbiente,
    obtenerCategoria,
    obtenerSubcategoria,
} from "../atencion_cierre_tickets/servicioAtencion";

const POR_PAGINA = 8;
const MAX_SUGERENCIAS = 8;

// Quita tildes y mayúsculas para comparar: "Climatización" == "climatizacion"
const normalizar = (s) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

// "01/09/2026" -> "2026-09-01" (o null si no es una fecha válida)
const leerFecha = (texto) => {
    const m = texto.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (!m) return null;
    const [, d, mes, a] = m;
    const iso = `${a}-${mes.padStart(2, "0")}-${d.padStart(2, "0")}`;
    return Number.isNaN(new Date(iso).getTime()) ? null : iso;
};

function MisTickets() {
    const { usuario } = useAuth();
    const { tickets } = useTickets();

    const [texto, setTexto] = useState("");
    const [abierto, setAbierto] = useState(false);
    const [activo, setActivo] = useState(0);
    // Filtros ya aplicados: [{ campo, valor, etiqueta }] (uno por campo)
    const [filtros, setFiltros] = useState([]);
    const [pagina, setPagina] = useState(1);

    const mios = useMemo(() => ticketsDeUsuario(tickets, usuario?.id), [tickets, usuario?.id]);

    // Todo lo que se puede filtrar y escribir a mano
    const opciones = useMemo(
        () => [
            { campo: "estado", valor: "en curso", etiqueta: "Estado: en curso" },
            ...ESTADOS.map((e) => ({ campo: "estado", valor: e, etiqueta: `Estado: ${e}` })),
            ...obtenerCategoriasActivas().map((c) => ({
                campo: "categoriaId",
                valor: c.id,
                etiqueta: `Categoría: ${c.nombre}`,
            })),
            ...PRIORIDADES.map((p) => ({ campo: "prioridad", valor: p, etiqueta: `Prioridad: ${p}` })),
        ],
        []
    );

    // Sugerencias según lo que se va escribiendo ("Esta" -> todos los estados)
    const sugerencias = useMemo(() => {
        const t = normalizar(texto);
        if (!t) return [];

        const lista = opciones.filter((o) => normalizar(o.etiqueta).includes(t));

        const fecha = leerFecha(texto);
        if (fecha) {
            lista.unshift(
                { campo: "desde", valor: fecha, etiqueta: `Desde: ${formatearDia(fecha)}` },
                { campo: "hasta", valor: fecha, etiqueta: `Hasta: ${formatearDia(fecha)}` }
            );
        }

        if (/^(tck|\d)/.test(t)) {
            lista.push({ campo: "busqueda", valor: texto.trim(), etiqueta: `Código: ${texto.trim()}` });
        }

        return lista.slice(0, MAX_SUGERENCIAS);
    }, [texto, opciones]);

    const ayudaFecha =
        sugerencias.length === 0 && /^(fecha|desde|hasta)/.test(normalizar(texto));

    // Criterios que entiende filtrarTickets
    const criterios = { busqueda: "", estado: "todos", categoriaId: "todas", prioridad: "todas", desde: "", hasta: "" };
    filtros.forEach((f) => {
        criterios[f.campo] = f.valor;
    });

    const resultado = filtrarTickets(mios, criterios);
    const { total: registrados, enCurso } = contarTickets(mios, usuario?.id);

    const total = resultado.length;
    const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
    const paginaActual = Math.min(pagina, totalPaginas);
    const inicio = (paginaActual - 1) * POR_PAGINA;
    const visibles = resultado.slice(inicio, inicio + POR_PAGINA);

    if (mios.length === 0) return <SinTickets />;

    function agregarFiltro(opcion) {
        // Un solo filtro por campo: el nuevo reemplaza al anterior
        setFiltros((prev) => [...prev.filter((f) => f.campo !== opcion.campo), opcion]);
        setTexto("");
        setAbierto(false);
        setActivo(0);
        setPagina(1);
    }

    function quitarFiltro(campo) {
        setFiltros((prev) => prev.filter((f) => f.campo !== campo));
        setPagina(1);
    }

    function limpiarFiltros(e) {
        e.preventDefault();
        setFiltros([]);
        setTexto("");
        setAbierto(false);
        setPagina(1);
    }

    function alPresionarTecla(e) {
        if (e.key === "ArrowDown" && sugerencias.length) {
            e.preventDefault();
            setAbierto(true);
            setActivo((i) => (i + 1) % sugerencias.length);
        } else if (e.key === "ArrowUp" && sugerencias.length) {
            e.preventDefault();
            setActivo((i) => (i - 1 + sugerencias.length) % sugerencias.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (sugerencias.length) agregarFiltro(sugerencias[Math.min(activo, sugerencias.length - 1)]);
        } else if (e.key === "Escape") {
            setAbierto(false);
        } else if (e.key === "Backspace" && !texto && filtros.length) {
            quitarFiltro(filtros[filtros.length - 1].campo);
        }
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
                                {registrados} tickets registrados - {enCurso} en curso
                            </p>
                        </div>
                        <Link to="/nuevo-ticket" className="btn-primario">
                            Registrar un ticket
                        </Link>
                    </div>

                    <div className="filtros">
                        <div className="buscador">
                            <input
                                id="buscar"
                                type="text"
                                autoComplete="off"
                                placeholder="Filtrar: estado, categoría, prioridad, fecha o código..."
                                role="combobox"
                                aria-expanded={abierto && sugerencias.length > 0}
                                aria-controls="lista-sugerencias"
                                value={texto}
                                onChange={(e) => {
                                    setTexto(e.target.value);
                                    setAbierto(true);
                                    setActivo(0);
                                }}
                                onFocus={() => setAbierto(true)}
                                onBlur={() => setAbierto(false)}
                                onKeyDown={alPresionarTecla}
                            />

                            {abierto && (sugerencias.length > 0 || ayudaFecha) && (
                                <ul className="sugerencias" id="lista-sugerencias" role="listbox">
                                    {sugerencias.map((s, i) => (
                                        <li
                                            key={`${s.campo}-${s.valor}`}
                                            role="option"
                                            aria-selected={i === activo}
                                            className={i === activo ? "sugerencia activa" : "sugerencia"}
                                            // mouseDown (y no click) para que el input no pierda el foco antes de elegir
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                agregarFiltro(s);
                                            }}
                                            onMouseEnter={() => setActivo(i)}
                                        >
                                            {s.etiqueta}
                                        </li>
                                    ))}
                                    {ayudaFecha && (
                                        <li className="sugerencia-ayuda">Escribe la fecha completa, ej. 01/09/2026</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        {filtros.map((f) => (
                            <span className="opcion" key={f.campo}>
                                {f.etiqueta}
                                <button
                                    type="button"
                                    className="quitar"
                                    aria-label={`Quitar filtro ${f.etiqueta}`}
                                    onClick={() => quitarFiltro(f.campo)}
                                >
                                    ×
                                </button>
                            </span>
                        ))}

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
                                    <tr key={t.id}>
                                        <td>
                                            <Link to={`/mis-tickets/${t.id}`} className="codigoticket">
                                                {t.id}
                                            </Link>
                                        </td>
                                        <td>{t.asunto}</td>
                                        <td>
                                            {obtenerCategoria(t.categoriaId)?.nombre} -{" "}
                                            {obtenerSubcategoria(t.subcategoriaId)?.nombre}
                                        </td>
                                        <td className="ambiente">{obtenerAmbiente(t.ambienteId)?.codigo}</td>
                                        <td>{formatearDia(t.fechaRegistro)}</td>
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
                                    disabled={paginaActual === 1}
                                    onClick={() => setPagina(paginaActual - 1)}
                                >
                                    Anterior
                                </button>

                                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        className={n === paginaActual ? "actual" : undefined}
                                        onClick={() => setPagina(n)}
                                    >
                                        {n}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    disabled={paginaActual === totalPaginas}
                                    onClick={() => setPagina(paginaActual + 1)}
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