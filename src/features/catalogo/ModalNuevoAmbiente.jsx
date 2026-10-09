import React, { useState } from 'react';
const ModalNuevoAmbiente = ({ onCerrar, onGuardar }) => {
  const [formulario, setFormulario] = useState({
    codigo: '',
    tipo: 'Laboratorio',
    pabellon: '',
    piso: '',
    capacidad: ''
  });

  const manejarCambio = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const procesarGuardado = (e) => {
    e.preventDefault();
    // Validaciones en línea: verificar que no haya campos vacíos[cite: 3]
    if (!formulario.codigo || !formulario.pabellon) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }
    
    const nuevo = {
      id: `AMB-00${Math.floor(Math.random() * 100)}`, // ID simulado
      ...formulario,
      sede: 'Campus Monterrico' // Dato por defecto según mockup[cite: 4]
    };
    onGuardar(nuevo);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-contenido modal"> {/* Clase global .modal para la sombra[cite: 4] */}
        <div className="modal-cabecera">
          <h2>Nuevo ambiente</h2>
          <button className="btn-cerrar-modal" onClick={onCerrar}>×</button>
        </div>
        
        <form onSubmit={procesarGuardado}>
          <div className="fila-formulario">
            <div className="grupo-campo">
              <label>CÓDIGO</label>
              <input type="text" name="codigo" value={formulario.codigo} onChange={manejarCambio} placeholder="H-212" required />
            </div>
            <div className="grupo-campo">
              <label>TIPO</label>
              <select name="tipo" value={formulario.tipo} onChange={manejarCambio}>
                <option value="Laboratorio">Laboratorio</option>
                <option value="Aula">Aula</option>
                <option value="Auditorio">Auditorio</option>
              </select>
            </div>
          </div>

          <div className="fila-formulario">
            <div className="grupo-campo">
              <label>PABELLÓN · PISO</label>
              <input type="text" name="pabellon" value={formulario.pabellon} onChange={manejarCambio} placeholder="H · piso 2" required />
            </div>
            <div className="grupo-campo">
              <label>CAPACIDAD</label>
              <input type="number" name="capacidad" value={formulario.capacidad} onChange={manejarCambio} placeholder="30" required />
            </div>
          </div>

          <div className="modal-acciones">
            <button type="button" className="btn-secundario" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn-primario">Guardar ambiente</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNuevoAmbiente;