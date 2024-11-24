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

  getRecentLinkedResearchDatasets(): Observable<any[]> {
    return this.getMetadata().pipe(
      map(datasets =>
        datasets
          .filter(dataset => dataset.source)
          .sort((a, b) => new Date(b.issued).getTime() - new Date(a.issued).getTime())
          .slice(0, 5)
      )
    );
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

  private formatNumber(count: number): string {
    if (count < 10) {
      return `${count}`;
    }
    const divisor = count < 100 ? 10 : count < 1000 ? 50 : 500;
    const rounded = Math.floor(count / divisor) * divisor;
    return `+${rounded}`;
  }

  getFormattedCounts(metadata: any[]): { datasets: string, linkedResearchDatasets: string } {
    const totalDatasets = metadata.length;
    const totalLinkedResearchDatasets = metadata.filter(item => item.source).length;

    return {
      datasets: this.formatNumber(totalDatasets),
      linkedResearchDatasets: this.formatNumber(totalLinkedResearchDatasets),
    };
  }

  generateDatasetRoute(mydata_category: string, title_original: string, mydata_id?: string): string {
    const formattedCategory = mydata_category
      ? mydata_category.replace(/[^a-zA-Z0-9]+/g, '-').substring(0, 50)
      : '';
    const formattedTitle = title_original
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .substring(0, 50);

    let route = '';
    if (formattedCategory && mydata_id) {
      route = `/${formattedCategory}/${formattedTitle}/${mydata_id}`;
    } else if (formattedCategory) {
      route = `/${formattedCategory}/${formattedTitle}`;
    } else if (mydata_id) {
      route = `/dataset/${formattedTitle}/${mydata_id}`;
    } else {
      route = `/dataset/${formattedTitle}`;
    }

    return route;
  }

}
