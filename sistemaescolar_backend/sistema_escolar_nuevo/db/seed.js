// ============================================================
// Datos iniciales: mismo admin y mismo curso de ejemplo que el
// sistema original, para que la migracion sea transparente.
//   Email:    admin@escuela.com
//   Password: Admin123!
// Se ejecuta automaticamente al arrancar si la base esta vacia.
// ============================================================
const { db } = require('./database');
const { hashPassword } = require('../lib/passwords');

function sembrar() {
  const hayUsuarios = db.prepare('SELECT COUNT(*) AS c FROM usuarios').get().c;
  if (hayUsuarios > 0) return; // ya sembrada, no repetir

  const hash = hashPassword('Admin123!');
  db.prepare(
    `INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, 'admin')`
  ).run('Administrador', 'admin@escuela.com', hash);

  db.prepare(`INSERT INTO cursos (nombre, anio_lectivo) VALUES (?, ?)`).run(
    '1ro Basico A',
    String(new Date().getFullYear())
  );

  console.log('Datos iniciales creados: admin@escuela.com / Admin123!');
}

module.exports = { sembrar };
