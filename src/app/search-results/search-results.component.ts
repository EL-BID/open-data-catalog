// search-results.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
  datasets: any[] = [];  // Datos de datasets completos
  filteredDatasets: any[] = [];  // Datos de datasets filtrados según búsqueda
  noResults: boolean = false; // Indicador para mostrar el mensaje de "no resultados"

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    // Obtener los datasets cuando se cargue el componente
    this.dataService.getMetadata().subscribe(data => {
      this.datasets = data;  // Guarda todos los datasets
      this.filteredDatasets = data;  // Muestra todos los datasets inicialmente
      this.noResults = this.filteredDatasets.length === 0; // Si no hay datos, marcar no resultados
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm']) {
      // Ejecuta el filtro cada vez que el searchTerm cambia
      this.filterDatasets(this.searchTerm);
    }
  }

  filterDatasets(searchTerm: string): void {
    if (searchTerm) {
      this.filteredDatasets = this.datasets.filter(dataset =>
        dataset.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      this.filteredDatasets = this.datasets;  // Si no hay búsqueda, muestra todos los datasets
    }
     // Verificar si se encontraron resultados
     this.noResults = this.filteredDatasets.length === 0;
  }

  viewDataset(category: string, filename: string): void {
    this.router.navigate([`/dataset/${category}/${filename}`]);
  }
}
