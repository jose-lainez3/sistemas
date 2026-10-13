import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout, catchError, of } from 'rxjs';
import type { ViewWillEnter } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonContent,
  IonList, IonItem, IonLabel, IonIcon, IonButton, IonInput, IonFab, IonFabButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonTextarea
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, trashOutline, close, save, alertCircleOutline, pricetagsOutline } from 'ionicons/icons';
import { CategoriasService, Categoria } from '../../services/categorias';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.page.html',
  styleUrls: ['./categorias.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonList, IonItem, IonLabel, IonIcon, IonButton, IonInput, IonFab, IonFabButton,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonTextarea
  ]
})
export class CategoriasPage implements OnInit, ViewWillEnter {
  private categoriasService = inject(CategoriasService);
  private cdr = inject(ChangeDetectorRef);

  categorias: Categoria[] = [];
  cargando = false;
  errorCarga: string | null = null;
  mostrarFormulario = false;

  nuevaCategoria = { nombre: '', descripcion: '' };

  constructor() {
    addIcons({ add, trashOutline, close, save, alertCircleOutline, pricetagsOutline });
  }

  ngOnInit() { this.cargarCategorias(); }
  ionViewWillEnter() { this.cargarCategorias(); }

  cargarCategorias() {
    this.cargando = true;
    this.errorCarga = null;
    this.categoriasService.listar().pipe(
      timeout(8000),
      catchError((error) => {
        console.error(error);
        this.errorCarga = 'No se pudo conectar con el servidor.';
        return of(null);
      }),
      finalize(() => { this.cargando = false; this.cdr.detectChanges(); })
    ).subscribe((respuesta) => {
      if (respuesta && respuesta.success) {
        this.categorias = respuesta.data || [];
        this.cdr.detectChanges();
      }
    });
  }

  abrirFormulario() { this.mostrarFormulario = true; }
  cancelar() {
    this.mostrarFormulario = false;
    this.nuevaCategoria = { nombre: '', descripcion: '' };
  }

  guardarCategoria() {
    if (!this.nuevaCategoria.nombre.trim()) return;
    this.categoriasService.crear(this.nuevaCategoria.nombre, this.nuevaCategoria.descripcion).subscribe({
      next: (respuesta) => {
        if (respuesta.success) { this.cancelar(); this.cargarCategorias(); }
      },
      error: (error) => console.error('Error al crear categoría:', error)
    });
  }

  eliminarCategoria(categoria: Categoria) {
    if (!confirm(`¿Eliminar la categoría ${categoria.nombre}?`)) return;
    this.categoriasService.eliminar(categoria.id).subscribe({
      next: (respuesta) => { if (respuesta.success) this.cargarCategorias(); },
      error: (error) => console.error('Error al eliminar:', error)
    });
  }
}
