import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDownload, faEarthAmerica, faCircleInfo, faDatabase, faUserShield, faLink } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dataset-detail',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './dataset-detail.component.html',
  styleUrls: ['./dataset-detail.component.scss']
})
export class DatasetDetailComponent implements OnInit {
  faDownload = faDownload;
  faEarthAmerica = faEarthAmerica;
  faCircleInfo = faCircleInfo;
  faDatabase = faDatabase;
  faUserShield = faUserShield;
  faLink = faLink;
  mydataCategory: string | null = null;
  titleOriginal: string | null = null;
  mydataId: string | null = null;
  filename: string | null = null;
  dataset: any;
  datasetContent: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.mydataCategory = this.route.snapshot.paramMap.get('mydata_category');
    this.titleOriginal = this.route.snapshot.paramMap.get('title_original');
    this.mydataId = this.route.snapshot.paramMap.get('mydata_id');
    console.log("mydataCategory:", this.mydataCategory);
    console.log("titleOriginal:", this.titleOriginal);
    console.log("mydataId:", this.mydataId);
    this.loadMetadata();
  }

  loadMetadata(): void {
    this.dataService.getMetadata().subscribe(data => {
      console.log('Metadata:', data);
      console.log('titleOriginal en la URL:', this.titleOriginal);
      console.log('mydataId:', this.mydataId);

      if (this.mydataCategory === 'resource' && this.titleOriginal) {
        // Caso especial: buscar por titleOriginal como ID
        this.dataset = data.find(d => d.mydata_id === this.titleOriginal);

        if (this.dataset) {
          console.log('Dataset encontrado para resource:', this.dataset);
        } else {
          console.error('Dataset no encontrado para category: resource y ID:', this.titleOriginal);
        }
      } else if (this.titleOriginal) {
        // Lógica general: buscar por categoría, ID y título
        const formattedTitleFromUrl = this.titleOriginal.replace(/[^a-zA-Z0-9]+/g, '-').substring(0, 50);

        this.dataset = data.find(d => {
          const formattedTitleFromMetadata = d.title_original.replace(/[^a-zA-Z0-9]+/g, '-').substring(0, 50);
          const categoryMatches = this.mydataCategory ? d.mydata_category === this.mydataCategory : true;
          const idMatches = d.mydata_id === this.mydataId;

          return categoryMatches && idMatches && formattedTitleFromMetadata === formattedTitleFromUrl;
        });

        if (this.dataset) {
          console.log('Dataset encontrado:', this.dataset);
        } else {
          console.error('Dataset no encontrado en la metadata. Revisa los parámetros.');
        }
      } else {
        console.error('Parámetros insuficientes para buscar el dataset.');
      }

      this.loading = false;
    }, error => {
      console.error('Error al cargar la metadata:', error);
      this.loading = false;
    });
  }

  sortCountries(spatial: string | string[]): string {
    if (!spatial) {
      return '';
    }
    if (typeof spatial === 'string') {
      return spatial;
    }
    if (Array.isArray(spatial)) {
      const sortedCountries = spatial.sort((a, b) => a.localeCompare(b));

      if (sortedCountries.length === 1) {
        return sortedCountries[0];
      } else if (sortedCountries.length === 2) {
        return sortedCountries.join(' and ');
      } else {
        const allExceptLast = sortedCountries.slice(0, -1).join(', ');
        const lastCountry = sortedCountries[sortedCountries.length - 1];
        return `${allExceptLast} and ${lastCountry}`;
      }
    }
    return '';
  }

  getAuthors(): string {
    const personalAuthors = (this.dataset?.creator_personal?.join(', ') || '').trim();
    const organizationalAuthors = (this.dataset?.creator_organizational?.join(', ') || '').trim();
    const authors = [personalAuthors, organizationalAuthors]
      .filter(author => author)
      .join('; ');
    return authors.replace(/;\s+/g, '; ').trim();
  }

  getLicense(): string {
    const licenseUrl = this.dataset?.license || '';
    const issuedDate = new Date(this.dataset?.issued || '');
    const cutoffDate = new Date('2022-05-11');
    const defaultLicense = issuedDate < cutoffDate
      ? 'https://creativecommons.org/licenses/by/3.0/igo/legalcode'
      : 'https://creativecommons.org/licenses/by/4.0/legalcode';
    const finalLicenseUrl = licenseUrl || defaultLicense;
    return finalLicenseUrl;
  }

  getSortedKeywords(): string[] {
    if (Array.isArray(this.dataset?.keyword)) {
      return this.dataset?.keyword
        .map((keyword: string) => keyword.trim())
        .sort((a: string, b: string) => a.localeCompare(b));
    }
    if (typeof this.dataset?.keyword === 'string') {
      return this.dataset?.keyword
        .split(',')
        .map((keyword: string) => keyword.trim())
        .sort((a: string, b: string) => a.localeCompare(b));
    }
    return [];
  }
}
