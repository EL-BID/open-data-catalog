import { Component, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Importar para acceder y actualizar la URL
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

  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router) { }

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
    // Leer el parámetro "search" de la URL
    this.loadSearchTermFromUrl();
  }

  loadSearchTermFromUrl(): void {
    const search = this.route.snapshot.queryParamMap.get('search');
    if (search) {
      this.searchTerm = search;  // Establecer el término de búsqueda desde la URL
      this.search.emit(this.searchTerm);  // Emitir el evento con el término cargado
    }
  }

  // Método llamado cuando el usuario presiona el ícono o botón de búsqueda
  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.search.emit(this.searchTerm.trim());
      this.filteredSuggestions = []; // Cerrar la lista de sugerencias
      this.dataService.setSearchTerm(this.searchTerm); // Actualizar el término en DataService

      // Actualizar la URL con el término de búsqueda
      this.router.navigate([], {
        queryParams: { search: this.searchTerm },
        queryParamsHandling: 'merge', // Para que no se pierdan otros parámetros en la URL
      });
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
  // Restablecer el índice seleccionado cuando el término de búsqueda cambia
  this.selectedIndex = -1;
  // Emitir la búsqueda también para actualizar los resultados de manera inmediata
  this.search.emit(this.searchTerm);

  // Actualizar la URL con el nuevo término de búsqueda
  this.router.navigate([], {
    queryParams: { search: this.searchTerm },
    queryParamsHandling: 'merge', // Para que no se pierdan otros parámetros en la URL
  });
}

  // Método para seleccionar una sugerencia y realizar la búsqueda
  selectSuggestion(suggestion: string, index:number): void {
    this.searchTerm = suggestion;  // Establecer el término de búsqueda con la sugerencia seleccionada
    this.selectedIndex = index;    // Actualizar el índice seleccionado
    this.filteredSuggestions = [];  // Limpiar la lista de sugerencias
    this.search.emit(this.searchTerm);  // Emitir el evento con el término actualizado

    // Actualizar la URL con el término de búsqueda
    this.router.navigate([], {
      queryParams: { search: this.searchTerm },
      queryParamsHandling: 'merge', // Para que no se pierdan otros parámetros en la URL
    });
  }
  // Método para limpiar la búsqueda
  clearSearch(): void {
    this.searchTerm = '';  // Limpiar el término de búsqueda
    this.filteredSuggestions = [];  // Limpiar las sugerencias filtradas
    this.search.emit(this.searchTerm);  // Emitir el evento con un término vacío

    // Actualizar la URL para eliminar el parámetro de búsqueda
    this.router.navigate([], {
      queryParams: { search: null },
      queryParamsHandling: 'merge', // Para que no se pierdan otros parámetros en la URL
    });
  }

  // Detectar clics fuera de la barra de búsqueda y las sugerencias
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    // No ejecutar este código si se hace clic dentro de la lista de sugerencias
    const searchInputElement = document.querySelector('.search-bar');
    const suggestionListElement = document.querySelector('.suggestions-list');

    if (searchInputElement && suggestionListElement) {
      const clickedInsideSearch = searchInputElement.contains(event.target as Node);
      const clickedInsideSuggestions = suggestionListElement.contains(event.target as Node);

      // Solo limpiar las sugerencias si no se hace clic ni dentro de la barra de búsqueda ni dentro de las sugerencias
      if (!clickedInsideSearch && !clickedInsideSuggestions) {
        this.filteredSuggestions = []; // Limpiar sugerencias solo si se hace clic fuera
      }
    }
  }

  // Método para manejar las teclas de dirección y Enter
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' && this.selectedIndex < this.filteredSuggestions.length - 1) {
      this.selectedIndex++;
    } else if (event.key === 'ArrowUp' && this.selectedIndex > 0) {
      this.selectedIndex--;
    } else if (event.key === 'Enter' && this.selectedIndex !== -1) {
      this.selectSuggestion(this.filteredSuggestions[this.selectedIndex].title, this.selectedIndex);
    }
  }

}
