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
  @Output() filtersChanged = new EventEmitter<any>();  // Emisor para los filtros seleccionados
  topics: string[] = [];
  regions: { [key: string]: string[] } = {};  // Aquí almacenamos las regiones
  years: string[] = [];
  languages: string[] = [];
  selectedFilters: { [key: string]: boolean } = {};
  expandedRegions: { [key: string]: boolean } = {};  // Estado de expansión para cada región

  // Variables para controlar la visibilidad de "More" y "Less"
  visibleTopics: string[] = [];
  visibleYears: string[] = [];
  showMoreTopics = false;
  showMoreYears = false;

  hasMoreTopics = false;
  hasLessTopics = false;
  hasMoreYears = false;
  hasLessYears = false;

   // Definir los íconos de FontAwesome
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
    // Cargar los filtros desde el servicio
    this.loadFilters();
  }

  loadFilters() {
    this.dataService.getFilters().subscribe(data => {
      // Asignar las categorías, años e idiomas desde el archivo JSON
      this.topics = data.topics.sort();  // Ordenamos los temas alfabéticamente
      this.regions = data.regions;  // Cargamos las regiones
      this.years = data.years;
      this.languages = data.languages;

      // Inicializar los filtros seleccionados a false por defecto
      this.topics.forEach(topic => {
        this.selectedFilters[topic] = false;
      });

      // Inicializar filtros de regiones con países
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

       // Inicializa los filtros visibles
       this.updateVisibleFilters();
    });
  }

  updateVisibleFilters() {
    const topicsPerPage = 5;
    const yearsPerPage = 5;

    // Establecer los primeros 5 elementos visibles
    this.visibleTopics = this.topics.slice(0, topicsPerPage);
    this.visibleYears = this.years.slice(0, yearsPerPage);

    // Verificar si hay más elementos
    this.hasMoreTopics = this.topics.length > this.visibleTopics.length;
    this.hasMoreYears = this.years.length > this.visibleYears.length;

    // Verificar si hay elementos para reducir
    this.hasLessTopics = this.visibleTopics.length > 5;
    this.hasLessYears = this.visibleYears.length > 5;
  }

  toggleTopics() {
    const topicsPerPage = 5;
    if (this.hasMoreTopics) {
      // Muestra los siguientes 5 elementos (o menos si no hay tantos)
      const nextItems = this.topics.slice(this.visibleTopics.length, this.visibleTopics.length + topicsPerPage);
      this.visibleTopics = [...this.visibleTopics, ...nextItems];
    } else {
      // Reduce en bloques de 5 hasta los primeros 5
      if (this.visibleTopics.length > 5) {
        this.visibleTopics = this.visibleTopics.slice(0, this.visibleTopics.length - topicsPerPage);
      }
    }

    // Actualizar la visibilidad de los botones
    this.hasMoreTopics = this.topics.length > this.visibleTopics.length;
    this.hasLessTopics = this.visibleTopics.length > 5;
  }

  toggleYears() {
    const yearsPerPage = 5;
    if (this.hasMoreYears) {
      // Muestra los siguientes 5 elementos (o menos si no hay tantos)
      const nextItems = this.years.slice(this.visibleYears.length, this.visibleYears.length + yearsPerPage);
      this.visibleYears = [...this.visibleYears, ...nextItems];
    } else {
      // Reduce en bloques de 5 hasta los primeros 5
      if (this.visibleYears.length > 5) {
        this.visibleYears = this.visibleYears.slice(0, this.visibleYears.length - yearsPerPage);
      }
    }

    // Actualizar la visibilidad de los botones
    this.hasMoreYears = this.years.length > this.visibleYears.length;
    this.hasLessYears = this.visibleYears.length > 5;
  }


  // Función para alternar el estado de expansión de una región
  toggleRegion(regionKey: string): void {
    this.expandedRegions[regionKey] = !this.expandedRegions[regionKey];  // Alternar entre expandido y colapsado
    this.cdr.detectChanges();
  }

  emitFilters() {
    // Emitir los filtros seleccionados
    const selectedTopics = this.topics.filter(topic => this.selectedFilters[topic]);
    // Aquí usamos un tipo explícito de string[] para selectedCountries
    const selectedCountries: string[] = Object.keys(this.regions).reduce((selected: string[], region: string) => {
      // Reducir a un array de países seleccionados dentro de cada región
      const selectedInRegion = this.regions[region].filter(country => this.selectedFilters[country]);
      return [...selected, ...selectedInRegion];  // Concatenamos los países seleccionados
    }, []);
    const selectedYears = this.years.filter(year => this.selectedFilters[year]);
    const selectedLanguages = this.languages.filter(language => this.selectedFilters[language])
      .map(language => this.languageMapping[language]);  // Mapeamos los idiomas seleccionados

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
