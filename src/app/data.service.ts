import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  // Método para obtener metadata del dataset desde JSON
  getMetadata(): Observable<any[]> {
    return this.http.get<any[]>('/assets/data/metadata.json');
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
