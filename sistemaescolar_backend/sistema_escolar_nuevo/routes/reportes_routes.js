const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { ReportePDF } = require('../lib/pdf_writer');
const { ReporteExcel } = require('../lib/xlsx_writer');

const NOMBRE_INSTITUCION = 'Complejo Educativo Cantón El Zunzal';

function enviarReporte(res, formato, titulo, columnas, filas, nombreArchivo) {
    if (formato === 'excel') {
        const buffer = ReporteExcel.generar(Object.keys(columnas), filas, 'Reporte');
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${nombreArchivo}.xlsx"`
        });
        return res.send(buffer);
    }
    const reporte = new ReportePDF(`${NOMBRE_INSTITUCION} - ${titulo}`);
    reporte.tabla(columnas, filas);
    const buffer = reporte.salida();
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${nombreArchivo}.pdf"`
    });
    return res.send(buffer);
}

// --- ALUMNOS ---
router.get('/alumnos', (req, res) => {
    try {
        const formato = req.query.formato || 'pdf';
        const datos = db.prepare('SELECT nombres, apellidos, dni, telefono FROM alumnos ORDER BY apellidos, nombres').all();
        const columnas = { Apellidos: 110, Nombres: 110, DNI: 90, Telefono: 80 };
        const filas = datos.map(d => ({ Apellidos: d.apellidos, Nombres: d.nombres, DNI: d.dni || 'N/A', Telefono: d.telefono || 'N/A' }));
        enviarReporte(res, formato, 'Listado de Alumnos', columnas, filas, 'alumnos');
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, mensaje: 'Error al generar el reporte de alumnos' });
    }
});

// --- CURSOS ---
router.get('/cursos', (req, res) => {
    try {
        const formato = req.query.formato || 'pdf';
        const datos = db.prepare('SELECT nombre, anio_lectivo FROM cursos ORDER BY anio_lectivo DESC, nombre').all();
        const columnas = { Nombre: 160, 'Anio Lectivo': 90 };
        const filas = datos.map(d => ({ Nombre: d.nombre, 'Anio Lectivo': d.anio_lectivo }));
        enviarReporte(res, formato, 'Listado de Cursos', columnas, filas, 'cursos');
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, mensaje: 'Error al generar el reporte de cursos' });
    }
});

// --- INVENTARIO ---
router.get('/inventario', (req, res) => {
    try {
        const formato = req.query.formato || 'pdf';
        const datos = db.prepare(
            `SELECT i.nombre, c.nombre AS categoria, i.cantidad, i.estado, i.ubicacion
             FROM inventario i JOIN categorias c ON c.id = i.categoria_id
             ORDER BY i.nombre`
        ).all();
        const columnas = { Articulo: 140, Categoria: 100, Cantidad: 60, Estado: 70, Ubicacion: 100 };
        const filas = datos.map(d => ({
            Articulo: d.nombre, Categoria: d.categoria, Cantidad: d.cantidad,
            Estado: d.estado, Ubicacion: d.ubicacion || '—'
        }));
        enviarReporte(res, formato, 'Reporte de Inventario', columnas, filas, 'inventario');
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, mensaje: 'Error al generar el reporte de inventario' });
    }
});

// --- ASISTENCIA ---
router.get('/asistencia', (req, res) => {
    try {
        const formato = req.query.formato || 'pdf';
        const { curso_id, desde, hasta } = req.query;
        if (!curso_id || !desde || !hasta) {
            return res.status(400).json({ success: false, mensaje: 'Faltan curso_id, desde o hasta.' });
        }
        const datos = db.prepare(
            `SELECT ast.fecha, a.apellidos, a.nombres, ast.estado
             FROM asistencia ast
             JOIN matriculas m ON m.id = ast.matricula_id
             JOIN alumnos a ON a.id = m.alumno_id
             WHERE m.curso_id = ? AND ast.fecha BETWEEN ? AND ?
             ORDER BY ast.fecha, a.apellidos, a.nombres`
        ).all(curso_id, desde, hasta);
        const columnas = { Fecha: 70, Apellidos: 110, Nombres: 110, Estado: 80 };
        const filas = datos.map(d => ({
            Fecha: d.fecha, Apellidos: d.apellidos, Nombres: d.nombres,
            Estado: d.estado.charAt(0).toUpperCase() + d.estado.slice(1)
        }));
        enviarReporte(res, formato, `Asistencia (${desde} a ${hasta})`, columnas, filas, 'asistencia');
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, mensaje: 'Error al generar el reporte de asistencia' });
    }
});

// --- NOTAS ---
router.get('/notas', (req, res) => {
    try {
        const formato = req.query.formato || 'pdf';
        const { curso_id, materia, periodo } = req.query;
        if (!curso_id || !materia || !periodo) {
            return res.status(400).json({ success: false, mensaje: 'Faltan curso_id, materia o periodo.' });
        }
        const datos = db.prepare(
            `SELECT a.apellidos, a.nombres, n.nota
             FROM notas n
             JOIN matriculas m ON m.id = n.matricula_id
             JOIN alumnos a ON a.id = m.alumno_id
             WHERE m.curso_id = ? AND n.materia = ? AND n.periodo = ?
             ORDER BY a.apellidos, a.nombres`
        ).all(curso_id, materia, periodo);
        const columnas = { Apellidos: 110, Nombres: 110, Nota: 60 };
        const filas = datos.map(d => ({ Apellidos: d.apellidos, Nombres: d.nombres, Nota: d.nota }));
        enviarReporte(res, formato, `Notas - ${materia} (${periodo})`, columnas, filas, 'notas');
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, mensaje: 'Error al generar el reporte de notas' });
    }
});

module.exports = router;
