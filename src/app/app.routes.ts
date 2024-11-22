import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DatasetCatalogComponent } from './dataset-catalog/dataset-catalog.component';
import { DatasetDetailComponent } from './dataset-detail/dataset-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, data: { breadcrumb: 'Open Data LAC' } },
  { path: 'home', component: HomeComponent, data: { breadcrumb: 'Open Data LAC' } },
  { path: 'browse', component: DatasetCatalogComponent, data: { breadcrumb: 'Dataset Catalog' } },
  { path: 'dataset-catalog', redirectTo: 'browse', pathMatch: 'full' },

  { path: 'dataset/:title_original', component: DatasetDetailComponent, data: { breadcrumb: 'Dataset Detail' } },
  { path: 'dataset/:title_original/about-data', redirectTo: 'dataset/:title_original', pathMatch: 'full' },

  { path: 'dataset/:title_original/:mydata_id', component: DatasetDetailComponent, data: { breadcrumb: 'Dataset Detail' } },
  { path: 'dataset/:title_original/:mydata_id/about-data', redirectTo: 'dataset/:title_original/:mydata_id', pathMatch: 'full' },

  { path: ':mydata_category/:title_original', component: DatasetDetailComponent, data: { breadcrumb: 'Dataset Detail' } },
  { path: ':mydata_category/:title_original/about-data', redirectTo: ':mydata_category/:title_original', pathMatch: 'full' },

  { path: ':mydata_category/:title_original/:mydata_id', component: DatasetDetailComponent, data: { breadcrumb: 'Dataset Detail' } },
  { path: ':mydata_category/:title_original/:mydata_id/about-data', redirectTo: ':mydata_category/:title_original/:mydata_id', pathMatch: 'full' },

];
