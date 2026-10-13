// ============================================================
// Conexion a la base de datos SQLite (nativa de Node.js, sin
// dependencias externas). Crea el archivo data/escuela.db y las
// tablas automaticamente la primera vez que se ejecuta.
// ============================================================
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const DB_PATH = path.join(__dirname, '..', 'data', 'escuela.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const esNueva = !fs.existsSync(DB_PATH);

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');

// Aplica el esquema siempre (usa IF NOT EXISTS, es seguro repetirlo)
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);

module.exports = { db, esNueva };
