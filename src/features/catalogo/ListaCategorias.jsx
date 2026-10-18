import React, { useState } from 'react';
import db from '../../data/db.json'; // Consumo del contrato de datos
import DialogoConfirmacion from '../../components/common/DialogoConfirmacion'; // Componente compartido

const ListaCategorias = () => {
  const [categorias, setCategorias] = useState(db.categorias);
  const [subcategorias, setSubcategorias] = useState(db.subcategorias);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [catSeleccionada, setCatSeleccionada] = useState(null);

  // Acción destructiva: pide confirmación explícita según las reglas
  const intentarDesactivar = (categoria) => {
    setCatSeleccionada(categoria);
    setModalAbierto(true);
  };

  const confirmarDesactivacion = () => {
    alert(`La categoría ${catSeleccionada.nombre} ha sido desactivada.`);
    setModalAbierto(false);
  };

  return (
    <div className="vista-catalogo">
      <div className="cabecera-seccion flex-between">
        <h1>Categorías de servicio</h1>
        {/* Usa las clases CSS globales de theme.css y globals.css */}
        <button className="btn-primario">Nueva categoría</button>
      </div>
      
      <p>7 categorías activas · 19 subcategorías · la prioridad por defecto se aplica a cada ticket nuevo.</p>

      {/* Tabla densa operativa */}
      <table className="tabla-datos">
        <thead>
          <tr>
            <th>CATEGORÍA · SUBCATEGORÍA</th>
            <th>PRIORIDAD</th>
            <th>TIEMPO ESPERADO</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {subcategorias.map(sub => {
            const padre = categorias.find(c => c.id === sub.categoriaPadreId);
            return (
              <tr key={sub.id}>
                <td>{padre?.nombre} · {sub.nombre}</td>
                <td>{sub.prioridadDefecto}</td>
                <td>{sub.tiempoEsperadoHoras} h hábiles</td>
                <td>{sub.estado}</td>
                <td>
                  <button className="btn-terciario">Editar</button>
                  <button 
                    className="btn-destructivo" 
                    onClick={() => intentarDesactivar(sub)}
                  >
                    Desactivar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal flotante con sombra para confirmaciones */}
      {modalAbierto && (
        <DialogoConfirmacion 
          titulo="¿Desactivar categoría?"
          mensaje={`¿Estás seguro de desactivar "${catSeleccionada.nombre}"? Las categorías inactivas no admiten tickets nuevos[cite: 3].`}
          onConfirmar={confirmarDesactivacion}
          onCancelar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
};

export default ListaCategorias;