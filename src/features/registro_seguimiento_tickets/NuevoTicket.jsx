import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/registro.css";
import Encabezado from "../../components/layouts/Encabezado";
import NavegacionSidebar from "../../components/layouts/NavegacionSideBar";
import EtiquetaPrioridad from "../../components/common/EtiquetaPrioridad";
import {
    buscarAmbientePorCodigo,
    buscarTicketDuplicado,
    obtenerCategoriasActivas,
    obtenerSubcategoriasActivas,
    registrarTicket,
} from "./servicioTickets";

const recomendaciones = [
    "El código del ambiente tal como aparece en la puerta.",
    "Desde cuándo ocurre la falla y si es intermitente.",
    "Qué ya intentaste (cambiar cable, reiniciar equipo).",
    "Si hay clase o evento en las próximas horas.",
    "Un teléfono de contacto si hay que coordinar el acceso.",
];

function NuevoTicket() {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const categorias = obtenerCategoriasActivas();
    const [categoriaId, setCategoriaId] = useState(categorias[0]?.id);
    const subcategorias = obtenerSubcategoriasActivas(categoriaId);
    const [subcategoriaId, setSubcategoriaId] = useState(subcategorias[0]?.id);
    const [ambiente, setAmbiente] = useState("");
    const [asunto, setAsunto] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [duplicado, setDuplicado] = useState(null); // null o el ticket repetido

    const categoria = categorias.find((c) => c.id === categoriaId);
    const subcategoria = subcategorias.find((s) => s.id === subcategoriaId);
    const ambienteEncontrado = buscarAmbientePorCodigo(ambiente);
    const prioridad = subcategoria?.prioridadDefecto || "Media";
    const horasEsperadas = subcategoria?.tiempoEsperadoHoras;

    function cambiarCategoria(e) {
        const nueva = e.target.value;
        setCategoriaId(nueva);
        setSubcategoriaId(obtenerSubcategoriasActivas(nueva)[0]?.id);
    }

    function registrar(e) {
        e.preventDefault();
        if (!ambienteEncontrado || !subcategoria) return;

        const repetido = buscarTicketDuplicado(categoriaId, ambienteEncontrado.id);
        if (repetido) {
            setDuplicado(repetido);
            return;
        }

        const ticket = registrarTicket({
            usuarioId: usuario.id,
            categoriaId,
            subcategoriaId,
            ambienteId: ambienteEncontrado.id,
            asunto,
            descripcion,
        });

        navigate("/mis-tickets/nuevo/registrado", {
            state: {
                codigo: ticket.id,
                categoria: categoria.nombre,
                subcategoria: subcategoria.nombre,
                ambiente: ambienteEncontrado.codigo,
                prioridad: ticket.prioridad,
                tiempoEsperadoHoras: ticket.tiempoEsperadoHoras,
                fechaRegistro: ticket.fechaRegistro,
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
                                Ya existe un ticket abierto para {ambiente.trim()} en {categoria?.nombre}:{" "}
                                {duplicado.id}. Revísalo antes de crear otro.
                            </p>
                            {duplicado.usuarioId === usuario.id && (
                                <Link to={`/mis-tickets/${duplicado.id}`}>Ver ese ticket</Link>
                            )}
                        </div>
                    )}

                    <div id="llenardatos">
                        <form className="card" onSubmit={registrar}>
                            <div id="primerafila">
                                <div id="catego">
                                    <label htmlFor="categoria">Categoría</label>
                                    <select id="categoria" value={categoriaId} onChange={cambiarCategoria}>
                                        {categorias.map((c) => (
                                            <option key={c.id} value={c.id}>{c.nombre}</option>
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
                                            <option key={s.id} value={s.id}>{s.nombre}</option>
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
                                            onChange={(e) => {
                                                setAmbiente(e.target.value);
                                                setDuplicado(null);
                                            }}
                                            required
                                        />
                                        <button type="button">Buscar</button>
                                    </div>
                                    <small>
                                        {ambienteEncontrado
                                            ? `${ambienteEncontrado.tipo} - Pabellón ${ambienteEncontrado.pabellon} - piso ${ambienteEncontrado.piso}`
                                            : ambiente.trim()
                                              ? "No existe un ambiente con ese código."
                                              : "Escribe el código del ambiente."}
                                    </small>
                                </div>
                                <div className="prio">
                                    <label>Prioridad sugerida</label>
                                    <div className="prioridad">
                                        <EtiquetaPrioridad prioridad={prioridad} />
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
                                    Prioridad {prioridad.toLowerCase()}: atención dentro de {horasEsperadas} horas
                                    desde el registro.
                                </p>
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

export default NuevoTicket;