const { db } = require('./db/database');

try {
    console.log('Buscando usuarios en la base de datos...');
    const usuarios = db.prepare('SELECT * FROM usuarios').all();
    
    if (usuarios.length === 0) {
        console.log('La tabla de usuarios está COMPLETAMENTE VACÍA.');
    } else {
        console.log(`¡Se encontraron ${usuarios.length} usuarios! Aquí están:`);
        console.log(usuarios);
    }
} catch (error) {
    console.error('Hubo un error al leer la base de datos:', error.message);
}