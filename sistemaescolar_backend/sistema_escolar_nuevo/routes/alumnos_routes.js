const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

router.get('/', (req, res) => {
    res.set('Cache-Control', 'no-store');   // <-- agrega esta línea
    try {
        const busqueda = (req.query.q || '').trim();
        let alumnos;

        if (busqueda) {
            const like = `%${busqueda}%`;
            alumnos = db
                .prepare('SELECT * FROM alumnos WHERE nombres LIKE ? OR apellidos LIKE ? OR dni LIKE ? ORDER BY apellidos, nombres')
                .all(like, like, like);
        } else {
            alumnos = db.prepare('SELECT * FROM alumnos ORDER BY apellidos, nombres').all();
        }

        res.json({ success: true, data: alumnos });
    } catch (error) {
        console.error('Error al obtener alumnos:', error);
        res.status(500).json({ success: false, mensaje: 'Error interno del servidor al leer alumnos' });
    }
});

// --- 2. CREAR ALUMNO (POST) ---
router.post('/', (req, res) => {
    try {
        const info = req.body; // Ionic enviará un objeto JSON con estos datos

        const stmt = db.prepare(
            `INSERT INTO alumnos (nombres, apellidos, dni, fecha_nacimiento, direccion, telefono, nombre_encargado, telefono_encargado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        );

        const resultado = stmt.run(
            (info.nombres || '').trim(),
            (info.apellidos || '').trim(),
            (info.dni || '').trim() || null,
            info.fecha_nacimiento || null,
            (info.direccion || '').trim(),
            (info.telefono || '').trim(),
            (info.nombre_encargado || '').trim(),
            (info.telefono_encargado || '').trim()
        );

        res.json({ 
            success: true, 
            mensaje: 'Alumno registrado correctamente.',
            id_nuevo: resultado.lastInsertRowid // Le devolvemos el ID generado a Ionic
        });
    } catch (error) {
        console.error('Error al registrar alumno:', error);
        res.status(500).json({ success: false, mensaje: 'Error al registrar alumno en la base de datos' });
    }
});

// --- 3. ELIMINAR ALUMNO (DELETE) ---
router.delete('/:id', (req, res) => {
    try {
        const idAlumno = req.params.id; // Capturamos el ID directamente de la URL
        
        db.prepare('DELETE FROM alumnos WHERE id = ?').run(idAlumno);
        
        res.json({ success: true, mensaje: 'Alumno eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar alumno:', error);
        res.status(500).json({ success: false, mensaje: 'Error al eliminar alumno de la base de datos' });
    }
});

module.exports = router;