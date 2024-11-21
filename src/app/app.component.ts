import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';  // Asegúrate de importar Router de '@angular/router'
import { RouterLink, RouterModule, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,   // Asegúrate de importar RouterModule
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  // Asegúrate de añadir esto si usas Web Components
})
export class AppComponent implements OnInit {
  title = 'open-data-lac';

  constructor(private router: Router) {}

  ngOnInit() {
    // Asegura que al inicializar siempre se desplace al inicio
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Suscripción a cambios de ruta
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }

}
