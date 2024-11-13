// dataset-catalog.component.ts
import { Component } from '@angular/core';
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { FiltersComponent } from "../filters/filters.component";
import { SearchResultsComponent } from '../search-results/search-results.component';

@Component({
  selector: 'app-dataset-catalog',
  standalone: true,
  imports: [SearchBarComponent, FiltersComponent, SearchResultsComponent],
  templateUrl: './dataset-catalog.component.html',
  styleUrls: ['./dataset-catalog.component.scss']
})
export class DatasetCatalogComponent {
  searchTerm: string = '';  // Término de búsqueda inicial

  // Este método recibe el término de búsqueda desde el componente hijo SearchBar
  onSearch(searchTerm: string): void {
    console.log('Término de búsqueda recibido en DatasetCatalog:', searchTerm);  // Depuración
    this.searchTerm = searchTerm;
  }
}
