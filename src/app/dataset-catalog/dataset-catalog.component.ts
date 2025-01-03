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
    this.zone.run(() => {
      this.searchTerm = searchTerm;
      this.cdr.detectChanges();
    });
    this.updateUrlWithFilters();
  }

  onFiltersChanged(updatedFilters: any): void {
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

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateUrlWithFilters();
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    const totalPages = Math.ceil(this.resultCount / this.rowsPerPage);
    return totalPages;
  }
}
