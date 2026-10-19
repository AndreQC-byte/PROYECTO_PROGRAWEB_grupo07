import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/registro.css";
import Encabezado from "../../components/layouts/Encabezado";
import NavegacionSidebar from "../../components/layouts/NavegacionSidebar";
import EtiquetaPrioridad from "../../components/common/EtiquetaPrioridad";
import Footer from "../../components/layouts/Footer";

const subcategoriasPorCategoria = {
    "Audiovisuales": ["Proyector no enciende", "Imagen distorsionada"],
    "Redes y conectividad": ["Sin internet", "Wi-Fi lento"],
    "Climatización": ["Aire no enfría", "Aire con ruido"],
    "Eléctrico": ["Sin energía", "Tomacorriente dañado"],
    "Accesos y cerraduras": ["Cerradura trabada", "Tarjeta no abre"],
    "Mobiliario": ["Silla dañada", "Mesa dañada"],
    "Limpieza": ["Aula sucia", "Residuos acumulados"],
};

const categorias = Object.keys(subcategoriasPorCategoria);

// Tickets de PRUEBA
const ticketsExistentes = [
    { codigo: "TCK-2026-00147", categoria: "Audiovisuales", ambiente: "A-201", estado: "Abierto" },
    { codigo: "TCK-2026-00152", categoria: "Climatización", ambiente: "B-105", estado: "En atención" },
    { codigo: "TCK-2026-00098", categoria: "Mobiliario", ambiente: "A-201", estado: "Cerrado" },
];

const recomendaciones = [
    "El código del ambiente tal como aparece en la puerta.",
    "Desde cuándo ocurre la falla y si es intermitente.",
    "Qué ya intentaste (cambiar cable, reiniciar equipo).",
    "Si hay clase o evento en las próximas horas.",
    "Un teléfono de contacto si hay que coordinar el acceso.",
];

function NuevoTicket() {
    const navigate = useNavigate();
    const [categoria, setCategoria] = useState(categorias[0]);
    const [subcategoria, setSubcategoria] = useState(
        subcategoriasPorCategoria[categorias[0]][0]
    );
    const [ambiente, setAmbiente] = useState("");
    const [asunto, setAsunto] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [duplicado, setDuplicado] = useState(null); // null o el ticket repetido

    function cambiarCategoria(e) {
        const nueva = e.target.value;
        setCategoria(nueva);
        setSubcategoria(subcategoriasPorCategoria[nueva][0]);
    }

    function registrar(e) {
        e.preventDefault();

        const repetido = ticketsExistentes.find(
            (t) =>
                t.categoria === categoria &&
                t.ambiente.toLowerCase() === ambiente.trim().toLowerCase() &&
                t.estado !== "Cerrado"
        );

        if (repetido) {
            setDuplicado(repetido);
            return;
        }

        // Código de prueba: el real lo asignará el sistema
        const ultimo = Math.max(
            ...ticketsExistentes.map((t) => Number(t.codigo.slice(-5)))
        );
        const codigo = `TCK-2026-${String(ultimo + 1).padStart(5, "0")}`;

        navigate("/mis-tickets/nuevo/registrado", {
            state: {
                codigo,
                categoria,
                subcategoria,
                ambiente: ambiente.trim(),
                prioridad: "Crítica",
            },
        });
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

                    {duplicado && (
                        <div id="alerta">
                            <p>
                                Ya existe un ticket abierto para {ambiente.trim()} en {categoria}:{" "}
                                {duplicado.codigo}. Revísalo antes de crear otro.
                            </p>
                            <a href="#">Ver ese ticket</a>
                        </div>
                    )}

                    <div id="llenardatos">
                        <form className="card" onSubmit={registrar}>
                            <div id="primerafila">
                                <div id="catego">
                                    <label htmlFor="categoria">Categoría</label>
                                    <select id="categoria" value={categoria} onChange={cambiarCategoria}>
                                        {categorias.map((c) => (
                                            <option key={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div id="subcatego">
                                    <label htmlFor="subcategoria">Subcategoría</label>
                                    <select
                                        id="subcategoria"
                                        value={subcategoria}
                                        onChange={(e) => setSubcategoria(e.target.value)}
                                    >
                                        {subcategoriasPorCategoria[categoria].map((s) => (
                                            <option key={s}>{s}</option>
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
                                            onChange={(e) => setAmbiente(e.target.value)}
                                            required
                                        />
                                        <button type="button">Buscar</button>
                                    </div>
                                    <small>Aula - Pabellón A - piso 2</small>
                                </div>
                                <div className="prio">
                                    <label>Prioridad sugerida</label>
                                    <div className="prioridad">
                                        <EtiquetaPrioridad prioridad="Crítica" />
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
                                <button type="button" className="btn-secundario">
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
                            <div className="aviso">
                                <p>Tiempo esperado para esta categoría</p>
                                <p>
                                    Prioridad crítica: atención dentro de 2 horas hábiles desde el
                                    registro.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
}

export default NuevoTicket;