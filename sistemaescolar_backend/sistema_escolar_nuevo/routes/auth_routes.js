const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { verifyPassword } = require('../lib/passwords');

// Ruta para iniciar sesión (API)
router.post('/login', (req, res) => {
    // Nota: Ionic envía "usuario", pero tu BD usa "email". 
    // Capturamos el dato y lo limpiamos para usarlo como email.
    const email = (req.body.usuario || req.body.email || '').trim();
    const clave = req.body.password || '';

    // 1. Validar que no vengan vacíos
    if (!email || !clave) {
        return res.status(400).json({ 
            success: false, 
            mensaje: 'Ingresa email y contraseña.' 
        });
    }

    try {
        // --- LOGS DE DEPURACIÓN AÑADIDOS ---
        console.log('--- INTENTO DE LOGIN ---');
        console.log('Email recibido:', email);
        console.log('Clave recibida:', clave);

        // 2. Buscar el usuario en tu base de datos real
        const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ? AND activo = 1').get(email);

        // Imprimir lo que encontró la base de datos
        console.log('Usuario encontrado en BD:', usuario);
        console.log('------------------------');
        // -----------------------------------

        // 3. Verificar si existe y si la contraseña es correcta con tu función real
        if (usuario && verifyPassword(clave, usuario.password_hash)) {
            // ¡Login exitoso! Devolvemos los datos en formato JSON
            return res.json({
                success: true,
                mensaje: 'Login correcto',
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    rol: usuario.rol
                }
            });
        } else {
            // Credenciales incorrectas
            return res.status(401).json({
                success: false,
                mensaje: 'Email o contraseña incorrectos.'
            });
        }
    } catch (error) {
        console.error('Error en el login:', error);
        return res.status(500).json({ 
            success: false, 
            mensaje: 'Error interno del servidor.' 
        });
    }
});

module.exports = router;