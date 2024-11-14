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
  categories: string[] = [];
  years: string[] = [];
  selectedFilters: { [key: string]: boolean } = {};

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // Cargar los filtros desde el servicio
    this.loadFilters();
  }

  loadFilters() {
    this.dataService.getFilters().subscribe(data => {
      // Asignar las categorías y años desde el archivo JSON
      this.categories = data.categories;
      this.years = data.years;

      // Inicializar los filtros seleccionados a false por defecto
      this.categories.forEach(category => {
        this.selectedFilters[category] = false;
      });

      this.years.forEach(year => {
        this.selectedFilters[year] = false;
      });
    });
  }

  emitFilters() {
    // Emitir los filtros seleccionados
    const selectedCategories = this.categories.filter(category => this.selectedFilters[category]);
    const selectedYears = this.years.filter(year => this.selectedFilters[year]);

    this.filtersChanged.emit({
      categories: selectedCategories,
      years: selectedYears
    });
  }
}
