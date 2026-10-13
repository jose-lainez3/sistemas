// ============================================================
// El parser basico de querystring de Node no anida claves como
// PHP: "estado[5]=presente" llega como la clave literal
// "estado[5]" en vez de un objeto { estado: { '5': ... } }.
// Esta funcion reconstruye ese mapa: dado el body y el nombre
// base ("estado"), devuelve { '5': 'presente', '6': 'ausente' }.
// ============================================================
function extraerMapa(body, nombreCampo) {
  const mapa = {};
  const prefijo = `${nombreCampo}[`;
  for (const clave of Object.keys(body)) {
    if (clave.startsWith(prefijo) && clave.endsWith(']')) {
      const idInterno = clave.slice(prefijo.length, -1);
      mapa[idInterno] = body[clave];
    }
  }
  return mapa;
}

module.exports = { extraerMapa };
