import React from 'react';

const Boton = ({ tipo = 'primario', children, onClick, type = 'button', disabled = false }) => {

  const claseBoton = `btn-${tipo}`;

  return (
    <button 
      type={type} 
      className={claseBoton} 
      onClick={onClick} 
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Boton;