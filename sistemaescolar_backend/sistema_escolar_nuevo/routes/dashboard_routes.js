const { db } = require('../db/database');
const { render } = require('../lib/plantillas');
const { requerirLogin, usuarioActual, tomarMensaje } = require('../lib/auth');

function registrar(router) {
  router.get('/dashboard', (ctx) => {
    if (!requerirLogin(ctx)) return;

    const totalAlumnos = db.prepare('SELECT COUNT(*) AS c FROM alumnos').get().c;
    const totalMatriculados = db.prepare("SELECT COUNT(*) AS c FROM matriculas WHERE estado='activo'").get().c;
    const totalCursos = db.prepare('SELECT COUNT(*) AS c FROM cursos').get().c;
    const hoy = new Date().toISOString().slice(0, 10);
    const presentesHoy = db
      .prepare("SELECT COUNT(*) AS c FROM asistencia WHERE fecha = ? AND estado='presente'")
      .get(hoy).c;

    ctx.html(
      render('dashboard', {
        usuario: usuarioActual(ctx),
        mensaje: tomarMensaje(ctx),
        totalAlumnos,
        totalMatriculados,
        totalCursos,
        presentesHoy,
        hoy,
      })
    );
  });
}

module.exports = { registrar };
