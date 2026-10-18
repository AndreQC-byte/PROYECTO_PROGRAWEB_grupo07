import React from 'react';
import Boton from './Boton';

const DialogoConfirmacion = ({ titulo, mensaje, onConfirmar, onCancelar, textoConfirmar = "Confirmar" }) => {
  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      {/* Las sombras se aplican exclusivamente a modales y desplegables[cite: 3] */}
      <div className="modal-contenido" style={{ background: '#FFFFFF', padding: '20px', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxWidth: '400px', margin: '100px auto' }}>
        <h3>{titulo}</h3>
        <p style={{ fontSize: '15px', lineHeight: '22px' }}>{mensaje}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <Boton tipo="secundario" onClick={onCancelar}>Cancelar</Boton>
          <Boton tipo="destructivo" onClick={onConfirmar}>{textoConfirmar}</Boton>
        </div>
      </div>
    </div>
  );
};

export default DialogoConfirmacion;