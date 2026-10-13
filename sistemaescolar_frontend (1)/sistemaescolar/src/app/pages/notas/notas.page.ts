import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout, catchError, of } from 'rxjs';
import type { ViewWillEnter } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonContent,
  IonList, IonItem, IonLabel, IonIcon, IonButton, IonSelect, IonSelectOption, IonInput
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { bookOutline, alertCircleOutline, saveOutline } from 'ionicons/icons';
import { CursosService, Curso } from '../../services/cursos';
import { NotasService, Nota } from '../../services/notas';

@Component({
  selector: 'app-notas',
  templateUrl: './notas.page.html',
  styleUrls: ['./notas.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonList, IonItem, IonLabel, IonIcon, IonButton, IonSelect, IonSelectOption, IonInput
  ]
})
export class NotasPage implements OnInit, ViewWillEnter {
  private cursosService = inject(CursosService);
  private notasService = inject(NotasService);
  private cdr = inject(ChangeDetectorRef);

  cursos: Curso[] = [];
  cursoSeleccionado: number | null = null;

  materias = ['Matemática', 'Lenguaje', 'Ciencias', 'Sociales', 'Inglés', 'Educación Física'];
  materiaSeleccionada = 'Matemática';

  periodos = ['Periodo 1', 'Periodo 2', 'Periodo 3', 'Periodo 4'];
  periodoSeleccionado = 'Periodo 1';

  notas: Nota[] = [];
  cargando = false;
  guardando = false;
  errorCarga: string | null = null;
  mensajeExito: string | null = null;

  constructor() {
    addIcons({ bookOutline, alertCircleOutline, saveOutline });
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
    if (this.cursoSeleccionado && this.materiaSeleccionada && this.periodoSeleccionado) {
      this.cargarNotas();
    }
  }

  cargarNotas() {
    if (!this.cursoSeleccionado) return;
    this.cargando = true;
    this.errorCarga = null;
    this.mensajeExito = null;

    this.notasService.obtener(this.cursoSeleccionado, this.materiaSeleccionada, this.periodoSeleccionado).pipe(
      timeout(8000),
      catchError((error) => {
        console.error(error);
        this.errorCarga = 'No se pudo conectar con el servidor.';
        return of(null);
      }),
      finalize(() => { this.cargando = false; this.cdr.detectChanges(); })
    ).subscribe((respuesta) => {
      if (respuesta && respuesta.success) {
        this.notas = respuesta.data || [];
        this.cdr.detectChanges();
      }
    });
  }

  guardarNotas() {
    if (!this.cursoSeleccionado) return;
    this.guardando = true;
    this.mensajeExito = null;

    this.notasService.guardar(this.cursoSeleccionado, this.materiaSeleccionada, this.periodoSeleccionado, this.notas).pipe(
      finalize(() => { this.guardando = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          this.mensajeExito = 'Notas guardadas correctamente.';
          this.cdr.detectChanges();
        }
      },
      error: (error) => console.error('Error al guardar notas:', error)
    });
  }
}
