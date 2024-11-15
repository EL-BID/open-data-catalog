import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { DataService } from '../data.service';  // Importar el DataService
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Importa FormsModule

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  languageMapping: { [key: string]: string } = {
    "English": "en",
    "Spanish": "es",
    "Portuguese": "pt",
    "French": "fr"
  };

  constructor(private dataService: DataService) { }

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
    });
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
}
