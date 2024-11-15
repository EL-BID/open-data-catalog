import { ChangeDetectorRef, Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
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
export class SearchResultsComponent implements OnChanges {
  @Input() searchTerm: string = '';  // Recibe el término de búsqueda
  @Input() sortBy: string = 'title'; // Recibe el criterio de ordenamiento
  @Input() filters: any = {};  // Recibe los filtros aplicados (como categorías)
  @Output() resultCountChange = new EventEmitter<number>();
  @Output() noResultsChange = new EventEmitter<boolean>();

  datasets: any[] = [];
  filteredDatasets: any[] = [];

  constructor(private dataService: DataService, private router: Router, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.dataService.getMetadata().subscribe(data => {
      this.datasets = data;
      this.applyFilters();  // Filtra y ordena en la carga inicial
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm'] || changes['sortBy'] || changes['filters']) {
      setTimeout(() => this.applyFilters());
    }
  }

  private applyFilters(): void {
    const { topics = [], countries = [], years = [], languages = [] } = this.filters || {};

    this.filteredDatasets = this.datasets.filter(dataset => {
      // Convertimos los valores a minúsculas para evitar problemas de mayúsculas/minúsculas
      const matchSearchTerm = dataset.title.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtramos usando el tema (ahora considerando que theme puede ser un string o un array)
      const matchTopic = topics.length === 0 || topics.some((top: string) => {
        // Si dataset.theme es un string, lo comparamos directamente
        if (typeof dataset.theme === 'string') {
          return dataset.theme.toLowerCase() === top.toLowerCase();
        }
        // Si dataset.theme es un array, verificamos si alguno de sus elementos coincide con el tema seleccionado
        return dataset.theme.some((theme: string) => theme.toLowerCase() === top.toLowerCase());
      });

      // Filtramos usando el filtro de regiones/paises (spatial)
      const matchCountries = countries.length === 0 || this.isMatchingSpatial(countries, dataset.spatial);

      // Filtramos usando el año (comparando solo el año de 'issued' con los años seleccionados)
      const matchYear = years.length === 0 || years.some((year: string) => {
        const issuedYear = dataset.issued ? dataset.issued.split('-')[0] : ''; // Extraemos solo el año
        return issuedYear === year; // Comparamos el año de 'issued' con el año del filtro
      });

      // Filtramos usando el idioma (compara las abreviaturas con las seleccionadas)
      const matchLanguage = languages.length === 0 || languages.some((lang: string) => dataset.language.toLowerCase() === lang.toLowerCase());

      return matchSearchTerm && matchTopic && matchCountries && matchYear && matchLanguage;
    });

    this.sortDatasets();
    this.resultCountChange.emit(this.filteredDatasets.length);
    this.noResultsChange.emit(this.filteredDatasets.length === 0);
  }

  private isMatchingSpatial(selectedCountries: string[], spatial: string | string[]): boolean {
    console.log("selectedCountries:", selectedCountries);
    console.log("spatial:", spatial);

    // Si spatial es una cadena (un solo país), lo convertimos a un array con ese país
    if (typeof spatial === 'string') {
      spatial = [spatial];
    }

    // Convertimos todo a minúsculas para una comparación más sencilla
    const selectedCountriesLower = selectedCountries.map(country => country.toLowerCase());
    const spatialLower = spatial.map(country => country.toLowerCase());

    // Compara si al menos uno de los países en spatial está en los países seleccionados
    return spatialLower.some(country => selectedCountriesLower.includes(country));
  }

  private sortDatasets(): void {
    if (this.sortBy === 'title') {
      this.filteredDatasets.sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.sortBy === 'date') {
      this.filteredDatasets.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    }
  }

  viewDataset(category: string, filename: string): void {
    this.router.navigate([`/dataset/${category}/${filename}`]);
  }
}
