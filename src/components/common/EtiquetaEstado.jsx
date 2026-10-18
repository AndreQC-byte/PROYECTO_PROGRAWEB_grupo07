import React from 'react';

// Colores semánticos del sistema de diseño; el fondo es una versión suave del mismo color
const COLORES_ESTADO = {
  'Abierto': { texto: '#3B6FA8', fondo: '#E7EFF6' },
  'En atención': { texto: '#B7791F', fondo: '#FBF3E4' },
  'En espera': { texto: '#5F6C78', fondo: '#F4F6F8' },
  'Resuelto': { texto: '#1E7F4D', fondo: '#E8F3EC' },
  'Cerrado': { texto: '#1E7F4D', fondo: '#E8F3EC' },
  'Reabierto': { texto: '#B4322B', fondo: '#FBEAE8' },
};

const EtiquetaEstado = ({ estado }) => {
  const color = COLORES_ESTADO[estado] || COLORES_ESTADO['En espera'];

  const estilo = {
    color: color.texto,
    backgroundColor: color.fondo,
    border: `1px solid ${color.texto}`,
    padding: '0 8px',
    borderRadius: '4px', // Radio de 4 px en todo
    fontSize: '12px',
    lineHeight: '20px', // Tipografía de etiqueta 12/16 con 2 px de aire vertical
    whiteSpace: 'nowrap',
  };

  return <span style={estilo}>{estado}</span>;
};

export default EtiquetaEstado;
