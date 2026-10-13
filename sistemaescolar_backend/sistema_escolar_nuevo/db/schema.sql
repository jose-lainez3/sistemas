-- =====================================================================
-- SISTEMA ESCOLAR NOVA - Esquema de base de datos (SQLite)
-- Se ejecuta automaticamente la primera vez que arrancas el servidor.
-- =====================================================================

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin','secretaria','profesor')) DEFAULT 'profesor',
  activo INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cursos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  anio_lectivo TEXT NOT NULL,
  creado_en TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profesor_cursos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profesor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  curso_id INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  UNIQUE (profesor_id, curso_id)
);

CREATE TABLE IF NOT EXISTS alumnos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  dni TEXT UNIQUE,
  fecha_nacimiento TEXT,
  direccion TEXT,
  telefono TEXT,
  nombre_encargado TEXT,
  telefono_encargado TEXT,
  creado_en TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS matriculas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alumno_id INTEGER NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  curso_id INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  anio_lectivo TEXT NOT NULL,
  fecha_matricula TEXT NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('activo','retirado')) DEFAULT 'activo',
  UNIQUE (alumno_id, anio_lectivo)
);

CREATE TABLE IF NOT EXISTS asistencia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matricula_id INTEGER NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
  fecha TEXT NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('presente','ausente','tarde','justificado')),
  registrado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  creado_en TEXT DEFAULT (datetime('now')),
  UNIQUE (matricula_id, fecha)
);

CREATE TABLE IF NOT EXISTS notas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matricula_id INTEGER NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
  materia TEXT NOT NULL,
  periodo TEXT NOT NULL,
  nota REAL NOT NULL,
  registrado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  creado_en TEXT DEFAULT (datetime('now')),
  UNIQUE (matricula_id, materia, periodo)
);

CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  creado_en TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inventario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  cantidad INTEGER NOT NULL DEFAULT 1,
  estado TEXT NOT NULL CHECK (estado IN ('bueno','regular','dañado','de baja')) DEFAULT 'bueno',
  ubicacion TEXT,
  observaciones TEXT,
  creado_en TEXT DEFAULT (datetime('now'))
);
