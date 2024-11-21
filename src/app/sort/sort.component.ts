import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Para acceder a los parámetros de la URL

@Component({
  selector: 'app-sort',
  standalone: true,
  imports: [],
  templateUrl: './sort.component.html',
  styleUrls: ['./sort.component.scss']
})
export class SortComponent implements OnInit {
  @Output() sortChanged: EventEmitter<string> = new EventEmitter<string>();
  sortOption: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Llamar a la función para cargar la opción de sort desde la URL
    this.loadSortOption();
  }

  loadSortOption(): void {
    // Obtener el valor de "sortBy" de los parámetros de la URL
    const sort = this.route.snapshot.queryParamMap.get('sortBy');
    if (sort) {
      this.sortOption = sort;  // Si 'sortBy' está en la URL, asignar su valor
    }
  }

  onSortChanged(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.sortChanged.emit(value);  // Emitir el cambio
    this.updateUrlWithSortOption(value);  // Actualizar la URL con el nuevo valor de sortBy
  }

  // Función para actualizar la URL con el nuevo valor de sortBy
  updateUrlWithSortOption(sortBy: string): void {
    // Actualizar la URL con el parámetro sortBy
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sortBy: sortBy },
      queryParamsHandling: 'merge'  // Mantener los demás parámetros en la URL
    });
  }
}
