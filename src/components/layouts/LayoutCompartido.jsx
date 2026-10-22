import React from 'react';
import { Outlet } from 'react-router-dom';
import Encabezado from './Encabezado';
import NavegacionSidebar from './NavegacionSideBar';

const LayoutCompartido = ({ children }) => {
  return (
    <div className="layout-contenedor">
      <Encabezado />
      <div className="layout-cuerpo">
        <NavegacionSidebar />
        <div className="layout-columna-derecha">
          <main className="layout-area-principal">
            <div className="layout-limite-ancho">
              {children || <Outlet />}
            </div>
          </main>
          <footer className="layout-pie">
            <span>Mesa de Ayuda de Servicios del Campus · Universidad de Lima</span>
            <span>soporte.campus@ulima.edu.pe · anexo 30500 · Términos · Privacidad</span>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LayoutCompartido;

