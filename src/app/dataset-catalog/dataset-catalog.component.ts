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
  currentPage: number = 1;
  rowsPerPage: number = 10;

  constructor(private cdr: ChangeDetectorRef, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.checkCategoryParam();
    this.loadFiltersFromUrl();
  }

  checkCategoryParam(): void {
    this.route.queryParams.subscribe(params => {
      console.log(params);
      if (params['category']) {
        if (params['category'] === 'Research Catalog') {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { idbKnowledges: 'Tied research publication' },
            queryParamsHandling: 'replace'
          });
        }
        else if (params['category'] === 'Indicator Catalog') {
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
    this.route.queryParams.subscribe(params => {
      this.filters = {
        topics: params['topics'] ? params['topics'].split(',') : [],
        countries: params['countries'] ? params['countries'].split(',') : [],
        years: params['years'] ? params['years'].split(',') : [],
        languages: params['languages'] ? params['languages'].split(',') : [],
        idbKnowledges: params['idbKnowledges'] ? params['idbKnowledges'].split(',') : []
      };
      this.currentPage = params['page'] ? +params['page'] : 1;
      this.sortBy = params['sortBy'] || this.sortBy;
    });
  }

  onSearch(searchTerm: string): void {
    console.log('Término de búsqueda recibido en DatasetCatalog:', searchTerm);
    this.searchTerm = searchTerm;
    this.cdr.detectChanges();
    this.updateUrlWithFilters();
  }

  onFiltersChanged(updatedFilters: any): void {
    console.log('Filtros cambiados a:', updatedFilters);
    this.filters = updatedFilters;
    this.updateUrlWithFilters();
  }

  updateUrlWithFilters(): void {
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
  }

  onSortChanged(sortBy: string): void {
    console.log('Criterio de ordenamiento cambiado a:', sortBy);
    this.sortBy = sortBy;
    this.updateUrlWithFilters();
  }

  updateResultCount(count: number): void {
    this.resultCount = count;
    this.cdr.detectChanges();
  }

  updateNoResults(noResults: boolean): void {
    this.noResults = noResults;
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updateUrlWithFilters();
  }

  getTotalPages(): number {
    return Math.ceil(this.resultCount / this.rowsPerPage);
  }
}
