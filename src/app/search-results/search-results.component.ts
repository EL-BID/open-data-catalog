import { ChangeDetectorRef, Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, AfterViewInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo, faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnChanges, AfterViewInit {
  @Input() searchTerm: string = '';
  @Input() sortBy: string = 'date';
  @Input() filters: any = {};
  @Input() currentPage: number = 1;
  @Input() rowsPerPage: number = 10;
  @Output() resultCountChange = new EventEmitter<number>();
  @Output() noResultsChange = new EventEmitter<boolean>();

  @ViewChildren('descRef') descriptions!: QueryList<ElementRef>;

  datasets: any[] = [];
  filteredDatasets: any[] = [];
  isDescriptionExpanded: { [key: number]: boolean } = {};
  showReadMoreButton: { [key: number]: boolean } = {};
  faCircleInfo = faCircleInfo;
  faCheck = faCheck;
  showTooltip = false;
  hasMoreCountries = false;

  constructor(private dataService: DataService, private router: Router, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.dataService.getMetadata().subscribe(data => {
      this.datasets = data;
      this.applyFilters();
      setTimeout(() => this.checkTruncation(), 0);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm'] || changes['sortBy'] || changes['filters'] || changes['currentPage']) {
      this.applyFilters();
      this.changeDetectorRef.detectChanges();
    }
  }

  ngAfterViewInit(): void {
    this.checkTruncation();
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  private applyFilters(): void {

    const { topics = [], countries = [], years = [], languages = [], idbKnowledges = [] } = this.filters || {};

    this.filteredDatasets = this.datasets.filter(dataset => {
      const matchSearchTerm = dataset.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchTopic = topics.length === 0 || topics.some((top: string) => {
        if (Array.isArray(dataset.theme)) {
          return dataset.theme.some((t: string) => t.toLowerCase() === top.toLowerCase());
        } else {
          return dataset.theme && dataset.theme.toLowerCase() === top.toLowerCase();
        }
      });
      const matchCountries = countries.length === 0 || this.isMatchingSpatial(countries, dataset.spatial);
      const matchYear = years.length === 0 || years.some((year: string) => {
        const issuedYear = dataset.issued ? dataset.issued.split('-')[0] : '';
        return issuedYear === year;
      });
      const matchLanguage = languages.length === 0 || languages.some((lang: string) => dataset.language.toLowerCase() === lang.toLowerCase());
      const matchIdbKnowledge = idbKnowledges.length === 0 || idbKnowledges.some((knowledge: string) => {
        if (knowledge === "Tied research publication") {
          return dataset.source && dataset.source.trim() !== "";
        }
        if (knowledge === "Feeds indicators") {
          return dataset.mydata_category === "indicator-catalog";
        }
        return true;
      });

      return matchSearchTerm && matchTopic && matchCountries && matchYear && matchLanguage && matchIdbKnowledge;
    });

    this.filteredDatasets.forEach(dataset => {
      if (Array.isArray(dataset.theme)) {
        dataset.theme.sort();
      }
    });

    this.sortDatasets();

    this.resultCountChange.emit(this.filteredDatasets.length);
    this.noResultsChange.emit(this.filteredDatasets.length === 0);

    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;

    this.filteredDatasets = this.filteredDatasets.slice(startIndex, endIndex);

    setTimeout(() => this.checkTruncation(), 0);

  }

  private isMatchingSpatial(selectedCountries: string[], spatial: string | string[]): boolean {
    if (typeof spatial === 'string') {
      spatial = [spatial];
    }
    const selectedCountriesLower = selectedCountries.map(country => country.toLowerCase());
    const spatialLower = spatial.map(country => country.toLowerCase());
    return spatialLower.some(country => selectedCountriesLower.includes(country));
  }

  private sortDatasets(): void {
    if (this.sortBy === 'title') {
      this.filteredDatasets.sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.sortBy === 'date') {
      this.filteredDatasets.sort((a, b) => {
        const issuedA = a.issued ? new Date(a.issued).getTime() : 0;
        const issuedB = b.issued ? new Date(b.issued).getTime() : 0;
        return issuedB - issuedA;
      });
    }
  }

  private checkTruncation(): void {
    this.descriptions.forEach((descRef, index) => {
      const element = descRef.nativeElement;
      const isOverflowing = element.scrollHeight > element.clientHeight;
      const datasetId = this.filteredDatasets[index]?.id;

      if (datasetId !== undefined) {
        this.showReadMoreButton[datasetId] = isOverflowing;
        this.isDescriptionExpanded[datasetId] = false;
      }
    });

    this.changeDetectorRef.detectChanges();
  }

  toggleDescription(datasetId: number): void {
    this.isDescriptionExpanded[datasetId] = !this.isDescriptionExpanded[datasetId];
  }

  viewDataset(mydata_category: string, title_original: string): void {
    const route = this.dataService.generateDatasetRoute(mydata_category, title_original);
    this.router.navigate([route]);
  }

  getLimitedCountries(spatial: string[]): string {
    if (!Array.isArray(spatial)) {
      return spatial;
    }
    const sortedCountries = spatial.sort((a, b) => a.localeCompare(b));
    const limitedCountries = sortedCountries.slice(0, 3);
    this.hasMoreCountries = spatial.length > 3;
    return limitedCountries.join(', ') + (this.hasMoreCountries ? ',...' : '');
  }

  toggleTooltip(show: boolean) {
    this.showTooltip = show;
    this.changeDetectorRef.detectChanges();
  }

}
