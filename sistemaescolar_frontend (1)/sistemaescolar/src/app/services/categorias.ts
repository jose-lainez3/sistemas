import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
}

interface RespuestaApi<T> {
  success: boolean;
  data?: T;
  mensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/categorias';

  listar(): Observable<RespuestaApi<Categoria[]>> {
    return this.http.get<RespuestaApi<Categoria[]>>(this.baseUrl);
  }

  crear(nombre: string, descripcion: string): Observable<RespuestaApi<any>> {
    return this.http.post<RespuestaApi<any>>(this.baseUrl, { nombre, descripcion });
  }

  eliminar(id: number): Observable<RespuestaApi<any>> {
    return this.http.delete<RespuestaApi<any>>(`${this.baseUrl}/${id}`);
  }
}
