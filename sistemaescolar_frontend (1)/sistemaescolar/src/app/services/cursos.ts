import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Curso {
  id: number;
  nombre: string;
  anio_lectivo: number;
}

interface RespuestaApi<T> {
  success: boolean;
  data?: T;
  mensaje?: string;
  id_nuevo?: number;
}

@Injectable({ providedIn: 'root' })
export class CursosService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/cursos';

  listar(): Observable<RespuestaApi<Curso[]>> {
    return this.http.get<RespuestaApi<Curso[]>>(this.baseUrl);
  }

  crear(nombre: string, anio_lectivo: number): Observable<RespuestaApi<any>> {
    return this.http.post<RespuestaApi<any>>(this.baseUrl, { nombre, anio_lectivo });
  }

  eliminar(id: number): Observable<RespuestaApi<any>> {
    return this.http.delete<RespuestaApi<any>>(`${this.baseUrl}/${id}`);
  }
}
