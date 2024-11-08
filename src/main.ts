import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // Importar las rutas desde app.routes.ts

// Configuración del arranque de la aplicación, ahora con las rutas
bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers, // Si tienes otras configuraciones en appConfig
    provideRouter(routes)   // Añadir el router con las rutas definidas
  ]
})
  .catch((err) => console.error(err));
