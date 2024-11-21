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
      setTimeout(() => this.checkTruncation(), 0); // Espera a que las vistas se actualicen
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm'] || changes['sortBy'] || changes['filters']) {
      setTimeout(() => this.applyFilters());
    }
  }

  ngAfterViewInit(): void {
    // Lógica que se ejecuta después de que las vistas secundarias estén inicializadas.
    this.checkTruncation();
  }

  private applyFilters(): void {
    const { topics = [], countries = [], years = [], languages = [], idbKnowledges = [] } = this.filters || {};

    this.filteredDatasets = this.datasets.filter(dataset => {
      const matchSearchTerm = dataset.title.toLowerCase().includes(this.searchTerm.toLowerCase());
       // Filtrar por temas (temas pueden ser un string o un array de strings)
    const matchTopic = topics.length === 0 || topics.some((top: string) => {
      if (Array.isArray(dataset.theme)) {
        // Si dataset.theme es un array, verificar si contiene el tema
        return dataset.theme.some((t: string) => t.toLowerCase() === top.toLowerCase());
      } else {
        // Si dataset.theme es un string, comparar directamente
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
          // Si la opción "Tied research publication" está seleccionada, solo filtrar datasets cuyo "source" no sea vacío
          return dataset.source && dataset.source.trim() !== "";
        }
        // Si no se ha seleccionado "Tied research publication", no filtra por el campo source
        return true;
      });

      return matchSearchTerm && matchTopic && matchCountries && matchYear && matchLanguage && matchIdbKnowledge;
    });

    this.sortDatasets();
    this.resultCountChange.emit(this.filteredDatasets.length);
    this.noResultsChange.emit(this.filteredDatasets.length === 0);

    setTimeout(() => this.checkTruncation(), 0); // Recalcula después de aplicar los filtros
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
        this.isDescriptionExpanded[dataset.id] = false;  // Inicialmente está colapsada
      }
    });
  }

  toggleDescription(datasetId: number): void {
    this.isDescriptionExpanded[datasetId] = !this.isDescriptionExpanded[datasetId];
  }

  viewDataset(mydata_category: string, title_original: string, mydata_id?: string): void {
    // Formatear la categoría y el título reemplazando caracteres no deseados por guiones y limitando a 50 caracteres
    const formattedCategory = mydata_category
      ? mydata_category.replace(/[^a-zA-Z0-9]+/g, '-').substring(0, 50)
      : '';
    const formattedTitle = title_original
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .substring(0, 50);

    // Construcción de la ruta en función de los parámetros disponibles
    let route = '';
    if (formattedCategory && mydata_id) {
      // Si tenemos category y mydata_id
      route = `/${formattedCategory}/${formattedTitle}/${mydata_id}`;
    } else if (formattedCategory) {
      // Si solo tenemos category
      route = `/${formattedCategory}/${formattedTitle}`;
    } else if (mydata_id) {
      // Si solo tenemos mydata_id
      route = `/dataset/${formattedTitle}/${mydata_id}`;
    } else {
      // Si solo tenemos title
      route = `/dataset/${formattedTitle}`;
    }

    // Navegar a la ruta generada
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
