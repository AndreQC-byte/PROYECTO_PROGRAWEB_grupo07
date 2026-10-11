import React, { useState } from "react";

const inicialTickets = [
  { id: 1, codigo: "TCK-2026-00147", asunto: "Proyector no enciende", categoria: "Audiovisuales", ambiente: "A-201", solicitante: "Camila Quispe", prioridad: "Crítica", estado: "Abierto", tecnico: "Sin asignar", min: 18, idle: 18 },
  { id: 2, codigo: "TCK-2026-00146", asunto: "Punto de red caído", categoria: "Redes", ambiente: "H-210", solicitante: "Renzo Salazar", prioridad: "Crítica", estado: "Abierto", tecnico: "Sin asignar", min: 42, idle: 42 },
  { id: 3, codigo: "TCK-2026-00145", asunto: "Aire acondicionado sin frío", categoria: "Climatización", ambiente: "E-304", solicitante: "Milagros Ccahuana", prioridad: "Alta", estado: "En atención", tecnico: "Hernán Loayza", min: 70, idle: 15 },
  { id: 4, codigo: "TCK-2026-00141", asunto: "Cinco sillas rotas", categoria: "Mobiliario", ambiente: "A-201", solicitante: "Rosa Ticona", prioridad: "Media", estado: "En espera", tecnico: "Marco Huamán", min: 195, idle: 120 },
  { id: 5, codigo: "TCK-2026-00138", asunto: "Pantalla no baja", categoria: "Audiovisuales", ambiente: "Q-101", solicitante: "Gabriela Ynga", prioridad: "Baja", estado: "Abierto", tecnico: "Sin asignar", min: 305, idle: 305 },
];

export default function ColaTickets() {
  const [tickets, setTickets] = useState(inicialTickets);
  const [seleccionados, setSeleccionados] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [fCat, setFCat] = useState("");
  const [fPri, setFPri] = useState("");
  const [fAmb, setFAmb] = useState("");
  const [fEst, setFEst] = useState("");
  const [orden, setOrden] = useState("antiguedad");

  const [modalAsignar, setModalAsignar] = useState(false);
  const [modalPrioridad, setModalPrioridad] = useState(false);
  const [selTec, setSelTec] = useState("Julio Paredes");
  const [motivoAsignar, setMotivoAsignar] = useState("");
  const [selPri, setSelPri] = useState("Crítica");
  const [motivoPri, setMotivoPri] = useState("");

  const toggleSeleccion = (id) => {
    setSeleccionados(seleccionados.includes(id) ? seleccionados.filter((item) => item !== id) : [...seleccionados, id]);
  };

  const handleAsignar = () => {
    if (seleccionados.length === 0) return alert("Selecciona al menos un ticket.");
    const algunoTieneTecnico = tickets.some((t) => seleccionados.includes(t.id) && t.tecnico !== "Sin asignar");
    if (algunoTieneTecnico && !motivoAsignar.trim()) return alert("Para reasignar escribe el motivo.");

    setTickets(tickets.map((t) => seleccionados.includes(t.id) ? { ...t, tecnico: selTec } : t));
    setSeleccionados([]);
    setModalAsignar(false);
    setMotivoAsignar("");
  };

  const handleCambiarPrioridad = () => {
    if (seleccionados.length === 0) return alert("Selecciona al menos un ticket.");
    if (!motivoPri.trim()) return alert("Escribe el motivo del cambio.");

    setTickets(tickets.map((t) => seleccionados.includes(t.id) ? { ...t, prioridad: selPri } : t));
    setSeleccionados([]);
    setModalPrioridad(false);
    setMotivoPri("");
  };

  const handleDevolver = () => {
    if (seleccionados.length === 0) return alert("Selecciona al menos un ticket.");
    setTickets(tickets.map((t) => seleccionados.includes(t.id) ? { ...t, tecnico: "Sin asignar", estado: "Abierto" } : t));
    setSeleccionados([]);
  };

  const ticketsFiltrados = tickets.filter((t) => {
    const q = buscar.toLowerCase();
    const coincideBusqueda = !q || t.codigo.toLowerCase().includes(q) || t.asunto.toLowerCase().includes(q) || t.solicitante.toLowerCase().includes(q);
    return coincideBusqueda && (!fCat || t.categoria === fCat) && (!fPri || t.prioridad === fPri) && (!fAmb || t.ambiente === fAmb) && (!fEst || t.estado === fEst);
  });

  const prioridadPeso = { Crítica: 1, Alta: 2, Media: 3, Baja: 4 };
  const ticketsOrdenados = [...ticketsFiltrados].sort((a, b) => {
    if (orden === "prioridad") return prioridadPeso[a.prioridad] - prioridadPeso[b.prioridad];
    if (orden === "sinatencion") return b.idle - a.idle;
    return b.min - a.min;
  });

  return (
    <div style={{ padding: "24px" }}>
      <h1>Cola de atención</h1>
      <div className="filtros">
        <input type="text" placeholder="Código, asunto o usuario" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        <select value={fCat} onChange={(e) => setFCat(e.target.value)}>
          <option value="">Categoría: todas</option>
          <option>Audiovisuales</option>
          <option>Redes</option>
          <option>Climatización</option>
          <option>Mobiliario</option>
        </select>
        <select value={fPri} onChange={(e) => setFPri(e.target.value)}>
          <option value="">Prioridad: todas</option>
          <option>Crítica</option>
          <option>Alta</option>
          <option>Media</option>
          <option>Baja</option>
        </select>
        <select value={fAmb} onChange={(e) => setFAmb(e.target.value)}>
          <option value="">Ambiente: todos</option>
          <option>A-201</option>
          <option>H-210</option>
          <option>E-304</option>
          <option>Q-101</option>
        </select>
        <select value={fEst} onChange={(e) => setFEst(e.target.value)}>
          <option value="">Estado: todos</option>
          <option>Abierto</option>
          <option>En atención</option>
          <option>En espera</option>
        </select>
        <select value={orden} onChange={(e) => setOrden(e.target.value)}>
          <option value="antiguedad">Ordenar por antigüedad</option>
          <option value="prioridad">Ordenar por prioridad</option>
          <option value="sinatencion">Ordenar por tiempo sin atención</option>
        </select>
      </div>

      <div className="acciones">
        <button onClick={() => setModalAsignar(true)}>Asignar seleccionados</button>
        <button onClick={() => setModalPrioridad(true)}>Cambiar prioridad</button>
        <button onClick={handleDevolver}>Devolver a la cola</button>
      </div>

      <table>
        <thead>
          <tr>
            <th className="chk"></th>
            <th>Código</th>
            <th>Asunto</th>
            <th>Categoría</th>
            <th>Ambiente</th>
            <th>Solicitante</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Técnico</th>
          </tr>
        </thead>
        <tbody>
          {ticketsOrdenados.map((ticket) => (
            <tr key={ticket.id}>
              <td className="chk">
                <input type="checkbox" checked={seleccionados.includes(ticket.id)} onChange={() => toggleSeleccion(ticket.id)} />
              </td>
              <td>{ticket.codigo}</td>
              <td>{ticket.asunto}</td>
              <td>{ticket.categoria}</td>
              <td>{ticket.ambiente}</td>
              <td>{ticket.solicitante}</td>
              <td className={ticket.prioridad.toLowerCase() === "crítica" ? "critica" : ticket.prioridad.toLowerCase()}>{ticket.prioridad}</td>
              <td>{ticket.estado}</td>
              <td>{ticket.tecnico}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalAsignar && (
        <div className="modal" style={{ display: "block" }}>
          <h3>Asignar técnico</h3>
          <select value={selTec} onChange={(e) => setSelTec(e.target.value)}>
            <option>Julio Paredes</option>
            <option>Marco Huamán</option>
            <option>Iván Zegarra</option>
            <option>Hernán Loayza</option>
          </select>
          <textarea rows="3" placeholder="Motivo (obligatorio si ya tenía técnico)" value={motivoAsignar} onChange={(e) => setMotivoAsignar(e.target.value)} />
          <button onClick={handleAsignar}>Asignar</button>
          <button onClick={() => setModalAsignar(false)}>Cancelar</button>
        </div>
      )}

      {modalPrioridad && (
        <div className="modal" style={{ display: "block" }}>
          <h3>Cambiar prioridad</h3>
          <select value={selPri} onChange={(e) => setSelPri(e.target.value)}>
            <option>Crítica</option>
            <option>Alta</option>
            <option>Media</option>
            <option>Baja</option>
          </select>
          <textarea rows="3" placeholder="Motivo (obligatorio)" value={motivoPri} onChange={(e) => setMotivoPri(e.target.value)} />
          <button onClick={handleCambiarPrioridad}>Guardar</button>
          <button onClick={() => setModalPrioridad(false)}>Cancelar</button>
        </div>
      )}
    </div>
  );
}