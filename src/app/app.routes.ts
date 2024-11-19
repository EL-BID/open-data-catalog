import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DatasetCatalogComponent } from './dataset-catalog/dataset-catalog.component';
import { DatasetDetailComponent } from './dataset-detail/dataset-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'browse', component: DatasetCatalogComponent },
  { path: 'dataset-catalog', redirectTo: 'browse', pathMatch: 'full' },

  { path: 'dataset/:title_original', component: DatasetDetailComponent },
  { path: 'dataset/:title_original/about-data', redirectTo: 'dataset/:title_original', pathMatch: 'full' },

  { path: 'dataset/:title_original/:mydata_id', component: DatasetDetailComponent },
  { path: 'dataset/:title_original/:mydata_id/about-data', redirectTo: 'dataset/:title_original/:mydata_id', pathMatch: 'full' },

  { path: ':mydata_category/:title_original', component: DatasetDetailComponent },
  { path: ':mydata_category/:title_original/about-data', redirectTo: ':mydata_category/:title_original', pathMatch: 'full' },

  { path: ':mydata_category/:title_original/:mydata_id', component: DatasetDetailComponent },
  { path: ':mydata_category/:title_original/:mydata_id/about-data', redirectTo: ':mydata_category/:title_original/:mydata_id', pathMatch: 'full' },
];
