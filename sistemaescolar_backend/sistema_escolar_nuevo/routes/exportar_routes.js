const { db } = require('../db/database');
const { requerirLogin, usuarioActual } = require('../lib/auth');
const { ReportePDF } = require('../lib/pdf_writer');
const { ReporteExcel } = require('../lib/xlsx_writer');

function registrar(router) {
  router.get('/exportar', (ctx) => {
    if (!requerirLogin(ctx)) return;
    const u = usuarioActual(ctx);

    const tipo = ctx.query.tipo || '';
    const formato = ctx.query.formato || 'pdf';
    const cursoId = ctx.query.curso_id || null;

    // Seguridad: un profesor solo puede exportar reportes de sus propios cursos
    if (u.rol === 'profesor' && cursoId) {
      const chequeo = db
        .prepare('SELECT 1 AS ok FROM profesor_cursos WHERE profesor_id = ? AND curso_id = ?')
        .get(u.id, cursoId);
      if (!chequeo) {
        return ctx.html('No tienes permiso para exportar el reporte de este curso.', 403);
      }
    }

    let cursoNombre = '';
    if (cursoId) {
      const c = db.prepare('SELECT nombre, anio_lectivo FROM cursos WHERE id = ?').get(cursoId);
      cursoNombre = c ? `${c.nombre} (${c.anio_lectivo})` : '';
    }

    let columnas = {};
    let filas = [];
    let titulo = '';
    let nombreArchivo = 'reporte';

    if (tipo === 'alumnos') {
      titulo = `Alumnos matriculados - ${cursoNombre}`;
      nombreArchivo = `alumnos_${cursoId}`;
      const datos = db
        .prepare(
          `SELECT a.apellidos, a.nombres, a.dni, a.telefono, m.fecha_matricula, m.estado
           FROM matriculas m JOIN alumnos a ON a.id = m.alumno_id
           WHERE m.curso_id = ? ORDER BY a.apellidos, a.nombres`
        )
        .all(cursoId);
      columnas = { Apellidos: 100, Nombres: 100, DNI: 90, Telefono: 80, 'F. Matricula': 80, Estado: 60 };
      filas = datos.map((d) => ({
        Apellidos: d.apellidos,
        Nombres: d.nombres,
        DNI: d.dni,
        Telefono: d.telefono,
        'F. Matricula': d.fecha_matricula,
        Estado: d.estado === 'activo' ? 'Activo' : 'Retirado',
      }));
    } else if (tipo === 'asistencia') {
      const desde = ctx.query.desde || new Date().toISOString().slice(0, 8) + '01';
      const hasta = ctx.query.hasta || new Date().toISOString().slice(0, 10);
      titulo = `Asistencia ${desde} a ${hasta} - ${cursoNombre}`;
      nombreArchivo = `asistencia_${cursoId}`;
      const datos = db
        .prepare(
          `SELECT a.apellidos, a.nombres, ast.fecha, ast.estado
           FROM asistencia ast
           JOIN matriculas m ON m.id = ast.matricula_id
           JOIN alumnos a ON a.id = m.alumno_id
           WHERE m.curso_id = ? AND ast.fecha BETWEEN ? AND ?
           ORDER BY ast.fecha, a.apellidos`
        )
        .all(cursoId, desde, hasta);
      columnas = { Fecha: 70, Apellidos: 110, Nombres: 110, Estado: 90 };
      filas = datos.map((d) => ({
        Fecha: d.fecha,
        Apellidos: d.apellidos,
        Nombres: d.nombres,
        Estado: d.estado.charAt(0).toUpperCase() + d.estado.slice(1),
      }));
    } else if (tipo === 'notas') {
      const materia = (ctx.query.materia || '').trim();
      const periodo = (ctx.query.periodo || '').trim();
      titulo = `Notas - ${cursoNombre}${materia ? ' - ' + materia : ''}${periodo ? ' - ' + periodo : ''}`;
      nombreArchivo = `notas_${cursoId}`;

      let sql = `SELECT a.apellidos, a.nombres, n.materia, n.periodo, n.nota
                  FROM notas n
                  JOIN matriculas m ON m.id = n.matricula_id
                  JOIN alumnos a ON a.id = m.alumno_id
                  WHERE m.curso_id = ?`;
      const parametros = [cursoId];
      if (materia !== '') { sql += ' AND n.materia = ?'; parametros.push(materia); }
      if (periodo !== '') { sql += ' AND n.periodo = ?'; parametros.push(periodo); }
      sql += ' ORDER BY a.apellidos, a.nombres, n.materia, n.periodo';

      const datos = db.prepare(sql).all(...parametros);
      columnas = { Apellidos: 100, Nombres: 100, Materia: 100, Periodo: 90, Nota: 50 };
      filas = datos.map((d) => ({
        Apellidos: d.apellidos,
        Nombres: d.nombres,
        Materia: d.materia,
        Periodo: d.periodo,
        Nota: d.nota,
      }));
    } else {
      return ctx.html('Tipo de reporte no valido.', 400);
    }

    if (formato === 'excel') {
      const buffer = ReporteExcel.generar(Object.keys(columnas), filas, 'Reporte');
      return ctx.descargar(
        buffer,
        `${nombreArchivo}.xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    }

    const reporte = new ReportePDF(titulo);
    reporte.tabla(columnas, filas);
    const pdfBuffer = reporte.salida();
    ctx.descargar(pdfBuffer, `${nombreArchivo}.pdf`, 'application/pdf');
  });
}

module.exports = { registrar };
