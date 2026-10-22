import { useState } from 'react';
import Boton from '../../components/common/Boton';
import { useAuth } from '../../context/AuthContext';
import CampoFormulario from './CampoFormulario';
import {
  UNIDADES,
  actualizarPerfil,
  cambiarContrasena,
  obtenerAmbientesHabituales,
  resumenCuenta,
} from './servicioAuth';
import {
  validarConfirmacion,
  validarContrasena,
  validarNombre,
  validarTelefono,
} from './validaciones';

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

export default function MiCuenta() {
  const { usuario } = useAuth();

  return (
    <>
      <h1>Mi cuenta</h1>
      <p className="auth-aux">Tus datos se usan para contactarte durante la atención de un ticket.</p>

      <div className="auth-cuenta-cols">
        <section className="auth-caja auth-caja--ancha">
          <h2>Datos personales</h2>
          <DatosPersonales />
          <hr className="auth-sep" />
          <h2>Cambiar contraseña</h2>
          <CambiarContrasena />
        </section>

        <ResumenCuenta usuario={usuario} />
      </div>
    </>
  );
}

const desdeUsuario = (u) => ({
  nombres: u.nombres || '',
  apellidos: u.apellidos || '',
  telefono: (u.telefono || '').replace(/\s/g, ''),
  unidad: u.unidad || '',
  ambienteHabitual: u.ambienteHabitual || '',
});

function DatosPersonales() {
  const { usuario, refrescarUsuario } = useAuth();
  const guardado = desdeUsuario(usuario);

  const [valores, setValores] = useState(guardado);
  const [tocados, setTocados] = useState({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState(null);

  const hayCambios = Object.keys(guardado).some((campo) => valores[campo] !== guardado[campo]);

  const errores = {
    nombres: validarNombre(valores.nombres, 'Escribe tus nombres'),
    apellidos: validarNombre(valores.apellidos, 'Escribe tus apellidos'),
    telefono: validarTelefono(valores.telefono),
  };
  const errorVisible = (campo) => (tocados[campo] || intentoEnvio ? errores[campo] : '');
  const claseInput = (campo) => `auth-input ${errorVisible(campo) ? 'auth-input--error' : ''}`;

  // La unidad actual siempre aparece en la lista, aunque no sea una de las predefinidas
  const unidades = [...new Set([guardado.unidad, ...UNIDADES].filter(Boolean))];
  const ambientes = obtenerAmbientesHabituales();

  const cambiar = (campo) => (evento) => {
    const valor = evento.target.value;
    setAviso(null);
    setValores((previos) => ({ ...previos, [campo]: valor }));
  };
  const marcarTocado = (campo) => () => {
    setTocados((previos) => ({ ...previos, [campo]: true }));
  };

  const descartar = () => {
    setValores(guardado);
    setTocados({});
    setIntentoEnvio(false);
    setAviso(null);
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    setAviso(null);
    setIntentoEnvio(true);
    if (Object.values(errores).some(Boolean)) return;

    setCargando(true);
    await esperar(500);
    const resultado = actualizarPerfil(usuario.id, valores);
    setCargando(false);

    if (!resultado.ok) {
      setAviso({ tipo: 'error', texto: resultado.mensaje });
      return;
    }
    refrescarUsuario();
    setAviso({ tipo: 'exito', texto: 'Datos actualizados correctamente.' });
  };

  return (
    <form className="auth-form" onSubmit={guardar} noValidate>
      {aviso && (
        <div className={`auth-alerta auth-alerta--${aviso.tipo}`} role="status">
          {aviso.texto}
        </div>
      )}

      <div className="auth-rejilla2">
        <CampoFormulario id="cu-nombres" etiqueta="Nombres" error={errorVisible('nombres')}>
          <input
            id="cu-nombres"
            className={claseInput('nombres')}
            value={valores.nombres}
            onChange={cambiar('nombres')}
            onBlur={marcarTocado('nombres')}
            disabled={cargando}
          />
        </CampoFormulario>

        <CampoFormulario id="cu-apellidos" etiqueta="Apellidos" error={errorVisible('apellidos')}>
          <input
            id="cu-apellidos"
            className={claseInput('apellidos')}
            value={valores.apellidos}
            onChange={cambiar('apellidos')}
            onBlur={marcarTocado('apellidos')}
            disabled={cargando}
          />
        </CampoFormulario>

        <CampoFormulario id="cu-correo" etiqueta="Correo institucional" ayuda="No editable.">
          <input id="cu-correo" className="auth-input" value={usuario.correo} readOnly />
        </CampoFormulario>

        <CampoFormulario id="cu-telefono" etiqueta="Teléfono" error={errorVisible('telefono')}>
          <input
            id="cu-telefono"
            className={claseInput('telefono')}
            type="tel"
            inputMode="numeric"
            value={valores.telefono}
            onChange={cambiar('telefono')}
            onBlur={marcarTocado('telefono')}
            disabled={cargando}
          />
        </CampoFormulario>

        <CampoFormulario id="cu-unidad" etiqueta="Unidad o carrera">
          <select
            id="cu-unidad"
            className="auth-input"
            value={valores.unidad}
            onChange={cambiar('unidad')}
            disabled={cargando}
          >
            {unidades.map((unidad) => (
              <option key={unidad} value={unidad}>{unidad}</option>
            ))}
          </select>
        </CampoFormulario>

        <CampoFormulario id="cu-ambiente" etiqueta="Ambiente habitual">
          <select
            id="cu-ambiente"
            className="auth-input"
            value={valores.ambienteHabitual}
            onChange={cambiar('ambienteHabitual')}
            disabled={cargando}
          >
            <option value="">Sin ambiente habitual</option>
            {ambientes.map((codigo) => (
              <option key={codigo} value={codigo}>{codigo}</option>
            ))}
          </select>
        </CampoFormulario>
      </div>

      <div className="auth-acciones">
        <Boton type="submit" disabled={cargando || !hayCambios}>
          {cargando ? 'Guardando...' : 'Guardar cambios'}
        </Boton>
        <Boton tipo="terciario" onClick={descartar} disabled={cargando || !hayCambios}>
          Descartar
        </Boton>
      </div>
    </form>
  );
}

const VACIO = { actual: '', nueva: '', confirmar: '' };

function CambiarContrasena() {
  const { usuario } = useAuth();
  const [valores, setValores] = useState(VACIO);
  const [tocados, setTocados] = useState({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState(null);

  const errores = {
    actual: valores.actual ? '' : 'Escribe tu contraseña actual',
    nueva: validarContrasena(valores.nueva),
    confirmar: validarConfirmacion(valores.nueva, valores.confirmar),
  };
  const errorVisible = (campo) => (tocados[campo] || intentoEnvio ? errores[campo] : '');
  const claseInput = (campo) => `auth-input ${errorVisible(campo) ? 'auth-input--error' : ''}`;

  const cambiar = (campo) => (evento) => {
    const valor = evento.target.value;
    setAviso(null);
    setValores((previos) => ({ ...previos, [campo]: valor }));
  };
  const marcarTocado = (campo) => () => {
    setTocados((previos) => ({ ...previos, [campo]: true }));
  };

  const actualizar = async (evento) => {
    evento.preventDefault();
    setAviso(null);
    setIntentoEnvio(true);
    if (Object.values(errores).some(Boolean)) return;

    setCargando(true);
    await esperar(500);
    const resultado = cambiarContrasena(usuario.id, valores.actual, valores.nueva);
    setCargando(false);

    if (!resultado.ok) {
      setAviso({ tipo: 'error', texto: resultado.mensaje });
      return;
    }
    setValores(VACIO);
    setTocados({});
    setIntentoEnvio(false);
    setAviso({ tipo: 'exito', texto: 'Contraseña actualizada correctamente.' });
  };

  return (
    <form className="auth-form" onSubmit={actualizar} noValidate>
      {aviso && (
        <div className={`auth-alerta auth-alerta--${aviso.tipo}`} role="status">
          {aviso.texto}
        </div>
      )}

      <div className="auth-rejilla3">
        <CampoFormulario id="cu-actual" etiqueta="Actual" error={errorVisible('actual')}>
          <input
            id="cu-actual"
            className={claseInput('actual')}
            type="password"
            value={valores.actual}
            onChange={cambiar('actual')}
            onBlur={marcarTocado('actual')}
            autoComplete="current-password"
            disabled={cargando}
          />
        </CampoFormulario>

        <CampoFormulario
          id="cu-nueva"
          etiqueta="Nueva"
          error={errorVisible('nueva')}
          ayuda="Mínimo 8 caracteres, con una mayúscula y un número."
        >
          <input
            id="cu-nueva"
            className={claseInput('nueva')}
            type="password"
            value={valores.nueva}
            onChange={cambiar('nueva')}
            onBlur={marcarTocado('nueva')}
            autoComplete="new-password"
            disabled={cargando}
          />
        </CampoFormulario>

        <CampoFormulario id="cu-confirmar" etiqueta="Confirmar" error={errorVisible('confirmar')}>
          <input
            id="cu-confirmar"
            className={claseInput('confirmar')}
            type="password"
            value={valores.confirmar}
            onChange={cambiar('confirmar')}
            onBlur={marcarTocado('confirmar')}
            autoComplete="new-password"
            disabled={cargando}
          />
        </CampoFormulario>
      </div>

      <div className="auth-acciones">
        <Boton type="submit" disabled={cargando}>
          {cargando ? 'Actualizando...' : 'Actualizar contraseña'}
        </Boton>
      </div>
    </form>
  );
}

const formatearFecha = (fecha) => {
  if (!fecha) return '—';
  const [anio, mes, dia] = String(fecha).slice(0, 10).split('-');
  return dia && mes && anio ? `${dia}/${mes}/${anio}` : '—';
};

function ResumenCuenta({ usuario }) {
  const iniciales = `${usuario.nombres?.[0] ?? ''}${usuario.apellidos?.[0] ?? ''}`.toUpperCase();
  const resumen = usuario.rol === 'Usuario' ? resumenCuenta(usuario.id) : null;

  return (
    <aside className="auth-pila">
      <div className="auth-caja auth-caja--chica">
        <div className="auth-resumen-cab">
          <span className="auth-avatar">{iniciales}</span>
          <div>
            <strong>{usuario.nombres} {usuario.apellidos}</strong>
            <p className="auth-aux">
              {usuario.rol}{usuario.vinculo ? ` · ${usuario.vinculo}` : ''}
            </p>
          </div>
        </div>

        {resumen && (
          <>
            <div className="auth-kv">
              <span>Tickets reportados</span>
              <b>{resumen.reportados}</b>
            </div>
            <div className="auth-kv">
              <span>Abiertos ahora</span>
              <b>{resumen.abiertos}</b>
            </div>
          </>
        )}
        <div className="auth-kv">
          <span>Cuenta creada</span>
          <b>{formatearFecha(usuario.fechaCreacion)}</b>
        </div>
      </div>
    </aside>
  );
}