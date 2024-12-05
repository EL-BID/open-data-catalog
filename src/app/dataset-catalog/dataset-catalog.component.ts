import { Meta, Title } from '@angular/platform-browser';
import { ChangeDetectorRef, Component, NgZone, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { FiltersComponent } from "../filters/filters.component";
import { SearchResultsComponent } from '../search-results/search-results.component';
import { SortComponent } from '../sort/sort.component';
import { ResultsHeaderComponent } from '../results-header/results-header.component';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-dataset-catalog',
  standalone: true,
  imports: [SearchBarComponent, FiltersComponent, SearchResultsComponent, SortComponent, ResultsHeaderComponent, PaginationComponent],
  templateUrl: './dataset-catalog.component.html',
  styleUrls: ['./dataset-catalog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetCatalogComponent implements OnInit {
  searchTerm: string = '';
  sortBy: string = 'date';
  filters: any = {};
  resultCount: number = 0;
  noResults: boolean = false;
  datasetPath: string | null = null;
  currentPage: number = 1;
  rowsPerPage: number = 10;

  constructor(
    private metaService: Meta,
    private titleService: Title,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    console.log('ngOnInit: Verificando parámetros de categoría');
    this.checkCategoryParam();
    this.loadFiltersFromUrl();
    this.setMetaTags();
  }

  setMetaTags(): void {
    const pageDescription = 'Explore comprehensive datasets on Latin America and the Caribbean in the IDB open data catalog. Search and filter by topics, countries, regions, publication year, languages, and linked IDB knowledge products.';
    const keywords = 'open data, datasets, Latin America, Caribbean, research data, indicators, data catalog, IDB, filter datasets, regional data, open data LAC';

    this.titleService.setTitle('IDB Open Data LAC | Dataset Catalog');
    this.metaService.updateTag({ name: 'description', content: pageDescription });
    this.metaService.updateTag({ name: 'keywords', content: keywords });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({ name: 'author', content: 'Inter-American Development Bank (IDB)' });
    this.metaService.updateTag({ property: 'og:title', content: 'IDB Open Data LAC | Dataset Catalog' });
    this.metaService.updateTag({ property: 'og:description', content: pageDescription });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:image', content: '' });
    this.metaService.updateTag({ property: 'og:image:alt', content: 'Screenshot of the Dataset Catalog' });
  }

  checkCategoryParam(): void {
    this.route.queryParams.subscribe(params => {
      console.log('queryParams en checkCategoryParam:', params);
      if (params['category']) {
        if (params['category'] === 'Research Catalog') {
          console.log('Redirigiendo a Research Catalog');
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { idbKnowledges: 'Tied research publication' },
            queryParamsHandling: 'replace'
          });
        }
        else if (params['category'] === 'Indicator Catalog') {
          console.log('Redirigiendo a Indicator Catalog');
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { idbKnowledges: 'Feeds indicators' },
            queryParamsHandling: 'replace'
          });
        }
      }
    });
  }

  loadFiltersFromUrl(): void {
    console.log('Cargando filtros desde la URL...');
    this.route.queryParams.subscribe(params => {
      console.log('Filtros desde la URL:', params);
      this.filters = {
        topics: params['topics'] ? params['topics'].split(',') : [],
        countries: params['countries'] ? params['countries'].split(',') : [],
        years: params['years'] ? params['years'].split(',') : [],
        languages: params['languages'] ? params['languages'].split(',') : [],
        idbKnowledges: params['idbKnowledges'] ? params['idbKnowledges'].split(',') : []
      };
      this.currentPage = params['page'] ? +params['page'] : 1;
      this.sortBy = params['sortBy'] || this.sortBy;
      console.log('Filtros cargados:', this.filters);
      console.log('Página actual:', this.currentPage, 'Ordenar por:', this.sortBy);
    });
  }

  onSearch(searchTerm: string): void {
    console.log('Término de búsqueda recibido en DatasetCatalog:', searchTerm);
    this.zone.run(() => {
      this.searchTerm = searchTerm;
      this.cdr.detectChanges();
    });
    this.updateUrlWithFilters();
  }

  onFiltersChanged(updatedFilters: any): void {
    console.log('Filtros cambiados a:', updatedFilters);
    this.filters = updatedFilters;
    this.syncFilters();
    this.currentPage = 1;
    this.updateUrlWithFilters();
  }

  removeFilter(event: { category: string, value: string }): void {
    const { category, value } = event;
    if (this.filters[category]) {
      this.filters[category] = this.filters[category].filter((val: string) => val !== value);
      this.syncFilters();
      this.updateUrlWithFilters();
      this.cdr.detectChanges();
    }
  }

  syncFilters(): void {
    this.filters = { ...this.filters };
  }

  updateUrlWithFilters(): void {
    console.log('Actualizando URL con filtros...');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchTerm,
        topics: this.filters.topics.join(','),
        countries: this.filters.countries.join(','),
        years: this.filters.years.join(','),
        languages: this.filters.languages.join(','),
        idbKnowledges: this.filters.idbKnowledges.join(','),
        sortBy: this.sortBy,
        page: this.currentPage
      },
      queryParamsHandling: 'merge'
    });
    console.log('URL actualizada con:', {
      search: this.searchTerm,
      topics: this.filters.topics,
      countries: this.filters.countries,
      years: this.filters.years,
      languages: this.filters.languages,
      idbKnowledges: this.filters.idbKnowledges,
      sortBy: this.sortBy,
      page: this.currentPage
    });
  }

  onSortChanged(sortBy: string): void {
    console.log('Criterio de ordenamiento cambiado a:', sortBy);
    this.sortBy = sortBy;
    this.updateUrlWithFilters();
  }

  updateResultCount(count: number): void {
    console.log('Actualizando el contador de resultados a:', count);
    this.resultCount = count;
    this.cdr.detectChanges();
  }

  updateNoResults(noResults: boolean): void {
    console.log('Actualizando la bandera de resultados vacíos a:', noResults);
    this.noResults = noResults;
  }

  onPageChange(page: number): void {
    console.log('Página cambiada a:', page);
    this.currentPage = page;
    this.updateUrlWithFilters();
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    const totalPages = Math.ceil(this.resultCount / this.rowsPerPage);
    console.log('Total de páginas:', totalPages);
    return totalPages;
  }
}
