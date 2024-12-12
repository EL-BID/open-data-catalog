import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CkanTestService {
  private apiUrl = 'https://uatweb.iadb.links.com.au/api/3/action/datastore_search';

  constructor(private http: HttpClient) {}

  testCkanApi() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'CKAN_API_KEY'
    });

    const body = {
      resource_id: 'CKAN_RESOURCE_ID',
      limit: '5'
    };

    this.http.post(this.apiUrl, body, { headers }).subscribe({
      next: (data) => console.log('Respuesta CKAN:', data),
      error: (err) => console.error('Error CORS/CKAN:', err)
    });
  }
}
