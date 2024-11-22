import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private searchTermSource = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSource.asObservable();

  constructor(private http: HttpClient) { }

  getMetadata(): Observable<any[]> {
    return this.http.get<any[]>('./assets/data/metadata.json');
  }

  getFilters(): Observable<any> {
    return this.http.get<any>('./assets/data/filters.json');
  }

  setSearchTerm(term: string): void {
    this.searchTermSource.next(term);
  }

  searchMetadata(): Observable<any[]> {
    return this.getMetadata().pipe(
      map(datasets =>
        datasets.filter(dataset =>
          dataset.title.toLowerCase().includes(this.searchTermSource.value.toLowerCase())
        )
      )
    );
  }

  getDataset(filename: string): Observable<any> {
    console.log('Filename recibido:', filename);
    return this.http.get(`./assets/datasets/${filename}.csv`, { responseType: 'text' });
  }

  downloadDataset(filename: string): Observable<Blob> {
    return this.http.get(`./assets/datasets/${filename}.csv`, { responseType: 'blob' });
  }
}
