import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Alumno {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string | null;
  fecha_nacimiento: string | null;
  direccion: string;
  telefono: string;
  nombre_encargado: string;
  telefono_encargado: string;
  creado_en: string;
}

interface RespuestaApi<T> {
  success: boolean;
  data: T;
  mensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class AlumnosService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/alumnos';

  listar(): Observable<RespuestaApi<Alumno[]>> {
    return this.http.get<RespuestaApi<Alumno[]>>(this.baseUrl);
  }

  crear(alumno: Partial<Alumno>): Observable<any> {
    return this.http.post<any>(this.baseUrl, alumno);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}