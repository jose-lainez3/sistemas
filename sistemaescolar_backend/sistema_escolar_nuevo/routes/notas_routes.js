const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// --- OBTENER NOTAS DE UN CURSO/MATERIA/PERIODO (GET) ---
router.get('/', (req, res) => {
    try {
        const { curso_id, materia, periodo } = req.query;
        if (!curso_id || !materia || !periodo) {
            return res.status(400).json({ success: false, mensaje: 'Faltan curso_id, materia o periodo.' });
        }

        const filas = db.prepare(
            `SELECT m.alumno_id, a.nombres, a.apellidos, n.nota AS nota_guardada
             FROM matriculas m
             JOIN alumnos a ON a.id = m.alumno_id
             LEFT JOIN notas n ON n.matricula_id = m.id AND n.materia = ? AND n.periodo = ?
             WHERE m.curso_id = ? AND m.estado = 'activo'
             ORDER BY a.apellidos, a.nombres`
        ).all(materia, periodo, curso_id);

        const data = filas.map(f => ({
            alumno_id: f.alumno_id,
            nombres: f.nombres,
            apellidos: f.apellidos,
            nota: f.nota_guardada ?? null
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error al obtener notas:', error);
        res.status(500).json({ success: false, mensaje: 'Error interno del servidor al leer notas' });
    }
});

// --- GUARDAR NOTAS DE UN CURSO/MATERIA/PERIODO (POST) ---
router.post('/', (req, res) => {
    try {
        const { curso_id, materia, periodo, notas } = req.body;

        if (!curso_id || !materia || !periodo || !Array.isArray(notas)) {
            return res.status(400).json({ success: false, mensaje: 'Datos incompletos para guardar notas.' });
        }

        const buscarMatricula = db.prepare(
            `SELECT id FROM matriculas WHERE alumno_id = ? AND curso_id = ? AND estado = 'activo'`
        );
        const upsert = db.prepare(
            `INSERT INTO notas (matricula_id, materia, periodo, nota)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(matricula_id, materia, periodo) DO UPDATE SET nota = excluded.nota`
        );

        db.exec('BEGIN');
        try {
            for (const item of notas) {
                if (item.nota === null || item.nota === undefined || item.nota === '') continue;
                const matricula = buscarMatricula.get(item.alumno_id, curso_id);
                if (!matricula) continue;
                upsert.run(matricula.id, materia, periodo, Number(item.nota));
            }
            db.exec('COMMIT');
        } catch (e) {
            db.exec('ROLLBACK');
            throw e;
        }

        res.json({ success: true, mensaje: 'Notas guardadas correctamente.' });
    } catch (error) {
        console.error('Error al guardar notas:', error);
        res.status(500).json({ success: false, mensaje: 'Error al guardar las notas' });
    }
});

module.exports = router;
