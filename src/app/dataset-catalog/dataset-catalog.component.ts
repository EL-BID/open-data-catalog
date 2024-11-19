import { ChangeDetectorRef, Component, AfterViewInit, OnInit  } from '@angular/core';
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { FiltersComponent } from "../filters/filters.component";
import { SearchResultsComponent } from '../search-results/search-results.component';
import { SortComponent } from '../sort/sort.component';
import { ResultsHeaderComponent } from '../results-header/results-header.component';

@Component({
  selector: 'app-dataset-catalog',
  standalone: true,
  imports: [SearchBarComponent, FiltersComponent, SearchResultsComponent, SortComponent, ResultsHeaderComponent],
  templateUrl: './dataset-catalog.component.html',
  styleUrls: ['./dataset-catalog.component.scss']
})
export class DatasetCatalogComponent implements AfterViewInit {
  searchTerm: string = '';  // Término de búsqueda inicial
  sortBy: string = 'title'; // Criterio de ordenamiento inicial
  filters: any = {};  // Filtros seleccionados, como por ejemplo, categoría o tipo de datos
  resultCount: number = 0; // Nueva propiedad para el conteo de resultados
  noResults: boolean = false; // Nueva propiedad para indicar si no hay resultados
  datasetPath: string | null = null;
  currentPage = 0;
  rowsPerPage = 10;

  constructor(private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();  // Realiza la detección de cambios después de que la vista esté completamente inicializada
  }

  // Este método recibe el término de búsqueda desde el componente hijo SearchBar
  onSearch(searchTerm: string): void {
    console.log('Término de búsqueda recibido en DatasetCatalog:', searchTerm);  // Depuración
    this.searchTerm = searchTerm;
    // Fuerza la detección de cambios
    this.cdr.detectChanges();
  }

  // Método para cambiar el criterio de ordenamiento en SearchResults
  onSortChanged(sortBy: string): void {
    console.log('Criterio de ordenamiento cambiado a:', sortBy);  // Verifica el valor recibido
    this.sortBy = sortBy;
  }

  // Método para manejar los cambios en los filtros
  onFiltersChanged(filters: any): void {
    console.log('Filtros cambiados a:', filters);  // Verifica los filtros recibidos
    this.filters = filters;
  }

   // Método para actualizar el conteo de resultados desde SearchResultsComponent
  updateResultCount(count: number): void {
    this.resultCount = count;
    this.cdr.detectChanges();  // Fuerza la detección de cambios
  }

  // Método para actualizar la propiedad noResults desde SearchResultsComponent
  updateNoResults(noResults: boolean): void {
    this.noResults = noResults;
  }

  // get paginatedDataset() {
  //   const start = this.currentPage * this.rowsPerPage;
  //   const end = start + this.rowsPerPage;
  //   return this.datasetContent.slice(start, end);
  // }

  // nextPage() {
  //   if ((this.currentPage + 1) * this.rowsPerPage < this.datasetContent.length) {
  //     this.currentPage++;
  //   }
  // }

  // previousPage() {
  //   if (this.currentPage > 0) {
  //     this.currentPage--;
  //   }
  // }
}
