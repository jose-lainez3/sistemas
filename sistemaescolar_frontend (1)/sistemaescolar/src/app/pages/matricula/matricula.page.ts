import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize, timeout, catchError, forkJoin, of } from 'rxjs';
import type { ViewWillEnter } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent,
  IonList, IonItem, IonIcon, IonSelect, IonSelectOption, IonButton, IonLabel
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { personOutline, bookOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { AlumnosService, Alumno } from '../../services/alumnos';
import { CursosService, Curso } from '../../services/cursos';
import { MatriculaService } from '../../services/matricula';

@Component({
  selector: 'app-matricula',
  templateUrl: './matricula.page.html',
  styleUrls: ['./matricula.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent,
    IonList, IonItem, IonIcon, IonSelect, IonSelectOption, IonButton, IonLabel
  ]
})
export class MatriculaPage implements OnInit, ViewWillEnter {
  private fb = inject(FormBuilder);
  private alumnosService = inject(AlumnosService);
  private cursosService = inject(CursosService);
  private matriculaService = inject(MatriculaService);
  private cdr = inject(ChangeDetectorRef);

  matriculaForm!: FormGroup;

  alumnos: Alumno[] = [];
  cursos: Curso[] = [];

  cargando = false;
  errorCarga: string | null = null;

  enviando = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor() {
    addIcons({ personOutline, bookOutline, checkmarkCircleOutline, alertCircleOutline });
  }

  ngOnInit() {
    this.matriculaForm = this.fb.group({
      alumnoId: ['', Validators.required],
      cursoId: ['', Validators.required]
    });
    this.cargarDatos();
  }

  ionViewWillEnter() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.errorCarga = null;

    forkJoin({
      alumnos: this.alumnosService.listar(),
      cursos: this.cursosService.listar()
    }).pipe(
      timeout(8000),
      catchError((error) => {
        console.error('Error al cargar alumnos/cursos:', error);
        this.errorCarga = 'No se pudo conectar con el servidor.';
        return of(null);
      }),
      finalize(() => {
        this.cargando = false;
        this.cdr.detectChanges();
      })
    ).subscribe((resultado) => {
      if (resultado) {
        if (resultado.alumnos.success) this.alumnos = resultado.alumnos.data || [];
        if (resultado.cursos.success) this.cursos = resultado.cursos.data || [];
        this.cdr.detectChanges();
      }
    });
  } // <-- AQUÍ FALTABA ESTA LLAVE PARA CERRAR cargarDatos()

  matricular() {
    if (this.matriculaForm.invalid) return;

    this.enviando = true;
    this.mensajeExito = null;
    this.mensajeError = null;

    const datosMatricula = this.matriculaForm.value;

    // Llamamos al servicio pasando los IDs separados
    this.matriculaService.crear(datosMatricula.alumnoId, datosMatricula.cursoId).pipe(
      timeout(8000),
      catchError(error => {
        console.error('Error al matricular:', error);
        this.mensajeError = 'Error al registrar la matrícula.';
        return of(null);
      }),
      finalize(() => {
        this.enviando = false;
        this.cdr.detectChanges();
      })
    ).subscribe(resultado => {
      if (resultado && resultado.success) {
        this.mensajeExito = 'Matrícula guardada exitosamente.';
        this.matriculaForm.reset();
      } else if (resultado) {
        this.mensajeError = resultado.mensaje || 'Error desconocido al matricular.';
      }
    });
  }
} // <-- Y AQUÍ FALTABA ESTA LLAVE PARA CERRAR LA CLASE MatriculaPage