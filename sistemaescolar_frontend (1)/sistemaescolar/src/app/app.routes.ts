import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
  },
  {
    path: 'alumnos',
    loadComponent: () => import('./pages/alumnos/alumnos.page').then(m => m.AlumnosPage)
  },
  {
    path: 'matricula',
    loadComponent: () => import('./pages/matricula/matricula.page').then(m => m.MatriculaPage)
  },
  {
    path: 'cursos',
    loadComponent: () => import('./pages/cursos/cursos.page').then(m => m.CursosPage)
  },
  {
    path: 'categorias',
    loadComponent: () => import('./pages/categorias/categorias.page').then(m => m.CategoriasPage)
  },
  {
    path: 'inventario',
    loadComponent: () => import('./pages/inventario/inventario.page').then(m => m.InventarioPage)
  },
  {
    path: 'asistencia',
    loadComponent: () => import('./pages/asistencia/asistencia.page').then(m => m.AsistenciaPage)
  },
  {
    path: 'notas',
    loadComponent: () => import('./pages/notas/notas.page').then(m => m.NotasPage)
  },
  {
    path: 'reportes',
    loadComponent: () => import('./pages/reportes/reportes.page').then(m => m.ReportesPage)
  },
];
