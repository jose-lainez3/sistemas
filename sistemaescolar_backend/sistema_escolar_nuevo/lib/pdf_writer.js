// ============================================================
// Generador de PDF muy simple, escrito a mano (formato PDF 1.4
// basico con texto y lineas), sin depender de ninguna libreria.
// Suficiente para reportes tabulares de una pagina o varias.
// ============================================================

class ReportePDF {
  constructor(titulo) {
    this.titulo = titulo;
    this.paginas = []; // cada una es un array de "comandos" de texto/lineas
    this._nuevaPagina();
  }

  _nuevaPagina() {
    this.pagina = { lineas: [], y: 780 };
    this.paginas.push(this.pagina);
  }

  _escapar(str) {
    return String(str ?? '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  _texto(x, y, texto, tamano = 10, negrita = false) {
    const fuente = negrita ? '/F2' : '/F1';
    this.pagina.lineas.push(`BT ${fuente} ${tamano} Tf ${x} ${y} Td (${this._escapar(texto)}) Tj ET`);
  }

  _linea(x1, y1, x2, y2) {
    this.pagina.lineas.push(`${x1} ${y1} m ${x2} ${y2} l S`);
  }

  tabla(columnas, filas) {
    const nombres = Object.keys(columnas);
    const anchoTotal = Object.values(columnas).reduce((a, b) => a + b, 0);
    const margenIzq = 40;
    const altoFila = 18;

    this._texto(margenIzq, 800, this.titulo, 14, true);
    this.pagina.y = 770;

    const dibujarEncabezado = () => {
      let x = margenIzq;
      this._texto(x, this.pagina.y, ' ', 8);
      nombres.forEach((nombre) => {
        this._texto(x + 2, this.pagina.y, nombre, 9, true);
        x += columnas[nombre];
      });
      this._linea(margenIzq, this.pagina.y - 4, margenIzq + anchoTotal, this.pagina.y - 4);
      this.pagina.y -= altoFila;
    };

    dibujarEncabezado();

    if (filas.length === 0) {
      this._texto(margenIzq, this.pagina.y, 'Sin datos para mostrar.', 10);
      this.pagina.y -= altoFila;
    }

    for (const fila of filas) {
      if (this.pagina.y < 60) {
        this._nuevaPagina();
        this.pagina.y = 800;
        dibujarEncabezado();
      }
      let x = margenIzq;
      nombres.forEach((nombre) => {
        const valor = fila[nombre] ?? '';
        this._texto(x + 2, this.pagina.y, String(valor), 9);
        x += columnas[nombre];
      });
      this.pagina.y -= altoFila;
    }
  }

  salida() {
    const objetos = [];
    const agregar = (contenido) => {
      objetos.push(contenido);
      return objetos.length;
    };

    const idFuenteNormal = agregar('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    const idFuenteNegrita = agregar('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

    const idsPaginas = [];
    const idsContenidos = [];
    for (const pagina of this.paginas) {
      const stream = pagina.lineas.join('\n');
      const idContenido = agregar(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
      idsContenidos.push(idContenido);
    }

    const idPaginasArbol = objetos.length + this.paginas.length + 1; // reservado luego

    this.paginas.forEach((_, i) => {
      const idPagina = agregar(
        `<< /Type /Page /Parent ${idPaginasArbol} 0 R /Resources << /Font << /F1 ${idFuenteNormal} 0 R /F2 ${idFuenteNegrita} 0 R >> >> /MediaBox [0 0 612 842] /Contents ${idsContenidos[i]} 0 R >>`
      );
      idsPaginas.push(idPagina);
    });

    const idArbol = agregar(
      `<< /Type /Pages /Kids [${idsPaginas.map((id) => `${id} 0 R`).join(' ')}] /Count ${idsPaginas.length} >>`
    );

    const idCatalogo = agregar(`<< /Type /Catalog /Pages ${idArbol} 0 R >>`);

    // Ensamblar el archivo PDF
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objetos.forEach((obj, i) => {
      offsets.push(Buffer.byteLength(pdf, 'latin1'));
      pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
    });
    const offsetXref = Buffer.byteLength(pdf, 'latin1');
    pdf += `xref\n0 ${objetos.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let i = 1; i <= objetos.length; i++) {
      pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objetos.length + 1} /Root ${idCatalogo} 0 R >>\nstartxref\n${offsetXref}\n%%EOF`;

    return Buffer.from(pdf, 'latin1');
  }
}

module.exports = { ReportePDF };
