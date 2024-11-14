import { Component, Input } from '@angular/core';
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
}
