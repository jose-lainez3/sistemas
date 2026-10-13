// ============================================================
// Mini "Express" hecho con el modulo http nativo: manejo de
// rutas, metodos, body parsing (urlencoded), query string,
// cookies/sesion y archivos estaticos. Cero dependencias npm.
// ============================================================
const http = require('node:http');
const url = require('node:url');
const path = require('node:path');
const fs = require('node:fs');
const querystring = require('node:querystring');

const { crearSesion, obtenerSesion, destruirSesion, parsearCookies } = require('./sesiones');

const TIPOS_MIME = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

class Router {
  constructor() {
    this.rutas = []; // { metodo, patron, params, handler }
  }

  _agregar(metodo, ruta, handler) {
    const params = [];
    const patronStr = ruta
      .split('/')
      .map((seg) => {
        if (seg.startsWith(':')) {
          params.push(seg.slice(1));
          return '([^/]+)';
        }
        return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      })
      .join('/');
    const patron = new RegExp(`^${patronStr}/?$`);
    this.rutas.push({ metodo, patron, params, handler });
  }

  get(ruta, handler) { this._agregar('GET', ruta, handler); }
  post(ruta, handler) { this._agregar('POST', ruta, handler); }

  encontrar(metodo, pathname) {
    for (const r of this.rutas) {
      if (r.metodo !== metodo) continue;
      const m = r.patron.exec(pathname);
      if (m) {
        const params = {};
        r.params.forEach((nombre, i) => { params[nombre] = decodeURIComponent(m[i + 1]); });
        return { handler: r.handler, params };
      }
    }
    return null;
  }
}

function leerCuerpo(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 5 * 1024 * 1024) req.destroy();
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function crearApp({ staticDir } = {}) {
  const router = new Router();

  const servidor = http.createServer(async (req, res) => {
    try {
      const parsed = url.parse(req.url);
      const pathname = decodeURIComponent(parsed.pathname);

      // Archivos estaticos
      if (staticDir && req.method === 'GET') {
        const rutaArchivo = path.join(staticDir, pathname.replace(/^\/public/, ''));
        if (pathname.startsWith('/public/') && fs.existsSync(rutaArchivo) && fs.statSync(rutaArchivo).isFile()) {
          const ext = path.extname(rutaArchivo);
          res.writeHead(200, { 'Content-Type': TIPOS_MIME[ext] || 'application/octet-stream' });
          fs.createReadStream(rutaArchivo).pipe(res);
          return;
        }
      }

      // Cookies / sesion
      const cookies = parsearCookies(req.headers.cookie);
      let sidExistente = cookies.sid;
      let sesionDatos = obtenerSesion(sidExistente);
      let sidNueva = null;
      if (!sesionDatos) {
        sidNueva = crearSesion();
        sesionDatos = obtenerSesion(sidNueva);
      }

      // Body parsing
      let body = {};
      if (req.method === 'POST') {
        const raw = await leerCuerpo(req);
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('application/x-www-form-urlencoded')) {
          body = querystring.parse(raw);
        } else if (contentType.includes('application/json')) {
          try { body = JSON.parse(raw || '{}'); } catch { body = {}; }
        }
      }

      const query = querystring.parse(parsed.query || '');

      const ctx = {
        req,
        res,
        params: {},
        query,
        body,
        session: sesionDatos,
        redirigir(destino) {
          if (sidNueva) {
            res.setHeader('Set-Cookie', `sid=${sidNueva}; HttpOnly; Path=/; SameSite=Lax`);
          }
          res.writeHead(302, { Location: destino });
          res.end();
        },
        enviarCookieSesion() {
          if (sidNueva) {
            res.setHeader('Set-Cookie', `sid=${sidNueva}; HttpOnly; Path=/; SameSite=Lax`);
          }
        },
        destruirSesion() {
          if (sidExistente) destruirSesion(sidExistente);
          res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; Max-Age=0');
        },
        html(str, codigo = 200) {
          ctx.enviarCookieSesion();
          res.writeHead(codigo, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(str);
        },
        descargar(buffer, nombreArchivo, mime) {
          ctx.enviarCookieSesion();
          res.writeHead(200, {
            'Content-Type': mime,
            'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
            'Content-Length': buffer.length,
          });
          res.end(buffer);
        },
        estado(codigo) { res.statusCode = codigo; return ctx; },
      };

      const encontrada = router.encontrar(req.method, pathname);
      if (!encontrada) {
        ctx.enviarCookieSesion();
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404</h1><p>Pagina no encontrada.</p>');
        return;
      }
      ctx.params = encontrada.params;

      await encontrada.handler(ctx);
    } catch (err) {
      console.error('Error del servidor:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>Error interno</h1><pre>${String(err.stack || err)}</pre>`);
      }
    }
  });

  return { router, servidor };
}

module.exports = { crearApp };
