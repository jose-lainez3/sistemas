// ============================================================
// Motor de plantillas minimalista (sintaxis estilo EJS) escrito
// sin dependencias externas:
//   <%= expr %>   -> imprime con escape HTML
//   <%- expr %>   -> imprime sin escape (HTML crudo)
//   <% code %>    -> ejecuta codigo JS (if/for/etc)
//   incluir('partials/nombre', datos) -> incluye otra plantilla
// ============================================================
const fs = require('node:fs');
const path = require('node:path');

const VISTAS_DIR = path.join(__dirname, '..', 'views');
const cache = new Map();

function escaparHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function compilar(plantillaStr) {
  let js = 'let __out = [];\n';
  js += 'with (__datos) {\n';

  const regex = /<%(-|=)?([\s\S]+?)%>/g;
  let ultimo = 0;
  let m;
  while ((m = regex.exec(plantillaStr)) !== null) {
    const textoPlano = plantillaStr.slice(ultimo, m.index);
    if (textoPlano) js += `__out.push(${JSON.stringify(textoPlano)});\n`;

    const tipo = m[1];
    const codigo = m[2];

    if (tipo === '=') {
      js += `__out.push(__esc(${codigo.trim()}));\n`;
    } else if (tipo === '-') {
      js += `__out.push((${codigo.trim()}) === undefined || (${codigo.trim()}) === null ? '' : (${codigo.trim()}));\n`;
    } else {
      js += `${codigo}\n`;
    }
    ultimo = regex.lastIndex;
  }
  const resto = plantillaStr.slice(ultimo);
  if (resto) js += `__out.push(${JSON.stringify(resto)});\n`;

  js += '}\nreturn __out.join("");';
  // eslint-disable-next-line no-new-func
  return new Function('__datos', '__esc', 'incluir', js);
}

function cargarPlantilla(nombreRelativo) {
  const archivo = path.join(VISTAS_DIR, nombreRelativo.endsWith('.html') ? nombreRelativo : `${nombreRelativo}.html`);
  if (cache.has(archivo)) return cache.get(archivo);
  const contenido = fs.readFileSync(archivo, 'utf8');
  const fn = compilar(contenido);
  cache.set(archivo, fn);
  return fn;
}

function render(nombreVista, datos = {}) {
  function incluir(nombreParcial, datosExtra = {}) {
    const fnParcial = cargarPlantilla(nombreParcial);
    return fnParcial({ ...datos, ...datosExtra }, escaparHTML, incluir);
  }
  const fn = cargarPlantilla(nombreVista);
  return fn(datos, escaparHTML, incluir);
}

module.exports = { render, escaparHTML };
