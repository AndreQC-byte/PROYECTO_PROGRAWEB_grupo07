import React, { useState, useEffect } from "react";
import "../../styles/registro.css";
import Boton from "../../components/common/Boton";

const ModalReabrirTicket = ({ codigo, fechaLimite, onCerrar, onConfirmar }) => {
    const [motivo, setMotivo] = useState("");

    // Cierra el modal con la tecla Esc
    useEffect(() => {
        const alPresionar = (e) => {
            if (e.key === "Escape") onCerrar();
        };
        window.addEventListener("keydown", alPresionar);
        return () => window.removeEventListener("keydown", alPresionar);
    }, [onCerrar]);

    const enviar = (e) => {
        e.preventDefault();
        if (!motivo.trim()) return;
        onConfirmar(motivo.trim());
    };

    return (
        <div className="mr-fondo" onClick={onCerrar}>
            <div
                className="mr-ventana"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mr-titulo"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mr-titulo">
                    <h2 id="mr-titulo">Reabrir {codigo}</h2>
                    <button
                        type="button"
                        className="mr-cerrar"
                        aria-label="Cerrar"
                        onClick={onCerrar}
                    >
                        ×
                    </button>
                </div>

                <p className="mr-plazo">
                    Se admite reabrir hasta 7 días después del cierre. Plazo vigente
                    hasta el {fechaLimite}.
                </p>

                <form onSubmit={enviar}>
                    <label htmlFor="mr-motivo">MOTIVO (OBLIGATORIO)</label>
                    <textarea
                        id="mr-motivo"
                        rows={3}
                        required
                        autoFocus
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                    />

                    <p className="mr-aviso">
                        Te llevaremos al formulario de registro con la categoría, la subcategoría
                        y el ambiente de este ticket ya llenos. Solo falta que escribas el asunto
                        y la descripción.
                    </p>

                    <div className="mr-botones">
                        <Boton tipo="secundario" onClick={onCerrar}>
                            Cancelar
                        </Boton>
                        <Boton tipo="primario" type="submit" disabled={!motivo.trim()}>
                            Reabrir ticket
                        </Boton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalReabrirTicket;