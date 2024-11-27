import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-results-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-header.component.html',
  styleUrl: './results-header.component.scss'
})
export class ResultsHeaderComponent {
  @Input() resultCount: number = 0;
  @Input() searchTerm: string = '';
  @Input() noResults: boolean = false;
  @Input() filters: { [key: string]: string[] } = {};

  @Output() filterRemoved = new EventEmitter<{ category: string, value: string }>();

  get hasFilters(): boolean {
    return this.filters && typeof this.filters === 'object' && Object.keys(this.filters).length > 0;
  }

  removeFilter(category: string, value: string): void {
    this.filterRemoved.emit({ category, value });
  }

  formatFilters(filters: { [key: string]: string[] }): { category: string, value: string }[] {
    if (!filters || Object.keys(filters).length === 0) return [];

    let filterElements: { category: string, value: string }[] = [];

    Object.keys(filters).forEach(category => {
      const values = filters[category];
      if (values && values.length > 0) {
        values.forEach((value: string) => {
          filterElements.push({ category, value });
        });
      }
    });

    return filterElements;
  }

}
