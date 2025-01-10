import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DatasetCatalogComponent } from './dataset-catalog/dataset-catalog.component';
import { DatasetDetailComponent } from './dataset-detail/dataset-detail.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, data: { breadcrumb: 'Open Data LAC' } },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'browse', component: DatasetCatalogComponent, data: { breadcrumb: 'Dataset Catalog' } },
  { path: ':mydata_category/:title_original', component: DatasetDetailComponent, data: { breadcrumb: 'Dataset' } },
  { path: ':mydata_category/:title_original/:mydata_id', component: DatasetDetailComponent, data: { breadcrumb: 'Dataset' } },
  { path: ':mydata_category/:title_original/:mydata_id/:section', component: DatasetDetailComponent, data: { breadcrumb: 'Dataset' } },
  { path: '**', component: NotFoundComponent, data: { breadcrumb: '404 Page not found', title: '404 Page Not Found' } }
];
