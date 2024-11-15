import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private searchTermSource = new BehaviorSubject<string>('');  // Fuente del término de búsqueda
  searchTerm$ = this.searchTermSource.asObservable();           // Observable para el término de búsqueda

  constructor(private http: HttpClient) {}

  // Método para obtener metadata del dataset desde JSON
  getMetadata(): Observable<any[]> {
    return this.http.get<any[]>('./assets/data/metadata.json');
  }

  // Método para obtener filtros (categorías, años, etc.) desde un archivo JSON
  getFilters(): Observable<any> {
    return this.http.get<any>('./assets/data/filters.json');
  }

  // Método para actualizar el término de búsqueda
  setSearchTerm(term: string): void {
    this.searchTermSource.next(term);
  }

  // Método para buscar metadata basado en el término de búsqueda
  searchMetadata(): Observable<any[]> {
    return this.getMetadata().pipe(
      map(datasets =>
        datasets.filter(dataset =>
          dataset.title.toLowerCase().includes(this.searchTermSource.value.toLowerCase())
        )
      )
    );
  }

  // Método para obtener el archivo CSV del dataset
  getDataset(category: string, filename: string): Observable<any> {
    return this.http.get(`/assets/datasets/${category}/${filename}.csv`, { responseType: 'text' });
  }

  // Método para descargar el dataset CSV (opcional)
  downloadDataset(category: string, filename: string): Observable<Blob> {
    // Asegúrate de que solo pase el nombre del archivo con su extensión
    return this.http.get(`/assets/datasets/${category}/${filename}.csv`, { responseType: 'blob' });
  }


}
