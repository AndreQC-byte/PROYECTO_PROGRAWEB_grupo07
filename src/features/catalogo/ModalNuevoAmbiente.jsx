import React, { useState } from 'react';

const TIPOS_AMBIENTE = ['Aula', 'Aula magna', 'Laboratorio', 'Laboratorio de cómputo', 'Laboratorio de Redes', 'Laboratorio de Física', 'Auditorio', 'Biblioteca'];

const ModalNuevoAmbiente = ({ onCerrar, onGuardar }) => {
  const [codigo, setCodigo] = useState('');
  const [tipo, setTipo] = useState('Laboratorio');
  const [pabellon, setPabellon] = useState('H');
  const [piso, setPiso] = useState(2);
  const [capacidad, setCapacidad] = useState(30);
  const [sede, setSede] = useState('Campus Monterrico');

  const [errores, setErrores] = useState({});

  const validar = () => {
    const nuevosErrores = {};
    if (!codigo.trim()) nuevosErrores.codigo = 'El código es obligatorio (ej. H-212).';
    if (!pabellon.trim()) nuevosErrores.pabellon = 'El pabellón es obligatorio.';
    if (!piso || Number(piso) <= 0) nuevosErrores.piso = 'Piso inválido.';
    if (!capacidad || Number(capacidad) <= 0) nuevosErrores.capacidad = 'La capacidad debe ser mayor que 0.';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const procesarGuardado = (e) => {
    e.preventDefault();
    if (!validar()) return;

    onGuardar({
      codigo: codigo.trim().toUpperCase(),
      tipo,
      pabellon: pabellon.trim().toUpperCase(),
      piso: Number(piso),
      capacidad: Number(capacidad),
      sede,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-contenido modal">
        <div className="modal-cabecera">
          <h2>Nuevo ambiente</h2>
          <button type="button" className="btn-cerrar-modal" onClick={onCerrar}>
            ×
          </button>
        </div>

        <form onSubmit={procesarGuardado}>
          <div className="modal-cuerpo">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="catalogo-form-grupo">
                <label>CÓDIGO</label>
                <input
                  type="text"
                  className={`catalogo-form-input ${errores.codigo ? 'error' : ''}`}
                  placeholder="H-212"
                  value={codigo}
                  onChange={(e) => {
                    setCodigo(e.target.value);
                    if (errores.codigo) setErrores({ ...errores, codigo: null });
                  }}
                />
                {errores.codigo && <span className="catalogo-form-error-texto">{errores.codigo}</span>}
              </div>

              <div className="catalogo-form-grupo">
                <label>TIPO</label>
                <select
                  className="catalogo-form-select"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  {TIPOS_AMBIENTE.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="catalogo-form-grupo">
                <label>PABELLÓN</label>
                <input
                  type="text"
                  className={`catalogo-form-input ${errores.pabellon ? 'error' : ''}`}
                  placeholder="H"
                  value={pabellon}
                  onChange={(e) => {
                    setPabellon(e.target.value);
                    if (errores.pabellon) setErrores({ ...errores, pabellon: null });
                  }}
                />
                {errores.pabellon && <span className="catalogo-form-error-texto">{errores.pabellon}</span>}
              </div>

              <div className="catalogo-form-grupo">
                <label>PISO</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className={`catalogo-form-input ${errores.piso ? 'error' : ''}`}
                  value={piso}
                  onChange={(e) => {
                    setPiso(e.target.value);
                    if (errores.piso) setErrores({ ...errores, piso: null });
                  }}
                />
                {errores.piso && <span className="catalogo-form-error-texto">{errores.piso}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="catalogo-form-grupo">
                <label>CAPACIDAD</label>
                <input
                  type="number"
                  min="1"
                  className={`catalogo-form-input ${errores.capacidad ? 'error' : ''}`}
                  placeholder="30"
                  value={capacidad}
                  onChange={(e) => {
                    setCapacidad(e.target.value);
                    if (errores.capacidad) setErrores({ ...errores, capacidad: null });
                  }}
                />
                {errores.capacidad && <span className="catalogo-form-error-texto">{errores.capacidad}</span>}
              </div>

              <div className="catalogo-form-grupo">
                <label>SEDE</label>
                <input
                  type="text"
                  className="catalogo-form-input"
                  value={sede}
                  onChange={(e) => setSede(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-acciones">
            <button type="button" className="btn-secundario" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="btn-primario">
              Guardar ambiente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNuevoAmbiente;
