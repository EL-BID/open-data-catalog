import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DatasetCatalogComponent } from './dataset-catalog/dataset-catalog.component';
import { DatasetDetailComponent } from './dataset-detail/dataset-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dataset-catalog', component: DatasetCatalogComponent },
  { path: 'browse', redirectTo: 'dataset-catalog', pathMatch: 'full' },
  { path: 'dataset/:category/:filename', component: DatasetDetailComponent },
  // Agrega más rutas según tus necesidades
];
