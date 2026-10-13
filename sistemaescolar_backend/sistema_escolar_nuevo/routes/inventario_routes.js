const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

router.get('/', (req, res) => {
    try {
        const items = db.prepare(
            `SELECT i.*, c.nombre AS categoria_nombre
             FROM inventario i
             JOIN categorias c ON c.id = i.categoria_id
             ORDER BY i.nombre`
        ).all();
        res.json({ success: true, data: items });
    } catch (error) {
        console.error('Error al obtener inventario:', error);
        res.status(500).json({ success: false, mensaje: 'Error interno del servidor al leer inventario' });
    }
});

router.post('/', (req, res) => {
    try {
        const { nombre, categoria_id, cantidad, estado, ubicacion, observaciones } = req.body;

        if (!nombre || !categoria_id) {
            return res.status(400).json({ success: false, mensaje: 'Nombre y categoría son obligatorios.' });
        }

        const resultado = db.prepare(
            `INSERT INTO inventario (nombre, categoria_id, cantidad, estado, ubicacion, observaciones)
             VALUES (?, ?, ?, ?, ?, ?)`
        ).run(
            nombre.trim(),
            categoria_id,
            Number(cantidad) || 1,
            estado || 'bueno',
            (ubicacion || '').trim() || null,
            (observaciones || '').trim() || null
        );

        res.json({ success: true, mensaje: 'Artículo registrado correctamente.', id_nuevo: resultado.lastInsertRowid });
    } catch (error) {
        console.error('Error al crear item de inventario:', error);
        res.status(500).json({ success: false, mensaje: 'Error al registrar el artículo' });
    }
});

router.put('/:id', (req, res) => {
    try {
        const { nombre, categoria_id, cantidad, estado, ubicacion, observaciones } = req.body;

        db.prepare(
            `UPDATE inventario
             SET nombre = ?, categoria_id = ?, cantidad = ?, estado = ?, ubicacion = ?, observaciones = ?
             WHERE id = ?`
        ).run(
            (nombre || '').trim(),
            categoria_id,
            Number(cantidad) || 1,
            estado || 'bueno',
            (ubicacion || '').trim() || null,
            (observaciones || '').trim() || null,
            req.params.id
        );

        res.json({ success: true, mensaje: 'Artículo actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar item de inventario:', error);
        res.status(500).json({ success: false, mensaje: 'Error al actualizar el artículo' });
    }
});

router.delete('/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM inventario WHERE id = ?').run(req.params.id);
        res.json({ success: true, mensaje: 'Artículo eliminado.' });
    } catch (error) {
        console.error('Error al eliminar item de inventario:', error);
        res.status(500).json({ success: false, mensaje: 'Error al eliminar el artículo' });
    }
});

module.exports = router;
