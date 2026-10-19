import { Link } from "react-router-dom";
import "../../styles/registro.css";
import Encabezado from "../../components/layouts/Encabezado";
import NavegacionSidebar from "../../components/layouts/NavegacionSidebar";

function SinTickets() {
    return (
        <>
            <Encabezado />
            <div className="mis-tickets-marco">
                <NavegacionSidebar />
                <main className="mis-tickets">
                    <div className="principal">
                        <div>
                            <h1>Mis tickets</h1>
                            <p id="resumen">0 tickets registrados</p>
                        </div>
                        <Link to="/mis-tickets/nuevo" className="btn-primario">
                            Registrar un ticket
                        </Link>
                    </div>

                    <div className="tabla vacio">
                        <span className="iconovacio"></span>
                        <h2>Todavía no has reportado nada</h2>
                        <p>Cuando registres un ticket lo verás aquí con su estado y su prioridad.</p>
                        <Link to="/mis-tickets/nuevo" className="btn-primario">
                            Registrar un ticket
                        </Link>
                    </div>

                    <div className="notificacion-error" role="alert">
                        Notificación de error · «No pudimos registrar el ticket. Revisa tu conexión e inténtalo otra vez.»
                    </div>
                </main>
            </div>
            <footer className="mis-tickets-pie">
                <span>Mesa de Ayuda de Servicios del Campus - Universidad de Lima</span>
                <span>soporte.campus@ulima.edu.pe - anexo 30500 - Términos - Privacidad</span>
            </footer>
        </>
    );
}

export default SinTickets;