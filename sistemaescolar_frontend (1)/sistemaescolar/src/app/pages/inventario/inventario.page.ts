import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout, catchError, forkJoin, of } from 'rxjs';
import type { ViewWillEnter } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonContent,
  IonList, IonItem, IonLabel, IonIcon, IonButton, IonInput, IonFab, IonFabButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonSelect, IonSelectOption,
  IonTextarea, IonBadge
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, trashOutline, close, save, alertCircleOutline, cubeOutline, createOutline } from 'ionicons/icons';
import { InventarioService, ItemInventario } from '../../services/inventario';
import { CategoriasService, Categoria } from '../../services/categorias';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonList, IonItem, IonLabel, IonIcon, IonButton, IonInput, IonFab, IonFabButton,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonSelect, IonSelectOption,
    IonTextarea, IonBadge
  ]
})
export class InventarioPage implements OnInit, ViewWillEnter {
  private inventarioService = inject(InventarioService);
  private categoriasService = inject(CategoriasService);
  private cdr = inject(ChangeDetectorRef);

  items: ItemInventario[] = [];
  categorias: Categoria[] = [];
  cargando = false;
  errorCarga: string | null = null;
  mostrarFormulario = false;
  editandoId: number | null = null;

  estados = ['bueno', 'regular', 'dañado', 'de baja'];

  itemActual: Partial<ItemInventario> = this.itemVacio();

  constructor() {
    addIcons({ add, trashOutline, close, save, alertCircleOutline, cubeOutline, createOutline });
  }

  itemVacio(): Partial<ItemInventario> {
    return { nombre: '', categoria_id: undefined, cantidad: 1, estado: 'bueno', ubicacion: '', observaciones: '' };
  }

  ngOnInit() { this.cargarDatos(); }
  ionViewWillEnter() { this.cargarDatos(); }

  cargarDatos() {
    this.cargando = true;
    this.errorCarga = null;
    forkJoin({
      items: this.inventarioService.listar(),
      categorias: this.categoriasService.listar()
    }).pipe(
      timeout(8000),
      catchError((error) => {
        console.error(error);
        this.errorCarga = 'No se pudo conectar con el servidor.';
        return of(null);
      }),
      finalize(() => { this.cargando = false; this.cdr.detectChanges(); })
    ).subscribe((resultado) => {
      if (resultado) {
        if (resultado.items.success) this.items = resultado.items.data || [];
        if (resultado.categorias.success) this.categorias = resultado.categorias.data || [];
        this.cdr.detectChanges();
      }
    });
  }

  abrirFormulario() {
    this.editandoId = null;
    this.itemActual = this.itemVacio();
    this.mostrarFormulario = true;
  }

  editarItem(item: ItemInventario) {
    this.editandoId = item.id;
    this.itemActual = { ...item };
    this.mostrarFormulario = true;
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.editandoId = null;
    this.itemActual = this.itemVacio();
  }

  guardarItem() {
    if (!this.itemActual.nombre?.trim() || !this.itemActual.categoria_id) return;

    const obs = this.editandoId
      ? this.inventarioService.actualizar(this.editandoId, this.itemActual)
      : this.inventarioService.crear(this.itemActual);

    obs.subscribe({
      next: (respuesta) => {
        if (respuesta.success) { this.cancelar(); this.cargarDatos(); }
      },
      error: (error) => console.error('Error al guardar item:', error)
    });
  }

  eliminarItem(item: ItemInventario) {
    if (!confirm(`¿Eliminar "${item.nombre}" del inventario?`)) return;
    this.inventarioService.eliminar(item.id).subscribe({
      next: (respuesta) => { if (respuesta.success) this.cargarDatos(); },
      error: (error) => console.error('Error al eliminar:', error)
    });
  }

  colorEstado(estado: string): string {
    switch (estado) {
      case 'bueno': return 'success';
      case 'regular': return 'warning';
      case 'dañado': return 'danger';
      case 'de baja': return 'medium';
      default: return 'medium';
    }
  }
}
