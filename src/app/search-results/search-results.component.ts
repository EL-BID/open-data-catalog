import { ChangeDetectorRef, Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, AfterViewInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnChanges, AfterViewInit {
  @Input() searchTerm: string = '';
  @Input() sortBy: string = 'date';
  @Input() filters: any = {};
  @Output() resultCountChange = new EventEmitter<number>();
  @Output() noResultsChange = new EventEmitter<boolean>();

  @ViewChildren('descRef') descriptions!: QueryList<ElementRef>;

  datasets: any[] = [];
  filteredDatasets: any[] = [];
  isDescriptionExpanded: { [key: number]: boolean } = {};
  showReadMoreButton: { [key: number]: boolean } = {};

  constructor(private dataService: DataService, private router: Router, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.dataService.getMetadata().subscribe(data => {
      this.datasets = data;
      this.applyFilters();
      setTimeout(() => this.checkTruncation(), 0);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm'] || changes['sortBy'] || changes['filters']) {
      setTimeout(() => this.applyFilters());
    }
  }

  ngAfterViewInit(): void {
    this.checkTruncation();
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

    this.sortDatasets();  // No olvides ordenar los datasets si es necesario
    this.resultCountChange.emit(this.filteredDatasets.length);
    this.noResultsChange.emit(this.filteredDatasets.length === 0);
    setTimeout(() => this.checkTruncation(), 0);  // Revisar truncamiento de descripciones
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
    this.filteredDatasets.forEach(dataset => {
      const descriptionElement = this.descriptions.toArray().find((desc: ElementRef) => desc.nativeElement.innerText.trim() === dataset.description.trim());
      if (descriptionElement) {
        const isTruncated = descriptionElement.nativeElement.scrollHeight > descriptionElement.nativeElement.offsetHeight;
        this.showReadMoreButton[dataset.id] = isTruncated;
        this.isDescriptionExpanded[dataset.id] = false;
      }
    });
  }

  toggleDescription(datasetId: number): void {
    this.isDescriptionExpanded[datasetId] = !this.isDescriptionExpanded[datasetId];
  }

  viewDataset(mydata_category: string, title_original: string, mydata_id?: string): void {
    const formattedCategory = mydata_category
      ? mydata_category.replace(/[^a-zA-Z0-9]+/g, '-').substring(0, 50)
      : '';
    const formattedTitle = title_original
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .substring(0, 50);

    let route = '';
    if (formattedCategory && mydata_id) {
      route = `/${formattedCategory}/${formattedTitle}/${mydata_id}`;
    } else if (formattedCategory) {
      route = `/${formattedCategory}/${formattedTitle}`;
    } else if (mydata_id) {
      route = `/dataset/${formattedTitle}/${mydata_id}`;
    } else {
      route = `/dataset/${formattedTitle}`;
    }

    this.router.navigate([route]);
  }

  getLimitedCountries(spatial: string[]): string {
    if (!Array.isArray(spatial)) {
      return spatial;
    }
    const sortedCountries = spatial.sort((a, b) => a.localeCompare(b));
    const limitedCountries = sortedCountries.slice(0, 5);
    return limitedCountries.join(', ') + (spatial.length > 5 ? ',...' : '');
  }
}
