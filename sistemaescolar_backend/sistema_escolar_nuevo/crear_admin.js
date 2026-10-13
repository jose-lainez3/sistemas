const { db } = require('./db/database');
// Importamos la función para encriptar contraseñas que seguro tienes en tu archivo
const { hashPassword } = require('./lib/passwords'); 

try {
    console.log('Preparando la inyección del administrador...');
    
    const nombre = 'Administrador Nova';
    const email = 'admin@escuela.com';
    const claveSecreta = 'Admin123!';
    
    // Encriptamos la contraseña para que tu verifyPassword la pueda leer después
    const hash = hashPassword(claveSecreta);
    
    // Preparamos la inserción en la base de datos
    const insertar = db.prepare(`
        INSERT INTO usuarios (nombre, email, password_hash, rol, activo) 
        VALUES (?, ?, ?, ?, ?)
    `);
    
    // Ejecutamos la inserción
    // Ejecutamos la inserción usando 'admin'
insertar.run(nombre, email, hash, 'admin', 1);
    
    console.log('✅ ¡Usuario administrador creado con éxito!');
    console.log(`Correo: ${email}`);
    console.log(`Clave: ${claveSecreta}`);
    
} catch (error) {
    console.error('❌ Error al inyectar el usuario:', error.message);
    console.log('Revisa si la función en lib/passwords se llama diferente (ej. hash, encryptPassword)');
}