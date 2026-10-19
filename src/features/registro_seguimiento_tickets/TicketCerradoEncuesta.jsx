import { useState } from "react";
import "../../styles/registro.css";
import Boton from "../../components/common/Boton";
import EtiquetaEstado from "../../components/common/EtiquetaEstado";
import ModalReabrirTicket from "./ModalReabrirTicket";

const TicketCerradoEncuesta = ({
    codigo = "TCK-2026-00131",
    estado = "Cerrado",
    fechaResolucion = "03/09/2026",
    resueltoPor = "Rocío Espinoza Farfán",
    solucion = "limpieza profunda del ambiente y retiro de residuos del evento.",
    fechaLimiteEncuesta = "10/09/2026",
    onResponderEncuesta,
    onReabrirConfirmado,
}) => {
    const [mostrarModal, setMostrarModal] = useState(false);

    return (
        <>
            <div className="ticket-cerrado-encuesta">
                <p className="tce-estado">CERRADO CON ENCUESTA PENDIENTE</p>

                <p className="tce-codigo">
                    {codigo} <EtiquetaEstado estado={estado} />
                </p>

                <div className="tce-aviso tce-aviso-resuelto">
                    Resuelto el {fechaResolucion} por {resueltoPor}. Solución: {solucion}
                </div>

                <div className="tce-aviso tce-aviso-pendiente">
                    Tienes una encuesta pendiente para este ticket. Puedes responderla
                    hasta el {fechaLimiteEncuesta}.
                </div>

                <div className="tce-botones">
                    <Boton tipo="primario" onClick={onResponderEncuesta}>
                        Responder encuesta
                    </Boton>
                    <Boton tipo="reabrir" onClick={() => setMostrarModal(true)}>
                        Reabrir ticket
                    </Boton>
                </div>
            </div>

            {mostrarModal && (
                <ModalReabrirTicket
                    codigo={codigo}
                    fechaLimite={fechaLimiteEncuesta}
                    onCerrar={() => setMostrarModal(false)}
                    onConfirmar={(motivo) => {
                        if (onReabrirConfirmado) onReabrirConfirmado(motivo);
                        setMostrarModal(false);
                    }}
                />
            )}
        </>
    );
};

export default TicketCerradoEncuesta;