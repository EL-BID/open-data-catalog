import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { DataService } from '../data.service';  // Importar el DataService
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Importa FormsModule
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // Importar el módulo de FontAwesome
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'; // Importar los íconos
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<any>();
  topics: string[] = [];
  regions: { [key: string]: string[] } = {};
  years: string[] = [];
  languages: string[] = [];
  selectedFilters: { [key: string]: boolean } = {};
  expandedRegions: { [key: string]: boolean } = {};

  visibleTopics: string[] = [];
  visibleYears: string[] = [];

  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

  languageMapping: { [key: string]: string } = {
    "English": "en",
    "Spanish": "es",
    "Portuguese": "pt",
    "French": "fr"
  };

  constructor(private dataService: DataService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadFilters();
  }

  loadFilters() {
    this.dataService.getFilters().subscribe(data => {
      this.topics = data.topics.sort();
      this.regions = data.regions;
      this.years = data.years;
      this.languages = data.languages;

      this.topics.forEach(topic => {
        this.selectedFilters[topic] = false;
      });

      Object.keys(this.regions).forEach(region => {
        this.regions[region].forEach(country => {
          this.selectedFilters[country] = false;
        });
      });

      this.years.forEach(year => {
        this.selectedFilters[year] = false;
      });

      this.languages.forEach(language => {
        this.selectedFilters[language] = false;
      });

      this.updateVisibleFilters();
    });
  }

  updateVisibleFilters() {
    const topicsPerPage = 5;
    const yearsPerPage = 5;

    // Solo mostramos los primeros 5 elementos de los topics y los años inicialmente.
    this.visibleTopics = this.topics.slice(0, topicsPerPage);
    this.visibleYears = this.years.slice(0, yearsPerPage);
  }

  // Esta función ahora solo muestra todos los elementos al hacer clic en el botón "See More"
  showAllTopics() {
    this.visibleTopics = [...this.topics];  // Mostrar todos los topics
  }

  showAllYears() {
    this.visibleYears = [...this.years];  // Mostrar todos los años
  }

  toggleRegion(regionKey: string): void {
    this.expandedRegions[regionKey] = !this.expandedRegions[regionKey];
    this.cdr.detectChanges();
  }

  emitFilters() {
    const selectedTopics = this.topics.filter(topic => this.selectedFilters[topic]);
    const selectedCountries: string[] = Object.keys(this.regions).reduce((selected: string[], region: string) => {
      const selectedInRegion = this.regions[region].filter(country => this.selectedFilters[country]);
      return [...selected, ...selectedInRegion];
    }, []);
    const selectedYears = this.years.filter(year => this.selectedFilters[year]);
    const selectedLanguages = this.languages.filter(language => this.selectedFilters[language])
      .map(language => this.languageMapping[language]);

    this.filtersChanged.emit({
      topics: selectedTopics,
      countries: selectedCountries,
      years: selectedYears,
      languages: selectedLanguages
    });
  }

  onCheckboxKeydown(value: string, type: string) {
    switch (type) {
      case 'topic':
        this.selectedFilters[value] = !this.selectedFilters[value];
        break;
      case 'country':
        this.selectedFilters[value] = !this.selectedFilters[value];
        break;
      case 'year':
        this.selectedFilters[value] = !this.selectedFilters[value];
        break;
      case 'language':
        this.selectedFilters[value] = !this.selectedFilters[value];
        break;
    }
    this.emitFilters();
  }
}
