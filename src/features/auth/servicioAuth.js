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
  return { ok: true, usuario: sinContrasena(usuario) };
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

  const ultimoNumero = Math.max(
    0,
    ...usuarios.map((u) => parseInt(u.id.replace('USR-', ''), 10) || 0)
  );

  const nuevo = {
    id: `USR-${String(ultimoNumero + 1).padStart(3, '0')}`,
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