import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface RespuestaApi<T> {
  success: boolean;
  data?: T;
  mensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class MatriculaService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/matricula';

  crear(alumnoId: number, cursoId: number): Observable<RespuestaApi<any>> {
    return this.http.post<RespuestaApi<any>>(this.baseUrl, {
      alumno_id: alumnoId,
      curso_id: cursoId
    });
  }
}