import { useEffect } from "react";
import "../../styles/registro.css";
import Boton from "../../components/common/Boton";

// Modal de confirmación para cancelar un ticket propio (reutiliza las clases mr-* del modal de reabrir)
const ModalCancelarTicket = ({ codigo, onCerrar, onConfirmar }) => {
    // Cierra el modal con la tecla Esc
    useEffect(() => {
        const alPresionar = (e) => {
            if (e.key === "Escape") onCerrar();
        };
        window.addEventListener("keydown", alPresionar);
        return () => window.removeEventListener("keydown", alPresionar);
    }, [onCerrar]);

    return (
        <div className="mr-fondo" onClick={onCerrar}>
            <div
                className="mr-ventana"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mc-titulo"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mr-titulo">
                    <h2 id="mc-titulo">Cancelar {codigo}</h2>
                    <button type="button" className="mr-cerrar" aria-label="Cerrar" onClick={onCerrar}>
                        ×
                    </button>
                </div>

                <p className="mr-aviso">
                    ¿Seguro que quieres cancelar este ticket? Solo se puede cancelar mientras no tenga
                    técnico asignado y esta acción no se puede deshacer.
                </p>

                <div className="mr-botones">
                    <Boton tipo="secundario" onClick={onCerrar}>
                        Volver
                    </Boton>
                    <Boton tipo="primario" onClick={onConfirmar}>
                        Cancelar ticket
                    </Boton>
                </div>
            </div>
        </div>
    );
};

export default ModalCancelarTicket;