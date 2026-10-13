const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// --- CREAR MATRÍCULA (POST) ---
// Un alumno solo puede tener UNA matrícula activa por año lectivo (según el esquema),
// y el año lectivo se toma del curso seleccionado, no de la fecha actual.
router.post('/', (req, res) => {
    try {
        const alumnoId = req.body.alumno_id;
        const cursoId = req.body.curso_id;

        if (!alumnoId || !cursoId) {
            return res.status(400).json({ success: false, mensaje: 'Faltan datos obligatorios (alumno o curso).' });
        }

        const curso = db.prepare('SELECT id, anio_lectivo FROM cursos WHERE id = ?').get(cursoId);
        if (!curso) {
            return res.status(404).json({ success: false, mensaje: 'El curso seleccionado no existe.' });
        }

        const fechaMatricula = new Date().toISOString().slice(0, 10);

        db.prepare(
            `INSERT INTO matriculas (alumno_id, curso_id, anio_lectivo, fecha_matricula, estado)
             VALUES (?, ?, ?, ?, 'activo')`
        ).run(alumnoId, cursoId, curso.anio_lectivo, fechaMatricula);

        res.status(201).json({ success: true, mensaje: 'Alumno matriculado correctamente.' });

    } catch (error) {
        console.error('Error al matricular:', error);
        if (String(error.message || '').includes('UNIQUE')) {
            return res.status(400).json({
                success: false,
                mensaje: 'Este alumno ya tiene una matrícula registrada para el año lectivo de ese curso.'
            });
        }
        res.status(500).json({ success: false, mensaje: 'Error al registrar la matrícula.' });
    }
});

// --- LISTAR MATRÍCULAS (GET) opcional, útil para revisar quién está en qué curso ---
router.get('/', (req, res) => {
    try {
        const cursoId = req.query.curso_id;
        let matriculas;
        if (cursoId) {
            matriculas = db.prepare(
                `SELECT m.id, m.alumno_id, m.curso_id, m.anio_lectivo, m.fecha_matricula, m.estado,
                        a.nombres, a.apellidos
                 FROM matriculas m
                 JOIN alumnos a ON a.id = m.alumno_id
                 WHERE m.curso_id = ? AND m.estado = 'activo'
                 ORDER BY a.apellidos, a.nombres`
            ).all(cursoId);
        } else {
            matriculas = db.prepare(
                `SELECT m.id, m.alumno_id, m.curso_id, m.anio_lectivo, m.fecha_matricula, m.estado,
                        a.nombres, a.apellidos, c.nombre AS curso_nombre
                 FROM matriculas m
                 JOIN alumnos a ON a.id = m.alumno_id
                 JOIN cursos c ON c.id = m.curso_id
                 ORDER BY m.anio_lectivo DESC, a.apellidos, a.nombres`
            ).all();
        }
        res.json({ success: true, data: matriculas });
    } catch (error) {
        console.error('Error al listar matriculas:', error);
        res.status(500).json({ success: false, mensaje: 'Error al listar matrículas.' });
    }
});

module.exports = router;
