import { useState } from 'react';
import Boton from '../../components/common/Boton';
import EtiquetaEstado from '../../components/common/EtiquetaEstado';
import { formatearDuracion } from './servicioAtencion';

// Vista 5.4: cierre del ticket con la solución aplicada y el tiempo total de atención
export default function ModalCerrarTicket({ ticket, solicitante, minutosAtencion, onCerrar, onCancelar }) {
  const [solucion, setSolucion] = useState('');
  const [error, setError] = useState('');

  const dentroDelTiempo = minutosAtencion <= ticket.tiempoEsperadoHoras * 60;

  const confirmar = (e) => {
    e.preventDefault();
    if (!solucion.trim()) {
      setError('La solución aplicada es obligatoria para cerrar el ticket');
      return;
    }
    onCerrar(solucion.trim());
  };

  return (
    <div className="atc-overlay" role="dialog" aria-modal="true" aria-labelledby="titulo-cerrar-ticket">
      <form className="atc-modal" onSubmit={confirmar} noValidate>
        <div className="atc-modal-cabecera">
          <h3 id="titulo-cerrar-ticket">Cerrar {ticket.id}</h3>
          <button type="button" className="atc-cerrar" onClick={onCancelar} aria-label="Cerrar">&times;</button>
        </div>

        <div className="atc-modal-cuerpo">
          <div className="atc-campo">
            <label htmlFor="solucion">Solución aplicada (obligatoria)</label>
            <textarea
              id="solucion"
              rows="4"
              value={solucion}
              aria-invalid={Boolean(error)}
              onChange={(e) => { setSolucion(e.target.value); setError(''); }}
            />
            {error && <p className="atc-error">{error}</p>}
          </div>

          <div className="atc-fila-2col">
            <div className="atc-tarjeta-dato">
              <span className="atc-etiqueta-campo">Tiempo total de atención</span>
              <strong className="atc-dato-grande">{formatearDuracion(minutosAtencion)}</strong>
              <span className={dentroDelTiempo ? 'atc-texto-exito' : 'atc-texto-peligro'}>
                {dentroDelTiempo ? 'Dentro del tiempo esperado' : 'Fuera del tiempo esperado'} ({ticket.tiempoEsperadoHoras} h)
              </span>
            </div>
            <div className="atc-tarjeta-dato">
              <span className="atc-etiqueta-campo">Estado final</span>
              <div><EtiquetaEstado estado="Cerrado" /></div>
            </div>
          </div>

          <p className="atc-aviso-info">
            Al cerrar, {solicitante} recibirá la encuesta de satisfacción y podrá reabrir el ticket dentro de 7 días.
          </p>
        </div>

        <div className="atc-modal-pie">
          <Boton tipo="secundario" onClick={onCancelar}>Cancelar</Boton>
          <Boton type="submit">Cerrar ticket</Boton>
        </div>
      </form>
    </div>
  );
}
