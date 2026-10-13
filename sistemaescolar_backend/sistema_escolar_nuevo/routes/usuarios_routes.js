const { db } = require('../db/database');
const { render } = require('../lib/plantillas');
const { requerirRol, usuarioActual, fijarMensaje, tomarMensaje } = require('../lib/auth');
const { hashPassword } = require('../lib/passwords');

function registrar(router) {
  router.post('/usuarios', (ctx) => {
    if (!requerirRol(ctx, ['admin'])) return;
    const accion = ctx.body.accion || '';

    if (accion === 'crear') {
      const nombre = (ctx.body.nombre || '').trim();
      const email = (ctx.body.email || '').trim();
      const rol = ctx.body.rol;
      const clave = ctx.body.password;

      const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
      if (existe) {
        fijarMensaje(ctx, 'error', 'Ya existe un usuario con ese email.');
      } else {
        const hash = hashPassword(clave);
        db.prepare('INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)').run(
          nombre,
          email,
          hash,
          rol
        );
        fijarMensaje(ctx, 'exito', 'Usuario creado correctamente.');
      }
    }

    if (accion === 'cambiar_estado') {
      db.prepare('UPDATE usuarios SET activo = 1 - activo WHERE id = ?').run(ctx.body.usuario_id);
      fijarMensaje(ctx, 'exito', 'Estado del usuario actualizado.');
    }

    if (accion === 'cambiar_password') {
      const hash = hashPassword(ctx.body.password_nueva);
      db.prepare('UPDATE usuarios SET password_hash = ? WHERE id = ?').run(hash, ctx.body.usuario_id);
      fijarMensaje(ctx, 'exito', 'Contrasena actualizada.');
    }

    if (accion === 'cambiar_rol') {
      db.prepare('UPDATE usuarios SET rol = ? WHERE id = ?').run(ctx.body.rol, ctx.body.usuario_id);
      fijarMensaje(ctx, 'exito', 'Rol actualizado.');
    }

    ctx.redirigir('/usuarios');
  });

  router.get('/usuarios', (ctx) => {
    if (!requerirRol(ctx, ['admin'])) return;

    const usuarios = db.prepare('SELECT * FROM usuarios ORDER BY rol, nombre').all();

    ctx.html(
      render('usuarios', {
        usuario: usuarioActual(ctx),
        mensaje: tomarMensaje(ctx),
        usuarios,
      })
    );
  });
}

module.exports = { registrar };
