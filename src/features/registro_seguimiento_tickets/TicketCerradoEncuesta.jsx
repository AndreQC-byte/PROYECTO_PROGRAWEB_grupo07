import { useState } from "react";
import "../../styles/registro.css";
import Boton from "../../components/common/Boton";
import EtiquetaEstado from "../../components/common/EtiquetaEstado";
import ModalReabrirTicket from "./ModalReabrirTicket";

// Todos los datos llegan ya formateados desde DetalleTicketUsuario (ver datosCierre en servicioTickets.js)
const TicketCerradoEncuesta = ({
    codigo,
    estado,
    fechaResolucion,
    resueltoPor,
    solucion,
    fechaLimite, // último día para responder la encuesta y reabrir (7 días después del cierre)
    encuestaPendiente = false,
    vencido = false,
    onResponderEncuesta,
    onReabrirConfirmado,
}) => {
    const [mostrarModal, setMostrarModal] = useState(false);

    const titulo =
        encuestaPendiente && !vencido ? "CERRADO CON ENCUESTA PENDIENTE" : estado.toUpperCase();

    return (
        <>
            <div className="ticket-cerrado-encuesta">
                <p className="tce-estado">{titulo}</p>

                <p className="tce-codigo">
                    {codigo} <EtiquetaEstado estado={estado} />
                </p>

                {fechaResolucion && (
                    <div className="tce-aviso tce-aviso-resuelto">
                        Resuelto el {fechaResolucion}
                        {resueltoPor && ` por ${resueltoPor}`}.
                        {solucion && ` Solución: ${solucion}`}
                    </div>
                )}

                {encuestaPendiente && !vencido && (
                    <div className="tce-aviso tce-aviso-pendiente">
                        Tienes una encuesta pendiente para este ticket. Puedes responderla
                        hasta el {fechaLimite} (7 días después del cierre).
                    </div>
                )}

                {vencido && (
                    <div className="tce-aviso tce-aviso-pendiente">
                        El plazo de 7 días para responder la encuesta y reabrir este ticket
                        venció el {fechaLimite}. Si el problema continúa, registra un ticket nuevo.
                    </div>
                )}

                {!vencido && (
                    <div className="tce-botones">
                        {encuestaPendiente && (
                            <Boton tipo="primario" onClick={onResponderEncuesta}>
                                Responder encuesta
                            </Boton>
                        )}
                        <Boton tipo="reabrir" onClick={() => setMostrarModal(true)}>
                            Reabrir ticket
                        </Boton>
                    </div>
                )}
            </div>

            {mostrarModal && (
                <ModalReabrirTicket
                    codigo={codigo}
                    fechaLimite={fechaLimite}
                    onCerrar={() => setMostrarModal(false)}
                    onConfirmar={(motivo) => {
                        setMostrarModal(false);
                        if (onReabrirConfirmado) onReabrirConfirmado(motivo);
                    }}
                />
            )}
        </>
    );
};

export default TicketCerradoEncuesta;