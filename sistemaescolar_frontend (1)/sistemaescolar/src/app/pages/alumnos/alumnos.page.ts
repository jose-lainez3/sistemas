import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonContent, IonFab, IonFabButton, IonHeader, IonIcon,
  IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonSearchbar,
  IonTitle, IonToolbar
} from '@ionic/angular';
import type { ViewWillEnter } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, pencilOutline, trashOutline, close, save } from 'ionicons/icons';
import { AlumnosService, Alumno } from '../../services/alumnos';  

@Component({
  selector: 'app-alumnos',
  templateUrl: './alumnos.page.html',
  styleUrls: ['./alumnos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle,
    IonToolbar, IonButtons, IonMenuButton, IonList, IonItem,
    IonLabel, IonAvatar, IonSearchbar, IonFab, IonFabButton,
    IonIcon, IonButton, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardTitle
  ]
})
export class AlumnosPage implements OnInit, ViewWillEnter {
  private alumnosService = inject(AlumnosService);
  private cdr = inject(ChangeDetectorRef);  

  alumnos: Alumno[] = [];
  alumnosFiltrados: Alumno[] = [];
  cargando = false;
  errorCarga: string | null = null;

  mostrarFormulario = false;

  nuevoAlumno = {
    nombres: '',
    apellidos: '',
    dni: '',
    telefono: ''
  };

  constructor() {
    addIcons({ add, pencilOutline, trashOutline, close, save });
  }

  ngOnInit() {
    this.cargarAlumnos();
  }

  ionViewWillEnter() {
    this.cargarAlumnos();
  }

  cargarAlumnos() {
    this.cargando = true;
    this.errorCarga = null;

    this.alumnosService.listar().pipe(
      timeout(8000), // si no responde en 8s, cae al catchError
      catchError((error) => {
        console.error('[AlumnosPage] error/timeout al cargar:', error);
        this.errorCarga = 'No se pudo conectar con el servidor.';
        return of(null);
      }),
      finalize(() => {
        this.cargando = false;
         this.cdr.detectChanges();   // <-- forzar refresco
      })
    ).subscribe((respuesta) => {
      if (respuesta && respuesta.success) {
        this.alumnos = respuesta.data;
        this.alumnosFiltrados = respuesta.data;
        this.cdr.detectChanges();   // <-- forzar refresco
      }
    });
  }

  filtrarAlumnos(event: any) {
    const texto = (event.target.value || '').toLowerCase().trim();
    if (!texto) {
      this.alumnosFiltrados = this.alumnos;
      return;
    }
    this.alumnosFiltrados = this.alumnos.filter(a =>
      a.nombres?.toLowerCase().includes(texto) ||
      a.apellidos?.toLowerCase().includes(texto) ||
      a.dni?.toLowerCase().includes(texto)
    );
  }

  eliminarAlumno(alumno: Alumno) {
    if (!confirm(`¿Eliminar a ${alumno.nombres} ${alumno.apellidos}?`)) return;

    this.alumnosService.eliminar(alumno.id).subscribe({
      next: (respuesta) => {
        if (respuesta.success) this.cargarAlumnos();
      },
      error: (error) => console.error('Error al eliminar:', error)
    });
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.nuevoAlumno = { nombres: '', apellidos: '', dni: '', telefono: '' };
  }

  guardarAlumno() {
    this.alumnosService.crear(this.nuevoAlumno).subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          this.cancelar();
          this.cargarAlumnos();
        }
      },
      error: (error) => console.error('Error al guardar:', error)
    });
  }
}