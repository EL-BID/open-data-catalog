import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators'; // pairwise para rastrear la URL anterior
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent implements OnInit {
  title = 'open-data-lac';

  constructor(private router: Router) {}

  ngOnInit() {
    // Suscribirse a eventos de navegación y distinguir entre cambios de ruta y query params
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd), // Solo NavigationEnd
        pairwise() // Obtener la URL anterior y la actual
      )
      .subscribe(([prev, curr]: [NavigationEnd, NavigationEnd]) => {
        const prevUrl = new URL(prev.urlAfterRedirects, window.location.origin);
        const currUrl = new URL(curr.urlAfterRedirects, window.location.origin);

        // Condición: Desplazarse hacia arriba solo si el pathname cambia
        if (prevUrl.pathname !== currUrl.pathname) {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      });
  }
}
