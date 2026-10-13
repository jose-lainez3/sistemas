import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout, catchError, of } from 'rxjs';
import type { ViewWillEnter } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonContent,
  IonList, IonItem, IonLabel, IonIcon, IonButton, IonSelect, IonSelectOption,
  IonSegment, IonSegmentButton, IonInput
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline, alertCircleOutline, saveOutline, calendarOutline } from 'ionicons/icons';
import { CursosService, Curso } from '../../services/cursos';
import { AsistenciaService, RegistroAsistencia } from '../../services/asistencia';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonList, IonItem, IonLabel, IonIcon, IonButton, IonSelect, IonSelectOption,
    IonSegment, IonSegmentButton, IonInput
  ]
})
export class AsistenciaPage implements OnInit, ViewWillEnter {
  private cursosService = inject(CursosService);
  private asistenciaService = inject(AsistenciaService);
  private cdr = inject(ChangeDetectorRef);

  cursos: Curso[] = [];
  cursoSeleccionado: number | null = null;
  fecha: string = new Date().toISOString().slice(0, 10);

  registros: RegistroAsistencia[] = [];
  cargando = false;
  guardando = false;
  errorCarga: string | null = null;
  mensajeExito: string | null = null;

  constructor() {
    addIcons({ checkmarkDoneOutline, alertCircleOutline, saveOutline, calendarOutline });
  }

  ngOnInit() { this.cargarCursos(); }
  ionViewWillEnter() { this.cargarCursos(); }

  cargarCursos() {
    this.cursosService.listar().subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          this.cursos = respuesta.data || [];
          this.cdr.detectChanges();
        }
      },
      error: (error) => console.error(error)
    });
  }

  onCambioSeleccion() {
    if (this.cursoSeleccionado && this.fecha) {
      this.cargarAsistencia();
    }
  }

  cargarAsistencia() {
    if (!this.cursoSeleccionado) return;
    this.cargando = true;
    this.errorCarga = null;
    this.mensajeExito = null;

    this.asistenciaService.obtenerPorCursoYFecha(this.cursoSeleccionado, this.fecha).pipe(
      timeout(8000),
      catchError((error) => {
        console.error(error);
        this.errorCarga = 'No se pudo conectar con el servidor.';
        return of(null);
      }),
      finalize(() => { this.cargando = false; this.cdr.detectChanges(); })
    ).subscribe((respuesta) => {
      if (respuesta && respuesta.success) {
        this.registros = respuesta.data || [];
        this.cdr.detectChanges();
      }
    });
  }

  marcarTodos(estado: 'presente' | 'ausente') {
    this.registros = this.registros.map(r => ({ ...r, estado }));
  }

  guardarAsistencia() {
    if (!this.cursoSeleccionado) return;
    this.guardando = true;
    this.mensajeExito = null;

    this.asistenciaService.guardar(this.cursoSeleccionado, this.fecha, this.registros).pipe(
      finalize(() => { this.guardando = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          this.mensajeExito = 'Asistencia guardada correctamente.';
          this.cdr.detectChanges();
        }
      },
      error: (error) => console.error('Error al guardar asistencia:', error)
    });
  }
}
