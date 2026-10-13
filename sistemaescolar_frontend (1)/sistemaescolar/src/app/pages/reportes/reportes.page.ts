import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { ViewWillEnter } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonContent,
  IonItem, IonLabel, IonIcon, IonButton, IonSelect, IonSelectOption,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { documentTextOutline, printOutline, downloadOutline } from 'ionicons/icons';
import { CursosService, Curso } from '../../services/cursos';
import { ExportarService } from '../../services/exportar';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonItem, IonLabel, IonIcon, IonButton, IonSelect, IonSelectOption,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput
  ]
})
export class ReportesPage implements OnInit, ViewWillEnter {
  private cursosService = inject(CursosService);
  private exportarService = inject(ExportarService);
  private cdr = inject(ChangeDetectorRef);

  cursos: Curso[] = [];

  cursoAsistencia: number | null = null;
  desde: string = new Date().toISOString().slice(0, 10);
  hasta: string = new Date().toISOString().slice(0, 10);

  cursoNotas: number | null = null;
  materias = ['Matemática', 'Lenguaje', 'Ciencias', 'Sociales', 'Inglés', 'Educación Física'];
  materiaNotas = 'Matemática';
  periodos = ['Periodo 1', 'Periodo 2', 'Periodo 3', 'Periodo 4'];
  periodoNotas = 'Periodo 1';

  constructor() {
    addIcons({ documentTextOutline, printOutline, downloadOutline });
  }

  ngOnInit() { this.cargarCursos(); }
  ionViewWillEnter() { this.cargarCursos(); }

  cargarCursos() {
    this.cursosService.listar().subscribe({
      next: (r) => { if (r.success) { this.cursos = r.data || []; this.cdr.detectChanges(); } },
      error: (e) => console.error(e)
    });
  }

  descargarAlumnos(formato: 'pdf' | 'excel') { this.exportarService.alumnos(formato); }
  descargarCursos(formato: 'pdf' | 'excel') { this.exportarService.cursos(formato); }
  descargarInventario(formato: 'pdf' | 'excel') { this.exportarService.inventario(formato); }

  descargarAsistencia(formato: 'pdf' | 'excel') {
    if (!this.cursoAsistencia) { alert('Selecciona un curso.'); return; }
    this.exportarService.asistencia(formato, this.cursoAsistencia, this.desde, this.hasta);
  }

  descargarNotas(formato: 'pdf' | 'excel') {
    if (!this.cursoNotas) { alert('Selecciona un curso.'); return; }
    this.exportarService.notas(formato, this.cursoNotas, this.materiaNotas, this.periodoNotas);
  }
}
