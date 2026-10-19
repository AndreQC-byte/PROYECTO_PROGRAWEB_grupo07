import EncabezadoUsuario from './Encabezadousuario';
import SidebarUsuario from './Sidebarusuario';
import Footer from '../layouts/Footer';

function LayoutUsuario({ children }) {
  return (
    <div className="app">
      <EncabezadoUsuario />
      <SidebarUsuario />
      {children}
      <Footer />
    </div>
  );
}

export default LayoutUsuario;