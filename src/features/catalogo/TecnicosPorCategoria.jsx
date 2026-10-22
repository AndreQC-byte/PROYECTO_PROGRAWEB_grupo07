import React, { useState, useMemo } from 'react';
import * as servicioCatalogo from './servicioCatalogo';
import db from '../../data/db.json';

const TecnicosPorCategoria = () => {
  const [tecnicos, setTecnicos] = useState(() => servicioCatalogo.obtenerTecnicos());
  const [categorias] = useState(() =>
    servicioCatalogo.obtenerCategorias().filter((c) => c.estado === 'Activa')
  );

  const [notificacion, setNotificacion] = useState(null);
  const [modalInvitar, setModalInvitar] = useState(false);

  // Formulario de invitación de nuevo técnico
  const [invNombres, setInvNombres] = useState('');
  const [invApellidos, setInvApellidos] = useState('');
  const [invCorreo, setInvCorreo] = useState('');
  const [invEspecialidades, setInvEspecialidades] = useState([]);
  const [errorInvitacion, setErrorInvitacion] = useState('');

  // Tickets para calcular carga actual
  const tickets = db.tickets || [];

  const calcularCarga = (tecnicoId) => {
    return tickets.filter(
      (t) =>
        t.tecnicoAsignadoId === tecnicoId &&
        ['Abierto', 'En atención', 'En espera'].includes(t.estado)
    ).length;
  };

  const toggleCategoria = (tecnicoId, categoriaId) => {
    setTecnicos((prev) =>
      prev.map((tec) => {
        if (tec.id === tecnicoId) {
          const actual = tec.especialidades || [];
          const existe = actual.includes(categoriaId);
          const nuevas = existe
            ? actual.filter((id) => id !== categoriaId)
            : [...actual, categoriaId];
          return { ...tec, especialidades: nuevas };
        }
        return tec;
      })
    );
  };

  const guardarMatriz = () => {
    servicioCatalogo.actualizarMatrizTecnicos(tecnicos);
    setNotificacion({
      tipo: 'exito',
      mensaje: 'Matriz de técnicos actualizada y guardada correctamente.',
    });
  };

  // Cálculo de alerta de cobertura (Mockup 2.4: Climatización tiene solo dos técnicos...)
  const alertaCobertura = useMemo(() => {
    for (const cat of categorias) {
      const tecsHabilitados = tecnicos.filter((tec) =>
        (tec.especialidades || []).includes(cat.id)
      ).length;
      const ticketsAbiertos = servicioCatalogo.obtenerTicketsAbiertosPorCategoria(cat.id);

      if (tecsHabilitados <= 2 && ticketsAbiertos >= 3) {
        return `${cat.nombre} tiene solo ${tecsHabilitados} técnicos habilitados y ${ticketsAbiertos} tickets abiertos. Considera habilitar un tercero.`;
      }
    }
    return null;
  }, [categorias, tecnicos]);

  const procesarInvitacion = (e) => {
    e.preventDefault();
    if (!invNombres.trim() || !invApellidos.trim() || !invCorreo.trim()) {
      setErrorInvitacion('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (!invCorreo.includes('@ulima.edu.pe') && !invCorreo.includes('@aloe.ulima.edu.pe')) {
      setErrorInvitacion('El correo debe pertenecer al dominio institucional (@ulima.edu.pe).');
      return;
    }

    servicioCatalogo.invitarTecnico({
      nombres: invNombres,
      apellidos: invApellidos,
      correo: invCorreo,
      especialidades: invEspecialidades,
    });

    setTecnicos(servicioCatalogo.obtenerTecnicos());
    setModalInvitar(false);
    setInvNombres('');
    setInvApellidos('');
    setInvCorreo('');
    setInvEspecialidades([]);
    setErrorInvitacion('');
    setNotificacion({
      tipo: 'exito',
      mensaje: `Invitación enviada correctamente a ${invCorreo}.`,
    });
  };

  return (
    <div className="catalogo-contenedor">
      {/* Banner de notificación */}
      {notificacion && (
        <div className={`notificacion-banner notificacion-${notificacion.tipo}`}>
          <span>{notificacion.mensaje}</span>
          <button
            type="button"
            className="btn-cerrar-modal"
            style={{ fontSize: '16px' }}
            onClick={() => setNotificacion(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Cabecera (Mockup 2.4) */}
      <div className="catalogo-cabecera">
        <div className="catalogo-titulo-seccion">
          <h1>Técnicos por categoría</h1>
          <p className="catalogo-subtitulo">
            Marca las categorías que cada técnico puede atender. La cola solo ofrece técnicos habilitados al asignar.
          </p>
        </div>
        <div className="catalogo-acciones-cabecera">
          <button
            type="button"
            className="btn-secundario"
            onClick={() => setModalInvitar(true)}
          >
            Invitar técnico
          </button>
          <button type="button" className="btn-primario" onClick={guardarMatriz}>
            Guardar matriz
          </button>
        </div>
      </div>

      {/* Tabla Matriz (Mockup 2.4) */}
      <table className="catalogo-matriz-tabla">
        <thead>
          <tr>
            <th style={{ width: '22%' }}>TÉCNICO</th>
            <th style={{ width: '24%' }}>ESPECIALIDAD DECLARADA</th>
            <th style={{ width: '12%', textAlign: 'center' }}>CARGA ACTUAL</th>
            {categorias.map((cat) => (
              <th key={cat.id}>
                {cat.nombre.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tecnicos.map((tec) => {
            const carga = calcularCarga(tec.id);
            // Nombres legibles de especialidades
            const especialidadesNombres = (tec.especialidades || [])
              .map((id) => categorias.find((c) => c.id === id)?.nombre)
              .filter(Boolean)
              .join(', ');

            return (
              <tr key={tec.id} className="catalogo-fila-hijo">
                <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                  {tec.nombres} {tec.apellidos}
                </td>
                <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  {especialidadesNombres || 'Ninguna asignada'}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>
                  <span className="badge-conteo">{carga} tickets</span>
                </td>
                {categorias.map((cat) => {
                  const habilitado = (tec.especialidades || []).includes(cat.id);
                  return (
                    <td key={cat.id} className="catalogo-matriz-check-celda">
                      <input
                        type="checkbox"
                        checked={habilitado}
                        onChange={() => toggleCategoria(tec.id, cat.id)}
                        title={`${habilitado ? 'Deshabilitar' : 'Habilitar'} a ${tec.nombres} para ${cat.nombre}`}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Banner / Alerta operativa al pie (Mockup 2.4) */}
      <div className="catalogo-matriz-nota-banner">
        <div>
          <strong>Nota de cobertura: </strong>
          <span>
            {alertaCobertura || 'La cobertura de técnicos es adecuada en todas las categorías activas.'}
          </span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          Carga actual = tickets asignados en estado abierto, en atención o en espera.
        </div>
      </div>

      {/* Modal Invitar Técnico */}
      {modalInvitar && (
        <div className="modal-overlay">
          <div className="modal-contenido modal">
            <div className="modal-cabecera">
              <h3>Invitar técnico</h3>
              <button
                type="button"
                className="btn-cerrar-modal"
                onClick={() => setModalInvitar(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={procesarInvitacion}>
              <div className="modal-cuerpo">
                {errorInvitacion && (
                  <div className="notificacion-banner notificacion-error" style={{ marginBottom: '12px' }}>
                    <span>{errorInvitacion}</span>
                  </div>
                )}

                <div className="catalogo-form-grupo">
                  <label>NOMBRES</label>
                  <input
                    type="text"
                    className="catalogo-form-input"
                    placeholder="Ej. Roberto Carlos"
                    value={invNombres}
                    onChange={(e) => setInvNombres(e.target.value)}
                    required
                  />
                </div>

                <div className="catalogo-form-grupo">
                  <label>APELLIDOS</label>
                  <input
                    type="text"
                    className="catalogo-form-input"
                    placeholder="Ej. Gómez Valdivia"
                    value={invApellidos}
                    onChange={(e) => setInvApellidos(e.target.value)}
                    required
                  />
                </div>

                <div className="catalogo-form-grupo">
                  <label>CORREO INSTITUCIONAL</label>
                  <input
                    type="email"
                    className="catalogo-form-input"
                    placeholder="usuario@ulima.edu.pe"
                    value={invCorreo}
                    onChange={(e) => setInvCorreo(e.target.value)}
                    required
                  />
                </div>

                <div className="catalogo-form-grupo">
                  <label>ESPECIALIDADES INICIALES (CATEGORÍAS)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                    {categorias.map((cat) => (
                      <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <input
                          type="checkbox"
                          checked={invEspecialidades.includes(cat.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setInvEspecialidades([...invEspecialidades, cat.id]);
                            } else {
                              setInvEspecialidades(invEspecialidades.filter((id) => id !== cat.id));
                            }
                          }}
                        />
                        <span>{cat.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-acciones">
                <button
                  type="button"
                  className="btn-secundario"
                  onClick={() => setModalInvitar(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primario">
                  Enviar invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TecnicosPorCategoria;
