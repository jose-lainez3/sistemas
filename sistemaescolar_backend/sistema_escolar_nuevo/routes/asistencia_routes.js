const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

const ESTADOS_VALIDOS = ['presente', 'ausente', 'tarde', 'justificado'];

// --- OBTENER ASISTENCIA DE UN CURSO EN UNA FECHA (GET) ---
// Devuelve todos los alumnos matriculados activos en el curso, con su estado
// de asistencia para esa fecha (o 'presente' por defecto si aun no se ha tomado).
router.get('/', (req, res) => {
    try {
        const cursoId = req.query.curso_id;
        const fecha = req.query.fecha;

        if (!cursoId || !fecha) {
            return res.status(400).json({ success: false, mensaje: 'Faltan curso_id o fecha.' });
        }

        const filas = db.prepare(
            `SELECT m.alumno_id, a.nombres, a.apellidos, ast.estado AS estado_guardado
             FROM matriculas m
             JOIN alumnos a ON a.id = m.alumno_id
             LEFT JOIN asistencia ast ON ast.matricula_id = m.id AND ast.fecha = ?
             WHERE m.curso_id = ? AND m.estado = 'activo'
             ORDER BY a.apellidos, a.nombres`
        ).all(fecha, cursoId);

        const data = filas.map(f => ({
            alumno_id: f.alumno_id,
            nombres: f.nombres,
            apellidos: f.apellidos,
            estado: f.estado_guardado || 'presente'
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error al obtener asistencia:', error);
        res.status(500).json({ success: false, mensaje: 'Error interno del servidor al leer asistencia' });
    }
});

// --- GUARDAR ASISTENCIA DE UN CURSO EN UNA FECHA (POST) ---
router.post('/', (req, res) => {
    try {
        const { curso_id, fecha, registros } = req.body;

        if (!curso_id || !fecha || !Array.isArray(registros)) {
            return res.status(400).json({ success: false, mensaje: 'Datos incompletos para guardar asistencia.' });
        }

        const buscarMatricula = db.prepare(
            `SELECT id FROM matriculas WHERE alumno_id = ? AND curso_id = ? AND estado = 'activo'`
        );
        const upsert = db.prepare(
            `INSERT INTO asistencia (matricula_id, fecha, estado)
             VALUES (?, ?, ?)
             ON CONFLICT(matricula_id, fecha) DO UPDATE SET estado = excluded.estado`
        );

        db.exec('BEGIN');
        try {
            for (const registro of registros) {
                const estado = ESTADOS_VALIDOS.includes(registro.estado) ? registro.estado : 'presente';
                const matricula = buscarMatricula.get(registro.alumno_id, curso_id);
                if (!matricula) continue; // alumno no matriculado activo en este curso, se ignora
                upsert.run(matricula.id, fecha, estado);
            }
            db.exec('COMMIT');
        } catch (e) {
            db.exec('ROLLBACK');
            throw e;
        }

        res.json({ success: true, mensaje: 'Asistencia guardada correctamente.' });
    } catch (error) {
        console.error('Error al guardar asistencia:', error);
        res.status(500).json({ success: false, mensaje: 'Error al guardar la asistencia' });
    }
});

// --- HISTORIAL DE ASISTENCIA (para reportes) ---
router.get('/historial', (req, res) => {
    try {
        const { curso_id, desde, hasta } = req.query;
        if (!curso_id || !desde || !hasta) {
            return res.status(400).json({ success: false, mensaje: 'Faltan curso_id, desde o hasta.' });
        }

        const data = db.prepare(
            `SELECT ast.fecha, a.nombres, a.apellidos, ast.estado
             FROM asistencia ast
             JOIN matriculas m ON m.id = ast.matricula_id
             JOIN alumnos a ON a.id = m.alumno_id
             WHERE m.curso_id = ? AND ast.fecha BETWEEN ? AND ?
             ORDER BY ast.fecha, a.apellidos, a.nombres`
        ).all(curso_id, desde, hasta);

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error al obtener historial de asistencia:', error);
        res.status(500).json({ success: false, mensaje: 'Error al obtener el historial' });
    }
});

module.exports = router;
