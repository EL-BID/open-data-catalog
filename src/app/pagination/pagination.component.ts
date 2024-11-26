import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Output() pageChanged: EventEmitter<number> = new EventEmitter<number>();

   get totalPages(): number {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    console.log('totalPages:', totalPages);
    return totalPages;
  }

  onPageChange(page: number): void {
    console.log('Cambio de página solicitado:', page);
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChanged.emit(this.currentPage);
    }
  }

  get pages(): number[] {
    const pages = [];
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;

    const delta = 2;
    const startPage = Math.max(1, currentPage - delta);
    const endPage = Math.min(totalPages, currentPage + delta);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (startPage > 2) {
      pages.unshift(1);
    }

    if (endPage < totalPages - 1) {
      pages.push(totalPages);
    }

    return pages;
  }
}
