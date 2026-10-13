import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Nota {
  alumno_id: number;
  nombres?: string;
  apellidos?: string;
  nota: number | null;
}

interface RespuestaApi<T> {
  success: boolean;
  data?: T;
  mensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class NotasService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/notas';

  obtener(cursoId: number, materia: string, periodo: string): Observable<RespuestaApi<Nota[]>> {
    return this.http.get<RespuestaApi<Nota[]>>(
      `${this.baseUrl}?curso_id=${cursoId}&materia=${encodeURIComponent(materia)}&periodo=${encodeURIComponent(periodo)}`
    );
  }

  guardar(cursoId: number, materia: string, periodo: string, notas: Nota[]): Observable<RespuestaApi<any>> {
    return this.http.post<RespuestaApi<any>>(this.baseUrl, {
      curso_id: cursoId,
      materia,
      periodo,
      notas
    });
  }
}
