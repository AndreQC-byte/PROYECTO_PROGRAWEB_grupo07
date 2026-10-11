import React, { useState } from "react";

export default function MiBandeja() {
  const [abiertos, setAbiertos] = useState(1);
  const [disponibles, setDisponibles] = useState([
    { id: 1, codigo: "TCK-2026-00146", asunto: "Punto de red caído", categoria: "Redes", prioridad: "Crítica" },
    { id: 2, codigo: "TCK-2026-00138", asunto: "Pantalla no baja", categoria: "Audiovisuales", prioridad: "Baja" }
  ]);
  const [misTickets, setMisTickets] = useState([
    { id: 101, codigo: "TCK-2026-00147", asunto: "Proyector no enciende", categoria: "Audiovisuales", prioridad: "Crítica", estado: "Abierto" },
    { id: 102, codigo: "TCK-2026-00124", asunto: "Punto de red sin enlace", categoria: "Redes", prioridad: "Alta", estado: "En atención" },
    { id: 103, codigo: "TCK-2026-00126", asunto: "Proyector con imagen verdosa", categoria: "Audiovisuales", prioridad: "Media", estado: "En espera" },
    { id: 104, codigo: "TCK-2026-00134", asunto: "Micrófono sin señal", categoria: "Audiovisuales", prioridad: "Baja", estado: "Resuelto" }
  ]);

  const autoasignar = (item) => {
    setMisTickets([...misTickets, { ...item, estado: "Abierto" }]);
    setDisponibles(disponibles.filter((d) => d.id !== item.id));
    setAbiertos(abiertos + 1);
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>Mi bandeja</h1>
      <p>
        Abiertos: <strong>{abiertos}</strong> · En atención: <strong>1</strong> · En espera: <strong>1</strong> · Resueltos: <strong>1</strong>
      </p>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Asunto</th>
            <th>Categoría</th>
            <th>Prioridad</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {misTickets.map((t) => (
            <tr key={t.id}>
              <td>{t.codigo}</td>
              <td>{t.asunto}</td>
              <td>{t.categoria}</td>
              <td className={t.prioridad.toLowerCase() === "crítica" ? "critica" : t.prioridad.toLowerCase()}>{t.prioridad}</td>
              <td>{t.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Disponibles en mis categorías</h2>
      <table>
        <tbody>
          {disponibles.map((item) => (
            <tr key={item.id}>
              <td>{item.codigo}</td>
              <td>{item.asunto}</td>
              <td>{item.categoria}</td>
              <td className={item.prioridad.toLowerCase() === "crítica" ? "critica" : item.prioridad.toLowerCase()}>{item.prioridad}</td>
              <td>
                <button onClick={() => autoasignar(item)}>Autoasignarme</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}