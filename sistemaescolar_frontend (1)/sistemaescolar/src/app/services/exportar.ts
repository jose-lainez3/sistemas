import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ExportarService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/reportes';

  /**
   * Pide al backend el reporte ya generado (PDF real o Excel real, sin dependencias
   * en el navegador) y dispara la descarga del archivo en el dispositivo.
   */
  private descargar(endpoint: string, params: Record<string, string | number>, formato: 'pdf' | 'excel', nombreArchivo: string) {
    const query = new URLSearchParams({ ...params as any, formato }).toString();
    const url = `${this.baseUrl}/${endpoint}?${query}`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const extension = formato === 'excel' ? 'xlsx' : 'pdf';
        const link = document.createElement('a');
        const objectUrl = window.URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = `${nombreArchivo}.${extension}`;
        link.click();
        window.URL.revokeObjectURL(objectUrl);
      },
      error: (error) => {
        console.error('Error al descargar el reporte:', error);
        alert('No se pudo generar el reporte. Verifica tu conexión con el servidor.');
      }
    });
  }

  alumnos(formato: 'pdf' | 'excel') {
    this.descargar('alumnos', {}, formato, 'alumnos');
  }

  cursos(formato: 'pdf' | 'excel') {
    this.descargar('cursos', {}, formato, 'cursos');
  }

  inventario(formato: 'pdf' | 'excel') {
    this.descargar('inventario', {}, formato, 'inventario');
  }

  asistencia(formato: 'pdf' | 'excel', cursoId: number, desde: string, hasta: string) {
    this.descargar('asistencia', { curso_id: cursoId, desde, hasta }, formato, 'asistencia');
  }

  notas(formato: 'pdf' | 'excel', cursoId: number, materia: string, periodo: string) {
    this.descargar('notas', { curso_id: cursoId, materia, periodo }, formato, 'notas');
  }
}
