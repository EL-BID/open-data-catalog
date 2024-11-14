import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sort',
  standalone: true,
  imports: [],
  templateUrl: './sort.component.html',
  styleUrl: './sort.component.scss'
})
export class SortComponent {
  @Output() sortChanged: EventEmitter<string> = new EventEmitter<string>();

  onSortChanged(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.sortChanged.emit(value);  // Emitir el valor seleccionado como string
  }
}
