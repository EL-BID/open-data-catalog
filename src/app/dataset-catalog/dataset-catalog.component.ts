import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
export class DatasetCatalogComponent implements OnInit {
  searchTerm: string = '';
  sortBy: string = 'date';
  filters: any = {};
  resultCount: number = 0;
  noResults: boolean = false;
  datasetPath: string | null = null;
  currentPage: number = 1;  // Página inicial ajustada a 1
  rowsPerPage: number = 10;

  constructor(private cdr: ChangeDetectorRef, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.checkCategoryParam();  // Verificar el parámetro 'category' al inicializar
    this.loadFiltersFromUrl();  // Cargar filtros desde la URL al inicializar
  }

  // Comprobar si hay un parámetro 'category' en la URL
  checkCategoryParam(): void {
    this.route.queryParams.subscribe(params => {
      console.log(params);  // Verifica los parámetros que llegan
      if (params['category']) {
        // Si la categoría es 'Research Catalog', redirigimos a la nueva URL
        if (params['category'] === 'Research Catalog') {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { idbKnowledges: 'Tied research publication' }, // Redirigir con el nuevo parámetro
            queryParamsHandling: 'replace' // Reemplaza los parámetros existentes en la URL
          });
        }
        // Si la categoría es 'Indicator Catalog', redirigimos a la URL correspondiente
        else if (params['category'] === 'Indicator Catalog') {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { idbKnowledges: 'Feeds20%indicators' }, // Redirigir con el nuevo parámetro
            queryParamsHandling: 'replace' // Reemplaza los parámetros existentes en la URL
          });
        }
      }
    });
  }

  // Cargar filtros desde la URL
  loadFiltersFromUrl(): void {
    this.route.queryParams.subscribe(params => {
      this.filters = {
        topics: params['topics'] ? params['topics'].split(',') : [],
        countries: params['countries'] ? params['countries'].split(',') : [],
        years: params['years'] ? params['years'].split(',') : [],
        languages: params['languages'] ? params['languages'].split(',') : [],
        idbKnowledges: params['idbKnowledges'] ? params['idbKnowledges'].split(',') : []
      };

      // Actualizar la página según los parámetros de la URL
      this.currentPage = params['page'] ? +params['page'] : 1;

      // Si el parámetro sortBy está presente en la URL, actualizar el valor de sortBy
      this.sortBy = params['sortBy'] || this.sortBy; // Si no hay parámetro, se usa el valor por defecto
    });
  }

  // Manejar el cambio en la búsqueda
  onSearch(searchTerm: string): void {
    console.log('Término de búsqueda recibido en DatasetCatalog:', searchTerm);
    this.searchTerm = searchTerm;
    this.cdr.detectChanges();
    this.updateUrlWithFilters(); // Actualizar la URL al cambiar el término de búsqueda
  }

  // Manejar el cambio en los filtros
  onFiltersChanged(updatedFilters: any): void {
    console.log('Filtros cambiados a:', updatedFilters);
    this.filters = updatedFilters;
    this.updateUrlWithFilters();  // Actualizar la URL al cambiar los filtros
  }

  // Actualizar los parámetros de la URL con los filtros y la página actual
  updateUrlWithFilters(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchTerm, // Término de búsqueda primero
        topics: this.filters.topics.join(','),
        countries: this.filters.countries.join(','),
        years: this.filters.years.join(','),
        languages: this.filters.languages.join(','),
        idbKnowledges: this.filters.idbKnowledges.join(','),
        sortBy: this.sortBy, // Ordenamiento después de la búsqueda
        page: this.currentPage // Página al final
      },
      queryParamsHandling: 'merge' // Mantener los demás parámetros en la URL
    });
  }

  // Manejar el cambio en el criterio de ordenamiento
  onSortChanged(sortBy: string): void {
    console.log('Criterio de ordenamiento cambiado a:', sortBy);
    this.sortBy = sortBy;
    this.updateUrlWithFilters();  // Actualizar la URL con el nuevo criterio de ordenamiento
  }


  // Actualizar el conteo de resultados
  updateResultCount(count: number): void {
    this.resultCount = count;
    this.cdr.detectChanges();
  }

  // Actualizar si no hay resultados
  updateNoResults(noResults: boolean): void {
    this.noResults = noResults;
  }

  // Cambiar de página para la paginación
  changePage(page: number): void {
    this.currentPage = page;
    this.updateUrlWithFilters();  // Actualizar la URL al cambiar de página
  }

  // Función para calcular el total de páginas disponibles
  getTotalPages(): number {
    return Math.ceil(this.resultCount / this.rowsPerPage);
  }
}
