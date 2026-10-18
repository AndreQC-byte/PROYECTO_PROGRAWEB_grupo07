import React, { useState } from 'react';
import db from '../../data/db.json'; 

const TecnicosPorCategoria = () => {
  // 1. Filtrar desde el JSON únicamente a los usuarios cuyo rol sea "Técnico"
  const tecnicosIniciales = db.usuarios.filter(usuario => usuario.rol === 'Técnico');
  const [tecnicos, setTecnicos] = useState(tecnicosIniciales);

  const categorias = db.categorias;
  const tickets = db.tickets;

  // 2. Lógica para calcular la "Carga actual" cruzando datos con los tickets
  const calcularCarga = (tecnicoId) => {
    return tickets.filter(t => 
      t.tecnicoAsignadoId === tecnicoId && 
      ['Abierto', 'En atención', 'En espera'].includes(t.estado)
    ).length;
  };

  // 3. Función para agregar o quitar la ID de la categoría en el arreglo "especialidades"
  const toggleCategoria = (tecnicoId, categoriaId) => {
    setTecnicos(tecnicos.map(tec => {
      if (tec.id === tecnicoId) {
        // Verifica si el técnico ya tiene esta categoría asignada en su arreglo
        const tieneEspecialidad = tec.especialidades?.includes(categoriaId);
        
        const nuevasEspecialidades = tieneEspecialidad
          ? tec.especialidades.filter(id => id !== categoriaId) // Si la tiene, se quita
          : [...(tec.especialidades || []), categoriaId];       // Si no la tiene, se agrega
          
        return { ...tec, especialidades: nuevasEspecialidades };
      }
      return tec;
    }));
  };

  const guardarMatriz = () => {
    alert("Matriz de técnicos actualizada y guardada correctamente.");
  };

  return (
    <div className="vista-tecnicos-categoria">
      <div className="cabecera-seccion flex-between" style={{ marginBottom: '16px' }}>
        <div>
          <h1>Técnicos por categoría</h1>
          <p style={{ fontSize: '15px', color: '#5F6C78' }}>
            Marca las categorías que cada técnico puede atender. La cola solo ofrece técnicos habilitados al asignar.
          </p>
        </div>
        <div className="acciones" style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secundario">Invitar técnico</button>
          <button className="btn-primario" onClick={guardarMatriz}>Guardar matriz</button>
        </div>
      </div>

      <table className="tabla-datos" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>TÉCNICO</th>
            <th>ESPECIALIDAD DECLARADA</th>
            <th>CARGA ACTUAL</th>
            {/* Cabeceras dinámicas basadas en tu db.json */}
            {categorias.map(cat => (
              <th key={cat.id} style={{ textAlign: 'center' }}>
                {cat.nombre.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tecnicos.map(tec => {
            // Transformar las IDs (ej. CAT-001) en nombres legibles (ej. Audiovisuales)
            const nombresEspecialidades = (tec.especialidades || [])
              .map(espId => categorias.find(c => c.id === espId)?.nombre)
              .filter(Boolean)
              .join(', ');

            return (
              <tr key={tec.id}>
                {/* Concatenar nombres y apellidos según el JSON */}
                <td style={{ fontWeight: 'bold' }}>{tec.nombres} {tec.apellidos}</td>
                <td>{nombresEspecialidades || 'Ninguna'}</td>
                <td>{calcularCarga(tec.id)} tickets</td>
                
                {/* Cajas de verificación para cada categoría disponible */}
                {categorias.map(cat => (
                  <td key={cat.id} style={{ textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={tec.especialidades?.includes(cat.id) || false}
                      onChange={() => toggleCategoria(tec.id, cat.id)}
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Reglas de ayuda al pie del mockup */}
      <div className="pie-vista" style={{ marginTop: '16px', color: '#5F6C78', fontSize: '13px' }}>
        <p>
          <span style={{ color: '#B7791F', fontWeight: 'bold' }}>Nota:</span> Climatización tiene solo dos técnicos habilitados y 5 tickets abiertos. Considera habilitar un tercero.
        </p>
        <p>
          Carga actual = tickets asignados en estado abierto, en atención o en espera.
        </p>
      </div>
    </div>
  );
};

export default TecnicosPorCategoria;