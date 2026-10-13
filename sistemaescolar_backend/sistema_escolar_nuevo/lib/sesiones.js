// ============================================================
// Sesiones simples basadas en cookie firmada + almacen en
// memoria del proceso. Suficiente para un sistema de una sola
// instancia (uso tipico de un colegio). No requiere librerias
// externas.
// ============================================================
const crypto = require('node:crypto');

const sesiones = new Map(); // id -> { datos, expira }
const DURACION_MS = 8 * 60 * 60 * 1000; // 8 horas

function generarId() {
  return crypto.randomBytes(24).toString('hex');
}

function crearSesion() {
  const id = generarId();
  sesiones.set(id, { datos: {}, expira: Date.now() + DURACION_MS });
  return id;
}

function obtenerSesion(id) {
  if (!id) return null;
  const s = sesiones.get(id);
  if (!s) return null;
  if (s.expira < Date.now()) {
    sesiones.delete(id);
    return null;
  }
  s.expira = Date.now() + DURACION_MS; // renovar
  return s.datos;
}

function destruirSesion(id) {
  sesiones.delete(id);
}

function parsearCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach((parte) => {
    const idx = parte.indexOf('=');
    if (idx === -1) return;
    const k = parte.slice(0, idx).trim();
    const v = parte.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  });
  return out;
}

// Limpieza periodica de sesiones vencidas
setInterval(() => {
  const ahora = Date.now();
  for (const [id, s] of sesiones) {
    if (s.expira < ahora) sesiones.delete(id);
  }
}, 30 * 60 * 1000).unref();

module.exports = { crearSesion, obtenerSesion, destruirSesion, parsearCookies };
