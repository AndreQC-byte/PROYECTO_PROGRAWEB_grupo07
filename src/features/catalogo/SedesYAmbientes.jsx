import React, { useState } from 'react';
import db from '../../data/db.json';
import ModalNuevoAmbiente from './ModalNuevoAmbiente'; // Importación del modal

const SedesYAmbientes = () => {
  const [ambientes, setAmbientes] = useState(db.ambientes);
  const [mostrarModal, setMostrarModal] = useState(false);

  const guardarNuevoAmbiente = (nuevoAmbiente) => {
    // Agrega el nuevo ambiente a la lista temporal
    setAmbientes([...ambientes, nuevoAmbiente]);
    setMostrarModal(false);
    // Toda operación de escritura notifica su resultado[cite: 3]
    alert(`Ambiente ${nuevoAmbiente.codigo} creado correctamente.`);
  };

  return (
    <div className="vista-ambientes">
      <div className="cabecera-seccion flex-between">
        <h1>Sedes y ambientes</h1>
        <button className="btn-primario" onClick={() => setMostrarModal(true)}>
          Nuevo ambiente
        </button>
      </div>

      <table className="tabla-datos">
        <thead>
          <tr>
            <th>CÓDIGO</th>
            <th>TIPO DE AMBIENTE</th>
            <th>PABELLÓN</th>
            <th>PISO</th>
            <th>SEDE</th>
            <th>CAPACIDAD</th>
          </tr>
        </thead>
        <tbody>
          {ambientes.map(amb => (
            <tr key={amb.id}>
              <td>{amb.codigo}</td>
              <td>{amb.tipo}</td>
              <td>{amb.pabellon}</td>
              <td>{amb.piso}</td>
              <td>{amb.sede}</td>
              <td>{amb.capacidad}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Renderizado condicional del modal flotante[cite: 4] */}
      {mostrarModal && (
        <ModalNuevoAmbiente 
          onCerrar={() => setMostrarModal(false)} 
          onGuardar={guardarNuevoAmbiente} 
        />
      )}
    </div>
  );
};

export default SedesYAmbientes;