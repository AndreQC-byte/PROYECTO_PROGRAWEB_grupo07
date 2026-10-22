import React from 'react';
import EtiquetaPrioridad from '../common/EtiquetaPrioridad';
import EtiquetaEstado from '../common/EtiquetaEstado';

const TarjetaTicket = ({ ticket, onClick, accionExtra }) => {
  if (!ticket) return null;

  return (
    <div
      className="tarjeta-ticket"
      onClick={onClick}
      style={{
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        border: '1px solid var(--color-border, #D6DEE5)',
        borderRadius: 'var(--border-radius, 4px)',
        padding: '16px',
        marginBottom: '12px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)' }}>
          {ticket.id || ticket.codigo}
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {ticket.prioridad && <EtiquetaPrioridad prioridad={ticket.prioridad} />}
          {ticket.estado && <EtiquetaEstado estado={ticket.estado} />}
        </div>
      </div>

      <h4 style={{ fontSize: '15px', fontWeight: 600, margin: '4px 0 8px', color: 'var(--color-text)' }}>
        {ticket.asunto}
      </h4>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-muted)' }}>
        <span>{ticket.categoriaNombre || ticket.categoria} · {ticket.ambienteCodigo || ticket.ambiente}</span>
        {ticket.tiempoEsperadoHoras && (
          <span>{ticket.tiempoEsperadoHoras} h esperadas</span>
        )}
      </div>

      {accionExtra && (
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
          {accionExtra}
        </div>
      )}
    </div>
  );
};

export default TarjetaTicket;

