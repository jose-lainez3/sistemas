import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout, catchError, of } from 'rxjs';
import type { ViewWillEnter } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonContent,
  IonList, IonItem, IonLabel, IonIcon, IonButton, IonInput, IonFab, IonFabButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, trashOutline, close, save, alertCircleOutline, schoolOutline } from 'ionicons/icons';
import { CursosService, Curso } from '../../services/cursos';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.page.html',
  styleUrls: ['./cursos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonList, IonItem, IonLabel, IonIcon, IonButton, IonInput, IonFab, IonFabButton,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle
  ]
})
export class CursosPage implements OnInit, ViewWillEnter {
  private cursosService = inject(CursosService);
  private cdr = inject(ChangeDetectorRef);

  cursos: Curso[] = [];
  cargando = false;
  errorCarga: string | null = null;
  mostrarFormulario = false;

  nuevoCurso = { nombre: '', anio_lectivo: new Date().getFullYear() };

  constructor() {
    addIcons({ add, trashOutline, close, save, alertCircleOutline, schoolOutline });
  }

  ngOnInit() { this.cargarCursos(); }
  ionViewWillEnter() { this.cargarCursos(); }

  cargarCursos() {
    this.cargando = true;
    this.errorCarga = null;
    this.cursosService.listar().pipe(
      timeout(8000),
      catchError((error) => {
        console.error(error);
        this.errorCarga = 'No se pudo conectar con el servidor.';
        return of(null);
      }),
      finalize(() => { this.cargando = false; this.cdr.detectChanges(); })
    ).subscribe((respuesta) => {
      if (respuesta && respuesta.success) {
        this.cursos = respuesta.data || [];
        this.cdr.detectChanges();
      }
    });
  }

  abrirFormulario() { this.mostrarFormulario = true; }
  cancelar() {
    this.mostrarFormulario = false;
    this.nuevoCurso = { nombre: '', anio_lectivo: new Date().getFullYear() };
  }

  guardarCurso() {
    if (!this.nuevoCurso.nombre.trim()) return;
    this.cursosService.crear(this.nuevoCurso.nombre, this.nuevoCurso.anio_lectivo).subscribe({
      next: (respuesta) => {
        if (respuesta.success) { this.cancelar(); this.cargarCursos(); }
      },
      error: (error) => console.error('Error al crear curso:', error)
    });
  }

  eliminarCurso(curso: Curso) {
    if (!confirm(`¿Eliminar el curso ${curso.nombre}?`)) return;
    this.cursosService.eliminar(curso.id).subscribe({
      next: (respuesta) => { if (respuesta.success) this.cargarCursos(); },
      error: (error) => console.error('Error al eliminar:', error)
    });
  }
}
