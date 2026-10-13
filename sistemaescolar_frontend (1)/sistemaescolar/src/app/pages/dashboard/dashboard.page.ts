import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonIcon, IonGrid, IonRow, IonCol
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  peopleOutline, schoolOutline, checkmarkDoneOutline, cubeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonButton, IonIcon, IonGrid, IonRow, IonCol
  ]
})
export class DashboardPage {
  nombreInstitucion = 'Complejo Educativo Cantón El Zunzal';

  constructor(private router: Router) {
    addIcons({ peopleOutline, schoolOutline, checkmarkDoneOutline, cubeOutline });
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }

  ir(ruta: string) {
    this.router.navigate([ruta]);
  }
}
