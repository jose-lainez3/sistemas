import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ItemInventario {
  id: number;
  nombre: string;
  categoria_id: number;
  categoria_nombre?: string;
  cantidad: number;
  estado: string;
  ubicacion: string | null;
  observaciones: string | null;
  creado_en?: string;
}

interface RespuestaApi<T> {
  success: boolean;
  data?: T;
  mensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/inventario';

  listar(): Observable<RespuestaApi<ItemInventario[]>> {
    return this.http.get<RespuestaApi<ItemInventario[]>>(this.baseUrl);
  }

  crear(item: Partial<ItemInventario>): Observable<RespuestaApi<any>> {
    return this.http.post<RespuestaApi<any>>(this.baseUrl, item);
  }

  actualizar(id: number, item: Partial<ItemInventario>): Observable<RespuestaApi<any>> {
    return this.http.put<RespuestaApi<any>>(`${this.baseUrl}/${id}`, item);
  }

  eliminar(id: number): Observable<RespuestaApi<any>> {
    return this.http.delete<RespuestaApi<any>>(`${this.baseUrl}/${id}`);
  }
}
