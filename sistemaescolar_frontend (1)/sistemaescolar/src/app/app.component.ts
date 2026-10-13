import { Component } from '@angular/core';
import { addIcons } from 'ionicons';
import {
  homeOutline, peopleOutline, documentTextOutline, schoolOutline,
  cubeOutline, pricetagsOutline, checkmarkDoneOutline, bookOutline,
  barChartOutline
} from 'ionicons/icons';
import {
  IonApp, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList,
  IonMenu, IonMenuToggle, IonRouterOutlet, IonTitle, IonToolbar, IonImg
} from '@ionic/angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle,
    IonImg, RouterLink
  ],
})
export class AppComponent {
  nombreInstitucion = 'Complejo Educativo Cantón El Zunzal';

  constructor() {
    addIcons({
      homeOutline, peopleOutline, documentTextOutline, schoolOutline,
      cubeOutline, pricetagsOutline, checkmarkDoneOutline, bookOutline,
      barChartOutline
    });
  }
}
