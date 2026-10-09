import React from 'react';

const EtiquetaEstado = ({ estado }) => {
  const obtenerColorEstado = (est) => {
    switch (est) {
      case 'Abierto': return '#3B6FA8';
      case 'En atención': return '#B7791F';
      case 'En espera': return '#5F6C78';
      case 'Resuelto':
      case 'Cerrado': return '#1E7F4D';
      case 'Reabierto': return '#B4322B';
      default: return '#5F6C78';
    }
  };

  const estilo = {
    backgroundColor: obtenerColorEstado(estado),
    color: '#FFFFFF', // Texto en blanco para contrastar
    padding: '2px 6px',
    borderRadius: '4px', // Radio de 4 px en todo
    fontSize: '12px',
    lineHeight: '16px' // Tipografía de etiqueta 12/16
  };

  return <span style={estilo}>{estado}</span>;
};

export default EtiquetaEstado;
