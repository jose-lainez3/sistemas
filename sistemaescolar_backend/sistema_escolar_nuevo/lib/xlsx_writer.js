// ============================================================
// Generador de archivos .xlsx propio (Office Open XML minimo),
// sin depender de PhpSpreadsheet/exceljs/etc.
// ============================================================
const { ZipWriter } = require('./zip_writer');

function escaparXML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function columnaLetra(indice) {
  let letra = '';
  let n = indice;
  while (n >= 0) {
    letra = String.fromCharCode((n % 26) + 65) + letra;
    n = Math.floor(n / 26) - 1;
  }
  return letra;
}

class ReporteExcel {
  static generar(columnas, filas, nombreHoja = 'Reporte') {
    const zip = new ZipWriter();

    zip.agregar('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`);

    zip.agregar('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`);

    zip.agregar('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);

    zip.agregar('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${escaparXML(nombreHoja)}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`);

    zip.agregar('xl/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
</cellXfs>
</styleSheet>`);

    const filasXML = [];
    // Encabezado (fila 1, estilo negrita s="1")
    const celdasEncabezado = columnas
      .map((col, i) => `<c r="${columnaLetra(i)}1" t="inlineStr" s="1"><is><t>${escaparXML(col)}</t></is></c>`)
      .join('');
    filasXML.push(`<row r="1">${celdasEncabezado}</row>`);

    filas.forEach((fila, filaIdx) => {
      const numFila = filaIdx + 2;
      const celdas = columnas
        .map((col, i) => {
          const valor = fila[col] ?? '';
          const esNumero = typeof valor === 'number';
          if (esNumero) {
            return `<c r="${columnaLetra(i)}${numFila}"><v>${valor}</v></c>`;
          }
          return `<c r="${columnaLetra(i)}${numFila}" t="inlineStr"><is><t>${escaparXML(valor)}</t></is></c>`;
        })
        .join('');
      filasXML.push(`<row r="${numFila}">${celdas}</row>`);
    });

    zip.agregar('xl/worksheets/sheet1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData>${filasXML.join('')}</sheetData>
</worksheet>`);

    return zip.generar();
  }
}

module.exports = { ReporteExcel };
