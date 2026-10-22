import { Outlet } from 'react-router-dom';
import Encabezado from '../../components/layouts/Encabezado';
import NavegacionSidebar from '../../components/layouts/NavegacionSidebar';
import '../../styles/auth.css';

// Marco de las pantallas de HU-1 con sesión iniciada: Mi cuenta y Acceso denegado
export default function LayoutPrivado() {
  return (
    <>
      <Encabezado />
      <div className="auth-marco">
        <NavegacionSidebar />
        <div className="auth-columna">
          <main className="auth-area">
            <div className="auth-contenido">
              <Outlet />
            </div>
          </main>
          <footer className="auth-pie-privado">
            <span>Mesa de Ayuda de Servicios del Campus · Universidad de Lima</span>
            <span>soporte.campus@ulima.edu.pe · anexo 30500 · Términos · Privacidad</span>
          </footer>
        </div>
      </div>
    </>
  );
}