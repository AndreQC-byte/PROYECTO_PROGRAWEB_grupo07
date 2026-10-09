import React from 'react';

const EtiquetaPrioridad = ({ prioridad }) => {
  const obtenerColorPrioridad = (prio) => {
    switch (prio) {
      case 'Crítica': return '#B4322B';
      case 'Alta': return '#D2601A';
      case 'Media': return '#B7791F';
      case 'Baja': return '#3B6FA8';
      default: return '#5F6C78';
    }
  };

  const estilo = {
    color: obtenerColorPrioridad(prioridad),
    fontWeight: 'bold',
    fontSize: '12px',
    lineHeight: '16px'
  };

  return <span style={estilo}>{prioridad}</span>;
};

export default EtiquetaPrioridad;