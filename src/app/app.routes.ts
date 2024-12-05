import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DatasetCatalogComponent } from './dataset-catalog/dataset-catalog.component';
import { DatasetDetailComponent } from './dataset-detail/dataset-detail.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, data: { breadcrumb: 'Open Data LAC', title: 'IDB | Open Data LAC' } },
  { path: 'home', component: HomeComponent, data: { breadcrumb: 'Open Data LAC', title: 'IDB | Open Data LAC' } },
  { path: 'browse', component: DatasetCatalogComponent, data: { breadcrumb: 'Dataset Catalog', title: 'IDB | Dataset Catalog' } },
  { path: 'dataset-catalog', redirectTo: 'browse', pathMatch: 'full' },
  { path: ':mydata_category/:title_original', component: DatasetDetailComponent, data: { breadcrumb: 'Dataset Detail' } },
  { path: ':mydata_category/:title_original/:mydata_id', redirectTo: ':mydata_category/:title_original', pathMatch: 'full' },
  { path: ':mydata_category/:title_original/:mydata_id/:section', redirectTo: ':mydata_category/:title_original', pathMatch: 'full'},
  { path: '**', component: NotFoundComponent, data: { breadcrumb: '404 Page not found', title: '404 | Page Not Found' } }
];
