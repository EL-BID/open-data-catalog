import { Component, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  selectedIndex: number = -1;

  @Output() search: EventEmitter<string> = new EventEmitter<string>();

  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.dataService.getMetadata().subscribe(
      (data) => {
        this.datasets = data;
      },
      (error) => {
        console.error('Error al cargar el archivo metadata.json', error);
      }
    );
    this.loadSearchTermFromUrl();
  }

  loadSearchTermFromUrl(): void {
    const search = this.route.snapshot.queryParamMap.get('search');
    if (search) {
      this.searchTerm = search;
      this.search.emit(this.searchTerm);
    }
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.search.emit(this.searchTerm.trim());
      this.filteredSuggestions = [];
      this.dataService.setSearchTerm(this.searchTerm);

      this.router.navigate([], {
        queryParams: { search: this.searchTerm },
        queryParamsHandling: 'merge',
      });
    }
  }

  onSearchTermChange(): void {
    this.dataService.setSearchTerm(this.searchTerm);

    if (this.searchTerm) {
      this.filteredSuggestions = this.datasets.filter(dataset =>
        dataset.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
      .slice(0, 5);
    } else {
      this.filteredSuggestions = [];
    }
    this.selectedIndex = -1;
    this.search.emit(this.searchTerm);

    this.router.navigate([], {
      queryParams: { search: this.searchTerm },
      queryParamsHandling: 'merge',
    });
  }

  selectSuggestion(suggestion: string, index: number): void {
    this.searchTerm = suggestion;
    this.selectedIndex = index;
    this.filteredSuggestions = [];
    this.search.emit(this.searchTerm);

    this.router.navigate([], {
      queryParams: { search: this.searchTerm },
      queryParamsHandling: 'merge',
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredSuggestions = [];
    this.search.emit(this.searchTerm);

    this.router.navigate([], {
      queryParams: { search: null },
      queryParamsHandling: 'merge',
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const searchInputElement = document.querySelector('.search-bar');
    const suggestionListElement = document.querySelector('.suggestions-list');

    if (searchInputElement && suggestionListElement) {
      const clickedInsideSearch = searchInputElement.contains(event.target as Node);
      const clickedInsideSuggestions = suggestionListElement.contains(event.target as Node);
      if (!clickedInsideSearch && !clickedInsideSuggestions) {
        this.filteredSuggestions = [];
      }
    }
  }

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
