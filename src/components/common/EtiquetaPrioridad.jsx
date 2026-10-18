import React from 'react';

// Colores de prioridad del sistema de diseño; el fondo es una versión suave del mismo color
const COLORES_PRIORIDAD = {
  'Crítica': { texto: '#B4322B', fondo: '#FBEAE8' },
  'Alta': { texto: '#D2601A', fondo: '#FBEDE3' },
  'Media': { texto: '#B7791F', fondo: '#FBF3E4' },
  'Baja': { texto: '#3B6FA8', fondo: '#E7EFF6' },
};

const EtiquetaPrioridad = ({ prioridad }) => {
  const color = COLORES_PRIORIDAD[prioridad] || { texto: '#5F6C78', fondo: '#F4F6F8' };

  const estilo = {
    color: color.texto,
    backgroundColor: color.fondo,
    border: `1px solid ${color.texto}`,
    padding: '0 8px',
    borderRadius: '4px',
    fontSize: '12px',
    lineHeight: '20px',
    whiteSpace: 'nowrap',
  };

  return <span style={estilo}>{prioridad}</span>;
};

export default EtiquetaPrioridad;
