const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// --- OBTENER CURSOS (GET) ---
router.get('/', (req, res) => {
    try {
        const cursos = db.prepare('SELECT * FROM cursos ORDER BY anio_lectivo DESC, nombre').all();
        res.json({ success: true, data: cursos });
    } catch (error) {
        console.error('Error al obtener cursos:', error);
        res.status(500).json({ success: false, mensaje: 'Error interno del servidor al leer cursos' });
    }
});

// --- CREAR CURSO (POST) ---
router.post('/', (req, res) => {
    try {
        const nombre = (req.body.nombre || '').trim();
        const anioLectivo = String(req.body.anio_lectivo || '').trim();

        if (!nombre || !anioLectivo) {
            return res.status(400).json({ success: false, mensaje: 'Faltan datos obligatorios.' });
        }

        const resultado = db.prepare(
            'INSERT INTO cursos (nombre, anio_lectivo) VALUES (?, ?)'
        ).run(nombre, anioLectivo);

        res.json({ success: true, mensaje: 'Curso creado correctamente.', id_nuevo: resultado.lastInsertRowid });
    } catch (error) {
        console.error('Error al crear curso:', error);
        res.status(500).json({ success: false, mensaje: 'Error al crear el curso' });
    }
});

// --- ELIMINAR CURSO (DELETE) ---
router.delete('/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM cursos WHERE id = ?').run(req.params.id);
        res.json({ success: true, mensaje: 'Curso eliminado.' });
    } catch (error) {
        console.error('Error al eliminar curso:', error);
        // Puede fallar si el curso tiene matriculas asociadas (FK ON DELETE CASCADE las borraria,
        // pero dejamos el mensaje por si en el futuro se restringe)
        res.status(500).json({ success: false, mensaje: 'Error al eliminar el curso' });
    }
});

module.exports = router;
