// ============================================================
// Utilidades de sesion/autenticacion y control de roles.
// Equivalente a includes/auth.php del sistema original.
// ============================================================

function usuarioActual(ctx) {
  return {
    id: ctx.session.usuarioId || null,
    nombre: ctx.session.usuarioNombre || null,
    rol: ctx.session.usuarioRol || null,
  };
}

function requerirLogin(ctx) {
  if (!ctx.session.usuarioId) {
    ctx.redirigir('/login');
    return false;
  }
  return true;
}

function requerirRol(ctx, rolesPermitidos) {
  if (!requerirLogin(ctx)) return false;
  if (!rolesPermitidos.includes(ctx.session.usuarioRol)) {
    ctx.html('<h2>Acceso denegado</h2><p>No tienes permiso para ver esta pagina. <a href="/dashboard">Volver</a></p>', 403);
    return false;
  }
  return true;
}

function fijarMensaje(ctx, tipo, texto) {
  ctx.session.mensaje = { tipo, texto };
}

function tomarMensaje(ctx) {
  const m = ctx.session.mensaje;
  delete ctx.session.mensaje;
  return m || null;
}

module.exports = { usuarioActual, requerirLogin, requerirRol, fijarMensaje, tomarMensaje };
