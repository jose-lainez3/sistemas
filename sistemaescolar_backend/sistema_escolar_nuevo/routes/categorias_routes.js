const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

router.get('/', (req, res) => {
    try {
        const categorias = db.prepare('SELECT * FROM categorias ORDER BY nombre').all();
        res.json({ success: true, data: categorias });
    } catch (error) {
        console.error('Error al obtener categorias:', error);
        res.status(500).json({ success: false, mensaje: 'Error interno del servidor al leer categorías' });
    }
});

router.post('/', (req, res) => {
    try {
        const nombre = (req.body.nombre || '').trim();
        const descripcion = (req.body.descripcion || '').trim() || null;

        if (!nombre) {
            return res.status(400).json({ success: false, mensaje: 'El nombre es obligatorio.' });
        }

        const resultado = db.prepare(
            'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)'
        ).run(nombre, descripcion);

        res.json({ success: true, mensaje: 'Categoría creada correctamente.', id_nuevo: resultado.lastInsertRowid });
    } catch (error) {
        console.error('Error al crear categoria:', error);
        if (String(error.message || '').includes('UNIQUE')) {
            return res.status(400).json({ success: false, mensaje: 'Ya existe una categoría con ese nombre.' });
        }
        res.status(500).json({ success: false, mensaje: 'Error al crear la categoría' });
    }
});

router.delete('/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM categorias WHERE id = ?').run(req.params.id);
        res.json({ success: true, mensaje: 'Categoría eliminada.' });
    } catch (error) {
        console.error('Error al eliminar categoria:', error);
        res.status(500).json({ success: false, mensaje: 'No se pudo eliminar: revisa que no tenga artículos de inventario asociados.' });
    }
});

module.exports = router;
