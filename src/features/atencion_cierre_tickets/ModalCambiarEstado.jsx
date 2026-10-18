import { useState } from 'react';
import Boton from '../../components/common/Boton';
import { DESCRIPCION_ESTADO, ESTADOS_SELECCIONABLES, TRANSICIONES } from './servicioAtencion';

// Vista 5.3: cambio de estado, solo con las transiciones permitidas
export default function ModalCambiarEstado({ ticket, onGuardar, onCancelar }) {
  const permitidos = TRANSICIONES[ticket.estado] || [];
  const [nuevoEstado, setNuevoEstado] = useState(permitidos[0] || '');
  const [motivo, setMotivo] = useState('');
  const [fechaRetorno, setFechaRetorno] = useState('');
  const [errores, setErrores] = useState({});

  const hoy = new Date().toISOString().slice(0, 10);
  const enEspera = nuevoEstado === 'En espera';

  const guardar = (e) => {
    e.preventDefault();
    const nuevosErrores = {};
    if (!nuevoEstado) nuevosErrores.estado = 'Selecciona el nuevo estado';
    if (enEspera && !motivo.trim()) nuevosErrores.motivo = 'El motivo de la espera es obligatorio';
    if (enEspera && fechaRetorno && fechaRetorno < hoy) nuevosErrores.fechaRetorno = 'La fecha de retorno no puede ser anterior a hoy';
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length === 0) {
      onGuardar(nuevoEstado, enEspera ? { motivo: motivo.trim(), fechaRetorno } : {});
    }
  };

  return (
    <div className="atc-overlay" role="dialog" aria-modal="true" aria-labelledby="titulo-cambiar-estado">
      <form className="atc-modal" onSubmit={guardar} noValidate>
        <div className="atc-modal-cabecera">
          <h3 id="titulo-cambiar-estado">Cambiar estado de {ticket.id}</h3>
          <button type="button" className="atc-cerrar" onClick={onCancelar} aria-label="Cerrar">&times;</button>
        </div>

        <div className="atc-modal-cuerpo">
          <p className="atc-auxiliar atc-muted">
            Estado actual: {ticket.estado}. Solo se ofrecen las transiciones permitidas.
          </p>

          <div className="atc-opciones">
            {ESTADOS_SELECCIONABLES.filter((estado) => estado !== ticket.estado).map((estado) => {
              const habilitado = permitidos.includes(estado);
              const marcado = nuevoEstado === estado;
              return (
                <label
                  key={estado}
                  className={`atc-opcion ${marcado ? 'atc-opcion-activa' : ''} ${marcado && estado === 'En espera' ? 'atc-opcion-espera' : ''} ${habilitado ? '' : 'atc-opcion-deshabilitada'}`}
                >
                  <input type="radio" name="nuevo_estado" checked={marcado} disabled={!habilitado} onChange={() => setNuevoEstado(estado)} />
                  <span>{habilitado ? DESCRIPCION_ESTADO[estado] || estado : `${estado} · no disponible desde ${ticket.estado}`}</span>
                </label>
              );
            })}
          </div>
          {errores.estado && <p className="atc-error">{errores.estado}</p>}

          {enEspera && (
            <div className="atc-fila-2col">
              <div className="atc-campo">
                <label htmlFor="motivo-espera">Motivo de espera (obligatorio)</label>
                <textarea
                  id="motivo-espera"
                  rows="3"
                  value={motivo}
                  aria-invalid={Boolean(errores.motivo)}
                  onChange={(e) => { setMotivo(e.target.value); setErrores({ ...errores, motivo: '' }); }}
                />
                {errores.motivo && <p className="atc-error">{errores.motivo}</p>}
              </div>
              <div className="atc-campo">
                <label htmlFor="fecha-retorno">Fecha estimada de retorno</label>
                <input id="fecha-retorno" type="date" min={hoy} value={fechaRetorno} onChange={(e) => { setFechaRetorno(e.target.value); setErrores({ ...errores, fechaRetorno: '' }); }} />
                {errores.fechaRetorno && <p className="atc-error">{errores.fechaRetorno}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="atc-modal-pie">
          <Boton tipo="secundario" onClick={onCancelar}>Cancelar</Boton>
          <Boton type="submit" disabled={permitidos.length === 0}>Guardar estado</Boton>
        </div>
      </form>
    </div>
  );
}
