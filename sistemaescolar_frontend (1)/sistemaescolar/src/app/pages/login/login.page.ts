import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http'; // <-- Importamos HttpClient
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonTitle, IonToolbar, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { personOutline, lockClosedOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, 
    IonCardContent, IonItem, IonInput, IonButton, IonIcon,
    CommonModule, FormsModule, ]
})
export class LoginPage {
  // Objeto para capturar lo que el usuario escribe
  credenciales = {
    usuario: '',
    password: ''
  };

constructor(
    private router: Router, 
    private menuCtrl: MenuController,
    private http: HttpClient,
    private alertCtrl: AlertController
  ) {
    addIcons({ personOutline, lockClosedOutline });
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  ionViewWillLeave() {
    this.menuCtrl.enable(true);
  }

  onLogin() {
    if (!this.credenciales.usuario || !this.credenciales.password) {
      this.mostrarAlerta('Atención', 'Por favor, ingresa tu email y contraseña.');
      return;
    }

    // Asegúrate de que el puerto (3000) coincida con el que usa tu backend al hacer 'node app.js'
    const urlAPI = 'http://localhost:3000/api/auth/login';

    // Hacemos la petición POST al backend
    this.http.post(urlAPI, this.credenciales).subscribe({
      next: (respuesta: any) => {
        if (respuesta.success) {
          console.log('Usuario autenticado:', respuesta.usuario);
          // ¡Éxito! Navegamos al dashboard
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Error en la petición:', err);
        // Si el backend devuelve un error (ej. 401 Credenciales incorrectas), mostramos el mensaje
        const mensajeError = err.error?.mensaje || 'Error al conectar con el servidor.';
        this.mostrarAlerta('Error de Acceso', mensajeError);
      }
    });
  }

  // Función de ayuda para mostrar ventanas de error bonitas
  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}