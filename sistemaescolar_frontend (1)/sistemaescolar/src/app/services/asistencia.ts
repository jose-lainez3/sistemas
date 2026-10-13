import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegistroAsistencia {
  alumno_id: number;
  nombres?: string;
  apellidos?: string;
  estado: 'presente' | 'ausente' | 'tarde' | 'justificado';
}

interface RespuestaApi<T> {
  success: boolean;
  data?: T;
  mensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/asistencia';

  /** Trae la lista de alumnos de un curso con su estado de asistencia (si ya existe) para una fecha */
  obtenerPorCursoYFecha(cursoId: number, fecha: string): Observable<RespuestaApi<RegistroAsistencia[]>> {
    return this.http.get<RespuestaApi<RegistroAsistencia[]>>(
      `${this.baseUrl}?curso_id=${cursoId}&fecha=${fecha}`
    );
  }

  guardar(cursoId: number, fecha: string, registros: RegistroAsistencia[]): Observable<RespuestaApi<any>> {
    return this.http.post<RespuestaApi<any>>(this.baseUrl, {
      curso_id: cursoId,
      fecha,
      registros
    });
  }

  /** Historial de asistencia de un curso en un rango de fechas, para reportes */
  historial(cursoId: number, desde: string, hasta: string): Observable<RespuestaApi<any[]>> {
    return this.http.get<RespuestaApi<any[]>>(
      `${this.baseUrl}/historial?curso_id=${cursoId}&desde=${desde}&hasta=${hasta}`
    );
  }
}
