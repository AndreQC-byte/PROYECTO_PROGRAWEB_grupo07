import { useState } from 'react';
import Boton from '../../components/common/Boton';
import { useEncuestas } from './ContextoEncuestas';
import EstadoVacio from './EstadoVacio';
import {
  ASPECTOS,
  comentariosRecibidos,
  diaEnLima,
  filtrarPorPeriodo,
  FILTROS_PUNTAJE,
  formatearDia,
  formatearFecha,
  formatearPromedio,
  generarCsvSatisfaccion,
  hallazgosDelPeriodo,
  periodoCompleto,
  PERIODOS_RAPIDOS,
  periodoUltimosDias,
  plural,
  promediosPorTecnico,
  resumenSatisfaccion,
  tonoPuntaje,
  validarPeriodo,
} from './servicioEncuestas';

const descargarArchivo = (nombre, contenido) => {
  const url = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

// Vista 6.3: promedios de satisfacción por técnico y comentarios recibidos en un periodo
export default function SatisfaccionSupervisor() {
  const { encuestas, ahora, notificar } = useEncuestas();
  const [periodo, setPeriodo] = useState(() => periodoCompleto(encuestas, ahora));
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [borrador, setBorrador] = useState(periodo);
  const [erroresPeriodo, setErroresPeriodo] = useState({});
  const [filtroPuntaje, setFiltroPuntaje] = useState('todos');

  const enPeriodo = filtrarPorPeriodo(encuestas, periodo);
  const resumen = resumenSatisfaccion(enPeriodo);
  const filas = promediosPorTecnico(enPeriodo);
  const hallazgos = hallazgosDelPeriodo(enPeriodo);
  const comentarios = comentariosRecibidos(enPeriodo, filtroPuntaje);
  const totalComentarios = comentariosRecibidos(enPeriodo, 'todos').length;
  const hoy = diaEnLima(ahora);

  const abrirMenu = () => {
    setBorrador(periodo);
    setErroresPeriodo({});
    setMenuAbierto(!menuAbierto);
  };

  const aplicarPeriodo = (nuevo) => {
    setPeriodo(nuevo);
    setMenuAbierto(false);
  };

  const aplicarPersonalizado = (e) => {
    e.preventDefault();
    const errores = validarPeriodo(borrador);
    setErroresPeriodo(errores);
    if (Object.keys(errores).length === 0) aplicarPeriodo(borrador);
  };

  const cambiarBorrador = (campo, valor) => {
    setBorrador({ ...borrador, [campo]: valor });
    setErroresPeriodo({ ...erroresPeriodo, [campo]: '' });
  };

  const exportar = () => {
    if (filas.length === 0) {
      notificar('advertencia', 'No hay encuestas respondidas en este periodo para exportar.');
      return;
    }
    descargarArchivo(`satisfaccion_${periodo.desde}_${periodo.hasta}.csv`, generarCsvSatisfaccion(filas, periodo));
    notificar('exito', `Se exportó el reporte de satisfacción con ${plural(filas.length, 'técnico', 'técnicos')}.`);
  };

  const resumenTexto = [
    plural(resumen.respondidas, 'encuesta respondida', 'encuestas respondidas'),
    `tasa de respuesta ${resumen.tasaRespuesta} %`,
    resumen.promedioGeneral !== null && `promedio general ${formatearPromedio(resumen.promedioGeneral)} de 5`,
  ].filter(Boolean).join(' · ');

  return (
    <>
      <div className="enc-cabecera">
        <div>
          <h1 className="enc-titulo">Satisfacción por técnico y categoría</h1>
          <p className="enc-auxiliar enc-muted enc-meta">{resumenTexto}</p>
        </div>

        <div className="enc-acciones-cabecera">
          <div className="enc-periodo">
            <button type="button" className="enc-selector" aria-expanded={menuAbierto} onClick={abrirMenu}>
              Periodo: {formatearDia(periodo.desde)} – {formatearDia(periodo.hasta)} ▾
            </button>
            {menuAbierto && (
              <div className="enc-menu-desplegable" role="dialog" aria-label="Elegir periodo">
                <div className="enc-menu-rapidos">
                  {PERIODOS_RAPIDOS.map(({ dias, etiqueta }) => (
                    <button key={dias} type="button" className="enc-menu-opcion" onClick={() => aplicarPeriodo(periodoUltimosDias(dias, ahora))}>
                      {etiqueta}
                    </button>
                  ))}
                  <button type="button" className="enc-menu-opcion" onClick={() => aplicarPeriodo(periodoCompleto(encuestas, ahora))}>
                    Todo el historial
                  </button>
                </div>

                <form className="enc-menu-personalizado" onSubmit={aplicarPersonalizado} noValidate>
                  <div className="enc-fila-2col">
                    <div className="enc-campo">
                      <label htmlFor="periodo-desde">Desde</label>
                      <input
                        id="periodo-desde"
                        type="date"
                        max={hoy}
                        value={borrador.desde}
                        aria-invalid={Boolean(erroresPeriodo.desde)}
                        onChange={(e) => cambiarBorrador('desde', e.target.value)}
                      />
                      {erroresPeriodo.desde && <p className="enc-error">{erroresPeriodo.desde}</p>}
                    </div>
                    <div className="enc-campo">
                      <label htmlFor="periodo-hasta">Hasta</label>
                      <input
                        id="periodo-hasta"
                        type="date"
                        max={hoy}
                        value={borrador.hasta}
                        aria-invalid={Boolean(erroresPeriodo.hasta)}
                        onChange={(e) => cambiarBorrador('hasta', e.target.value)}
                      />
                      {erroresPeriodo.hasta && <p className="enc-error">{erroresPeriodo.hasta}</p>}
                    </div>
                  </div>
                  <div className="enc-menu-acciones">
                    <Boton tipo="secundario" onClick={() => setMenuAbierto(false)}>Cancelar</Boton>
                    <Boton type="submit">Aplicar</Boton>
                  </div>
                </form>
              </div>
            )}
          </div>
          <Boton tipo="secundario" onClick={exportar}>Exportar</Boton>
        </div>
      </div>

      <div className="enc-rejilla">
        <section>
          {filas.length === 0 ? (
            <EstadoVacio
              titulo="No hay encuestas respondidas en este periodo"
              texto="Amplía el periodo para ver los promedios de satisfacción de los técnicos."
            >
              <button type="button" className="btn-primario enc-enlace-boton" onClick={() => aplicarPeriodo(periodoCompleto(encuestas, ahora))}>
                Ver todo el historial
              </button>
            </EstadoVacio>
          ) : (
            <div className="enc-tabla-marco">
              <table className="enc-tabla">
                <thead>
                  <tr>
                    <th>Técnico</th>
                    <th>Categoría principal</th>
                    <th className="enc-numero">General</th>
                    {ASPECTOS.map(({ campo, corto }) => <th key={campo} className="enc-numero">{corto}</th>)}
                    <th className="enc-numero">Encuestas</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((fila) => (
                    <tr key={fila.tecnicoId}>
                      <td><strong>{fila.tecnico}</strong></td>
                      <td className="enc-muted">{fila.categoriaPrincipal}</td>
                      <td className="enc-numero"><strong className="enc-puntaje">{formatearPromedio(fila.general)}</strong></td>
                      {ASPECTOS.map(({ campo }) => (
                        <td key={campo} className="enc-numero">{formatearPromedio(fila.aspectos[campo])}</td>
                      ))}
                      <td className="enc-numero"><strong>{fila.encuestas}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {hallazgos && (
                <p className="enc-hallazgo">
                  {hallazgos.categoria && `${hallazgos.categoria.nombre} es la categoría con menor promedio (${formatearPromedio(hallazgos.categoria.promedio)}). `}
                  {hallazgos.aspecto && `${hallazgos.aspecto.nombre} es el aspecto peor calificado del área (${formatearPromedio(hallazgos.aspecto.promedio)}).`}
                </p>
              )}
            </div>
          )}
        </section>

        <section className="enc-tarjeta">
          <div className="enc-tarjeta-cabecera">
            <h3 className="enc-subtitulo">Comentarios recibidos</h3>
            <select
              className="enc-select-compacto"
              aria-label="Filtrar comentarios por puntaje"
              value={filtroPuntaje}
              onChange={(e) => setFiltroPuntaje(e.target.value)}
            >
              {FILTROS_PUNTAJE.map(({ valor, etiqueta }) => <option key={valor} value={valor}>{etiqueta}</option>)}
            </select>
          </div>

          {comentarios.length === 0 ? (
            <div className="enc-vacio-compacto">
              <p>{totalComentarios === 0 ? 'Todavía no hay comentarios en este periodo.' : 'No hay comentarios con este puntaje.'}</p>
              {totalComentarios > 0 && (
                <button type="button" className="enc-terciario" onClick={() => setFiltroPuntaje('todos')}>Mostrar todos</button>
              )}
            </div>
          ) : (
            <ul className="enc-comentarios">
              {comentarios.map((c) => (
                <li key={c.id} className="enc-comentario">
                  <p className="enc-auxiliar enc-muted">
                    <strong className={`enc-tono-${tonoPuntaje(c.puntaje)}`}>{c.puntaje} / 5</strong>
                    {' · '}{c.categoria} · {c.tecnico} · {formatearFecha(c.fecha)}
                  </p>
                  <p className="enc-auxiliar">«{c.comentario}»</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
