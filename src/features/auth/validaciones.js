// Validaciones de formularios de la HU-1. Cada función devuelve el mensaje de error, o un texto vacío si el valor es correcto.

const REGEX_CORREO = /^[^\s@]+@(aloe\.)?ulima\.edu\.pe$/i;

export const validarNombre = (valor, mensajeVacio) => {
  const texto = valor.trim();
  if (!texto) return mensajeVacio;
  if (texto.length < 2) return 'Escribe al menos 2 caracteres';
  if (!/^[\p{L}\s'.-]+$/u.test(texto)) return 'Usa solo letras';
  return '';
};

export const validarCorreoInstitucional = (valor) => {
  const texto = valor.trim();
  if (!texto) return 'El correo es obligatorio';
  if (!REGEX_CORREO.test(texto)) {
    return 'Usa tu correo institucional (@aloe.ulima.edu.pe o @ulima.edu.pe)';
  }
  return '';
};

export const validarTelefono = (valor) => {
  const digitos = valor.replace(/\s/g, '');
  if (!digitos) return 'El teléfono es obligatorio';
  if (!/^9\d{8}$/.test(digitos)) return 'Escribe un celular de 9 dígitos';
  return '';
};

export const validarContrasena = (valor) => {
  if (!valor) return 'La contraseña es obligatoria';
  if (valor.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Z]/.test(valor)) return 'Incluye al menos una mayúscula';
  if (!/\d/.test(valor)) return 'Incluye al menos un número';
  return '';
};

export const validarConfirmacion = (contrasena, confirmacion) => {
  if (!confirmacion) return 'Confirma tu contraseña';
  if (contrasena !== confirmacion) return 'Las contraseñas no coinciden';
  return '';
};