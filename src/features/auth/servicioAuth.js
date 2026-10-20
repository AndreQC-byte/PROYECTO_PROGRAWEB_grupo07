import db from '../../data/db.json';

const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 15;

const usuarios = db.usuarios.map((u) => ({
  ...u,
  intentosFallidos: u.intentosFallidos ?? 0,
  bloqueadoHasta: u.bloqueadoHasta ?? null,
}));

const formatearHora = (fecha) =>
  fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

// Devuelve el usuario sin la contraseña, para no compartirla con el resto de la app
const sinContrasena = ({ contrasena, ...resto }) => resto;

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

  // 1. ¿La cuenta está bloqueada todavía?
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

  // 2. ¿La contraseña es incorrecta?
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

  // 3. ¿La cuenta está activa?
  if (usuario.estado !== 'Activo') {
    return {
      ok: false,
      tipo: 'inactiva',
      mensaje: 'Tu cuenta no está activa. Escribe a soporte para más información.',
    };
  }

  // 4. Todo bien: se reinician los intentos y se devuelve el usuario
  usuario.intentosFallidos = 0;
  return { ok: true, usuario: sinContrasena(usuario) };

};

// Devuelve un usuario activo por su id (sin contraseña).
// Sirve para restaurar la sesión guardada al recargar la página.
export const obtenerUsuarioPorId = (id) => {
  const usuario = usuarios.find((u) => u.id === id);
  return usuario && usuario.estado === 'Activo' ? sinContrasena(usuario) : null;
};