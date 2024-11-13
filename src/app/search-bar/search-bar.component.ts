import { Component, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { DataService } from '../data.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, FontAwesomeModule, CommonModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  faSearch = faSearch;
  faTimes = faTimes;
  searchTerm: string = '';
  datasets: any[] = [];
  filteredSuggestions: any[] = [];
  selectedIndex: number = -1;  // Mantener el índice de la sugerencia seleccionada

  @Output() search: EventEmitter<string> = new EventEmitter<string>();

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // Cargar datasets al inicializar el componente
    this.dataService.getMetadata().subscribe(
      (data) => {
        this.datasets = data;
      },
      (error) => {
        console.error('Error al cargar el archivo metadata.json', error);
      }
    );
  }

  // Método llamado cuando el usuario presiona el ícono o botón de búsqueda
  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.search.emit(this.searchTerm.trim());
      this.filteredSuggestions = []; // Cerrar la lista de sugerencias
      this.dataService.setSearchTerm(this.searchTerm); // Actualizar el término en DataService
    }
  }

  // Método para actualizar las sugerencias en tiempo real mientras el usuario escribe
  onSearchTermChange(): void {
    this.dataService.setSearchTerm(this.searchTerm); // Actualizar el término de búsqueda en el servicio

    if (this.searchTerm) {
      // Filtrar las sugerencias basadas en el título de los datasets
      this.filteredSuggestions = this.datasets.filter(dataset =>
        dataset.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredSuggestions = []; // Si no hay término de búsqueda, no mostrar sugerencias
    }

    // Emitir la búsqueda también para actualizar los resultados de manera inmediata
    this.search.emit(this.searchTerm);
  }

  // Método para seleccionar una sugerencia y realizar la búsqueda
  selectSuggestion(suggestion: string): void {
    this.searchTerm = suggestion;
    this.filteredSuggestions = [];
    this.onSearch(); // Ejecutar la búsqueda al seleccionar la sugerencia
  }

   // Método para limpiar la búsqueda
   clearSearch(): void {
    this.searchTerm = '';  // Limpiar el término de búsqueda
    this.filteredSuggestions = [];  // Limpiar las sugerencias filtradas
    this.search.emit(this.searchTerm);  // Emitir el evento con un término vacío
  }
  // Detectar clics fuera de la barra de búsqueda y las sugerencias
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const searchInputElement = document.querySelector('.search-bar'); // Reemplaza con el selector de tu barra de búsqueda
    const suggestionListElement = document.querySelector('.suggestions-list'); // Reemplaza con el selector de la lista de sugerencias

    if (searchInputElement && suggestionListElement) {
      const clickedInsideSearch = searchInputElement.contains(event.target as Node);
      const clickedInsideSuggestions = suggestionListElement.contains(event.target as Node);

      // Si el clic es fuera de la barra de búsqueda y las sugerencias, ocultar las sugerencias
      if (!clickedInsideSearch && !clickedInsideSuggestions) {
        this.filteredSuggestions = [];
      }
    }
  }

  // Detectar cuando el elemento pierde el foco (por ejemplo, al usar TAB)
  @HostListener('focusout', ['$event'])
  onFocusOut(event: FocusEvent): void {
    const searchInputElement = document.querySelector('.search-bar'); // Reemplaza con el selector de tu barra de búsqueda
    const suggestionListElement = document.querySelector('.suggestions-list'); // Reemplaza con el selector de la lista de sugerencias

    // Si el elemento que pierde el foco no es ni la barra de búsqueda ni las sugerencias, cerrar las sugerencias
    if (searchInputElement && suggestionListElement) {
      const lostFocusOnSearch = !searchInputElement.contains(event.relatedTarget as Node);
      const lostFocusOnSuggestions = !suggestionListElement.contains(event.relatedTarget as Node);

      if (lostFocusOnSearch && lostFocusOnSuggestions) {
        this.filteredSuggestions = [];
      }
    }
  }

  // Método para manejar las teclas de dirección y Enter
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      // Mover hacia abajo en las sugerencias
      if (this.selectedIndex < this.filteredSuggestions.length - 1) {
        this.selectedIndex++;
      }
    } else if (event.key === 'ArrowUp') {
      // Mover hacia arriba en las sugerencias
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
      }
    } else if (event.key === 'Enter' && this.selectedIndex !== -1) {
      // Seleccionar la sugerencia actual
      this.selectSuggestion(this.filteredSuggestions[this.selectedIndex].title);
    }

    // Agregar consola para depuración
    console.log('Selected Index:', this.selectedIndex);
    console.log('Filtered Suggestions:', this.filteredSuggestions);
  }


}
