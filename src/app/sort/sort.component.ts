import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.loadSortOption();
  }

  loadSortOption(): void {
    const sort = this.route.snapshot.queryParamMap.get('sortBy');
    if (sort) {
      this.sortOption = sort;
    }
  }

  onSortChanged(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.sortChanged.emit(value);
    this.updateUrlWithSortOption(value);
  }

  updateUrlWithSortOption(sortBy: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sortBy: sortBy },
      queryParamsHandling: 'merge'
    });
  }
}
