import { fechaActual, obtenerEncuestasSemilla, resumenUsuario } from '../encuestas/servicioEncuestas';
import db from '../../data/db.json';

const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 15;
const CLAVE_USUARIOS = 'mesaAyuda.usuarios';

export const UNIDADES = [
  'Administración',
  'Arquitectura',
  'Comunicación',
  'Contabilidad',
  'Derecho',
  'Ingeniería de Sistemas',
  'Ingeniería Industrial',
  'Psicología',
];
export const VINCULOS = ['Alumno/a', 'Docente', 'Personal administrativo'];

// ---------- Datos de usuarios ----------
// Las cuentas nuevas y los datos editados se guardan en localStorage para que sobrevivan al recargar. 
const normalizar = (u) => ({
  ...u,
  intentosFallidos: u.intentosFallidos ?? 0,
  bloqueadoHasta: u.bloqueadoHasta ?? null,
});

const semilla = db.usuarios.map(normalizar);

const leerGuardados = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_USUARIOS)) || {};
  } catch {
    return {};
  }
};

const guardados = leerGuardados();
const usuarios = semilla.map((u) => ({ ...(guardados[u.id] ?? u) }));
Object.values(guardados).forEach((u) => {
  if (!semilla.some((s) => s.id === u.id)) usuarios.push({ ...u });
});

// Guarda solo los usuarios que son nuevos o que cambiaron respecto a db.json
const guardarCambios = () => {
  try {
    const diferentes = {};
    usuarios.forEach((u) => {
      const original = semilla.find((s) => s.id === u.id);
      if (!original || JSON.stringify(original) !== JSON.stringify(u)) {
        diferentes[u.id] = u;
      }
    });
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(diferentes));
  } catch {
  }
};

const formatearHora = (fecha) =>
  fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

// Devuelve el usuario sin la contraseña, para no compartirla con el resto de la app
const sinContrasena = ({ contrasena, ...resto }) => resto;

// ---------- Mensaje de bienvenida ----------
const ESTADOS_EN_CURSO = ['Abierto', 'En atención', 'En espera', 'Reabierto'];

const plural = (cantidad, singular, plurales) =>
  `${cantidad} ${cantidad === 1 ? singular : plurales}`;

// Texto que se muestra al iniciar sesión, según el rol (solo lee db.json)
const crearMensajeBienvenida = (usuario) => {
  const saludo = `Te damos la bienvenida, ${usuario.nombres.split(' ')[0]}.`;
  const enCurso = db.tickets.filter((t) => ESTADOS_EN_CURSO.includes(t.estado));

  if (usuario.rol === 'Usuario') {
    const abiertos = enCurso.filter((t) => t.usuarioId === usuario.id).length;
    const pendientes = resumenUsuario(
      obtenerEncuestasSemilla(),
      usuario.id,
      fechaActual()
    ).pendientes.length;

    if (abiertos === 0 && pendientes === 0) {
      return `${saludo} No tienes tickets abiertos ni encuestas pendientes.`;
    }
    return `${saludo} Tienes ${plural(abiertos, 'ticket abierto', 'tickets abiertos')} y ${plural(pendientes, 'encuesta pendiente', 'encuestas pendientes')}.`;
  }

  if (usuario.rol === 'Técnico') {
    const asignados = enCurso.filter((t) => t.tecnicoAsignadoId === usuario.id).length;
    return `${saludo} Tienes ${plural(asignados, 'ticket asignado', 'tickets asignados')} en curso.`;
  }

  const sinAsignar = enCurso.filter((t) => !t.tecnicoAsignadoId).length;
  return `${saludo} Hay ${plural(sinAsignar, 'ticket', 'tickets')} sin asignar en la cola.`;
};

// ---------- Inicio de sesión ----------
export const iniciarSesion = (correo, contrasena) => {
  const usuario = usuarios.find(
    (u) => u.correo.toLowerCase() === correo.trim().toLowerCase()
  );

  if (!usuario) {
    return {
      ok: false,
      tipo: 'credenciales',
      mensaje: 'Correo o contraseña incorrectos.',
    };
  }

  // ¿La cuenta está bloqueada todavía?
  if (usuario.bloqueadoHasta) {
    const hasta = new Date(usuario.bloqueadoHasta);
    if (hasta > new Date()) {
      return {
        ok: false,
        tipo: 'bloqueada',
        mensaje: `Cuenta bloqueada por ${MINUTOS_BLOQUEO} minutos tras cinco intentos fallidos. Podrás ingresar a las ${formatearHora(hasta)} o restablecer tu contraseña ahora.`,
      };
    }
    // El bloqueo ya venció: se limpia
    usuario.bloqueadoHasta = null;
    usuario.intentosFallidos = 0;
  }

  // ¿La contraseña es incorrecta?
  if (usuario.contrasena !== contrasena) {
    usuario.intentosFallidos += 1;

    if (usuario.intentosFallidos >= MAX_INTENTOS) {
      const hasta = new Date(Date.now() + MINUTOS_BLOQUEO * 60 * 1000);
      usuario.bloqueadoHasta = hasta.toISOString();
      usuario.intentosFallidos = 0;
      return {
        ok: false,
        tipo: 'bloqueada',
        mensaje: `Cuenta bloqueada por ${MINUTOS_BLOQUEO} minutos tras cinco intentos fallidos. Podrás ingresar a las ${formatearHora(hasta)} o restablecer tu contraseña ahora.`,
      };
    }

    const restantes = MAX_INTENTOS - usuario.intentosFallidos;
    return {
      ok: false,
      tipo: 'credenciales',
      mensaje: `Correo o contraseña incorrectos. Te quedan ${restantes} intentos antes del bloqueo temporal.`,
    };
  }

  // ¿La cuenta está activa?
  if (usuario.estado !== 'Activo') {
    return {
      ok: false,
      tipo: 'inactiva',
      mensaje: 'Tu cuenta no está activa. Escribe a soporte para más información.',
    };
  }

  // Todo bien: se reinician los intentos y se devuelve el usuario
  usuario.intentosFallidos = 0;
  return {
    ok: true,
    usuario: sinContrasena(usuario),
    mensajeBienvenida: crearMensajeBienvenida(usuario),
  };
};

// Devuelve un usuario activo por su id (sin contraseña). Sirve para restaurar la sesión guardada al recargar la página.
export const obtenerUsuarioPorId = (id) => {
  const usuario = usuarios.find((u) => u.id === id);
  return usuario && usuario.estado === 'Activo' ? sinContrasena(usuario) : null;
};

// ---------- Registro ----------
export const correoDisponible = (correo) =>
  !usuarios.some((u) => u.correo.toLowerCase() === correo.trim().toLowerCase());

export const registrarUsuario = (datos) => {
  if (!correoDisponible(datos.correo)) {
    return { ok: false, tipo: 'correo', mensaje: 'Este correo ya está registrado.' };
  }

  const nuevo = {
    id: siguienteIdUsuario(),
    nombres: datos.nombres.trim(),
    apellidos: datos.apellidos.trim(),
    correo: datos.correo.trim().toLowerCase(),
    rol: 'Usuario',
    telefono: datos.telefono.trim(),
    unidad: datos.unidad,
    vinculo: datos.vinculo,
    estado: 'Activo',
    contrasena: datos.contrasena,
    intentosFallidos: 0,
    bloqueadoHasta: null,
    fechaCreacion: new Date().toISOString(),
  };

  usuarios.push(nuevo);
  guardarCambios();
  return { ok: true, usuario: sinContrasena(nuevo) };
};

// ---------- Invitaciones (técnicos y supervisores) ----------
export const ESPECIALIDADES_MAX = 3;
const CLAVE_INVITACIONES = 'mesaAyuda.invitaciones';

const siguienteIdUsuario = () => {
  const ultimoNumero = Math.max(
    0,
    ...usuarios.map((u) => parseInt(u.id.replace('USR-', ''), 10) || 0)
  );
  return `USR-${String(ultimoNumero + 1).padStart(3, '0')}`;
};

// Solo se guarda el estado de cada invitación
const leerEstadosInvitaciones = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_INVITACIONES)) || {};
  } catch {
    return {};
  }
};

const estadosGuardados = leerEstadosInvitaciones();
const invitaciones = (db.invitaciones || []).map((i) => ({
  ...i,
  estado: estadosGuardados[i.id] ?? i.estado,
}));

const guardarInvitaciones = () => {
  try {
    const estados = Object.fromEntries(invitaciones.map((i) => [i.id, i.estado]));
    localStorage.setItem(CLAVE_INVITACIONES, JSON.stringify(estados));
  } catch {
  }
};

export const obtenerCategoriasActivas = () =>
  db.categorias.filter((c) => c.estado === 'Activa').map(({ id, nombre }) => ({ id, nombre }));

export const obtenerInvitacion = (id) => {
  const invitacion = invitaciones.find((i) => i.id === id);
  if (!invitacion) return { situacion: 'inexistente' };

  const invitador = usuarios.find((u) => u.id === invitacion.invitadoPorId);
  const datos = {
    ...invitacion,
    invitadoPor: invitador
      ? `${invitador.nombres} ${invitador.apellidos}`
      : 'El área de Infraestructura',
  };

  if (invitacion.estado !== 'Pendiente') return { situacion: 'respondida', invitacion: datos };
  if (new Date(invitacion.fechaExpiracion) < new Date()) {
    return { situacion: 'vencida', invitacion: datos };
  }
  return { situacion: 'valida', invitacion: datos };
};

export const aceptarInvitacion = (id, datos) => {
  const { situacion, invitacion } = obtenerInvitacion(id);
  if (situacion !== 'valida') {
    return { ok: false, mensaje: 'Esta invitación ya no está disponible.' };
  }
  if (!correoDisponible(invitacion.correo)) {
    return { ok: false, mensaje: 'Ya existe una cuenta con el correo de esta invitación.' };
  }

  const nuevo = {
    id: siguienteIdUsuario(),
    nombres: invitacion.nombres,
    apellidos: invitacion.apellidos,
    correo: invitacion.correo.toLowerCase(),
    rol: invitacion.rol,
    telefono: datos.telefono.trim(),
    ...(invitacion.rol === 'Técnico' ? { especialidades: datos.especialidades } : {}),
    estado: 'Activo',
    contrasena: datos.contrasena,
    intentosFallidos: 0,
    bloqueadoHasta: null,
    fechaCreacion: new Date().toISOString(),
  };

  usuarios.push(nuevo);
  invitaciones.find((i) => i.id === id).estado = 'Aceptada';
  guardarCambios();
  guardarInvitaciones();
  return { ok: true, usuario: sinContrasena(nuevo) };
};

export const rechazarInvitacion = (id) => {
  const { situacion } = obtenerInvitacion(id);
  if (situacion !== 'valida') {
    return { ok: false, mensaje: 'Esta invitación ya no está disponible.' };
  }
  invitaciones.find((i) => i.id === id).estado = 'Rechazada';
  guardarInvitaciones();
  return { ok: true };
};