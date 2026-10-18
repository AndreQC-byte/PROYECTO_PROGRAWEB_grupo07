import React, { useState } from 'react';
import './Bitacora.css';

const FILTROS = ['Todas', 'Comentarios públicos', 'Notas internas'];

// Bitácora de un ticket: lista de entradas con comentarios públicos y notas internas.
// Recibe las entradas ya preparadas: { id, autor: { nombre, rol, iniciales }, fecha, tipo, mensaje }.
// Todo lo que se pase como "children" se muestra debajo de la lista (por ejemplo, un formulario de nueva entrada).
const Bitacora = ({ entradas, conFiltro = false, children }) => {
  const [filtro, setFiltro] = useState('Todas');

  const visibles = entradas.filter((e) => {
    if (filtro === 'Comentarios públicos') return e.tipo === 'Comentario Público';
    if (filtro === 'Notas internas') return e.tipo === 'Nota Interna';
    return true;
  });

  return (
    <section className="bitacora">
      <div className="bitacora-cabecera">
        <h3>Bitácora · {entradas.length} {entradas.length === 1 ? 'entrada' : 'entradas'}</h3>
        {conFiltro && (
          <label className="bitacora-filtro">
            Mostrar:
            <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
              {FILTROS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </label>
        )}
      </div>

      <div className="bitacora-lista">
        {visibles.length === 0 && (
          <p className="bitacora-vacio">
            {entradas.length === 0 ? 'Todavía no hay entradas en la bitácora.' : 'No hay entradas con este filtro.'}
          </p>
        )}
        {visibles.map((e) => {
          const interna = e.tipo === 'Nota Interna';
          return (
            <article key={e.id} className={`bitacora-entrada ${interna ? 'bitacora-entrada-interna' : ''}`}>
              <span className={`bitacora-avatar bitacora-avatar-${e.autor.rol.toLowerCase().replace('é', 'e')}`}>{e.autor.iniciales}</span>
              <div className="bitacora-contenido">
                <div className="bitacora-encabezado">
                  <span>
                    <strong>{e.autor.nombre}</strong>
                    <span className="bitacora-meta"> {e.autor.rol} · {e.fecha}</span>
                  </span>
                  <span className={interna ? 'bitacora-tipo-interna' : 'bitacora-tipo-publica'}>
                    {interna ? 'NOTA INTERNA · NO VISIBLE PARA EL USUARIO' : 'COMENTARIO PÚBLICO'}
                  </span>
                </div>
                <p>{e.mensaje}</p>
              </div>
            </article>
          );
        })}
      </div>

      {children}
    </section>
  );
};

export default Bitacora;
