// ============================================================
// Escritor ZIP minimalista (metodo STORE, sin compresion) hecho
// a mano para poder generar archivos .xlsx sin dependencias.
// Un xlsx valido no requiere que las entradas esten comprimidas.
// ============================================================
const zlib = require('node:zlib');

class ZipWriter {
  constructor() {
    this.entradas = []; // { nombre, datos }
  }

  agregar(nombre, contenidoStr) {
    this.entradas.push({ nombre, datos: Buffer.from(contenidoStr, 'utf8') });
  }

  _crc32(buf) {
    let crc = ~0;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
      }
    }
    return (~crc) >>> 0;
  }

  generar() {
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    for (const entrada of this.entradas) {
      const nombreBuf = Buffer.from(entrada.nombre, 'utf8');
      const crc = this._crc32(entrada.datos);
      const tamano = entrada.datos.length;

      const localHeader = Buffer.alloc(30);
      localHeader.writeUInt32LE(0x04034b50, 0);
      localHeader.writeUInt16LE(20, 4);
      localHeader.writeUInt16LE(0, 6);
      localHeader.writeUInt16LE(0, 8); // sin compresion
      localHeader.writeUInt16LE(0, 10);
      localHeader.writeUInt16LE(0, 12);
      localHeader.writeUInt32LE(crc, 14);
      localHeader.writeUInt32LE(tamano, 18);
      localHeader.writeUInt32LE(tamano, 22);
      localHeader.writeUInt16LE(nombreBuf.length, 26);
      localHeader.writeUInt16LE(0, 28);

      localParts.push(localHeader, nombreBuf, entrada.datos);

      const centralHeader = Buffer.alloc(46);
      centralHeader.writeUInt32LE(0x02014b50, 0);
      centralHeader.writeUInt16LE(20, 4);
      centralHeader.writeUInt16LE(20, 6);
      centralHeader.writeUInt16LE(0, 8);
      centralHeader.writeUInt16LE(0, 10);
      centralHeader.writeUInt16LE(0, 12);
      centralHeader.writeUInt32LE(crc, 16);
      centralHeader.writeUInt32LE(tamano, 20);
      centralHeader.writeUInt32LE(tamano, 24);
      centralHeader.writeUInt16LE(nombreBuf.length, 28);
      centralHeader.writeUInt16LE(0, 30);
      centralHeader.writeUInt16LE(0, 32);
      centralHeader.writeUInt16LE(0, 34);
      centralHeader.writeUInt16LE(0, 36);
      centralHeader.writeUInt32LE(0, 38);
      centralHeader.writeUInt32LE(offset, 42);

      centralParts.push(centralHeader, nombreBuf);

      offset += localHeader.length + nombreBuf.length + entrada.datos.length;
    }

    const centralBuf = Buffer.concat(centralParts);
    const localBuf = Buffer.concat(localParts);

    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(0, 4);
    end.writeUInt16LE(0, 6);
    end.writeUInt16LE(this.entradas.length, 8);
    end.writeUInt16LE(this.entradas.length, 10);
    end.writeUInt32LE(centralBuf.length, 12);
    end.writeUInt32LE(localBuf.length, 16);
    end.writeUInt16LE(0, 20);

    return Buffer.concat([localBuf, centralBuf, end]);
  }
}

module.exports = { ZipWriter };
