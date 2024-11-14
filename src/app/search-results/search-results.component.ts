import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
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

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit(): void {
    this.dataService.getMetadata().subscribe(data => {
      this.datasets = data;
      this.applyFilters();  // Filtra y ordena en la carga inicial
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm'] || changes['sortBy'] || changes['filters']) {
      this.applyFilters(); // Filtra y ordena cada vez que hay un cambio
    }
  }

  private applyFilters(): void {
    this.filteredDatasets = this.datasets.filter(dataset =>
      dataset.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    this.sortDatasets();
    this.resultCountChange.emit(this.filteredDatasets.length);
    this.noResultsChange.emit(this.filteredDatasets.length === 0);
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
