import { ChangeDetectorRef, Component, AfterViewInit  } from '@angular/core';
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
  searchTerm: string = '';
  sortBy: string = 'date';
  filters: any = {};
  resultCount: number = 0;
  noResults: boolean = false;
  datasetPath: string | null = null;
  currentPage = 0;
  rowsPerPage = 10;

  constructor(private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  onSearch(searchTerm: string): void {
    console.log('Término de búsqueda recibido en DatasetCatalog:', searchTerm);
    this.searchTerm = searchTerm;
    this.cdr.detectChanges();
  }

  onSortChanged(sortBy: string): void {
    console.log('Criterio de ordenamiento cambiado a:', sortBy);
    this.sortBy = sortBy;
  }

  onFiltersChanged(filters: any): void {
    console.log('Filtros cambiados a:', filters);
    this.filters = filters;
  }

  updateResultCount(count: number): void {
    this.resultCount = count;
    this.cdr.detectChanges();
  }

  updateNoResults(noResults: boolean): void {
    this.noResults = noResults;
  }
}
