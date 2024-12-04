import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    private dataService: DataService,
    private router: Router
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

      const formatTitle = (title: string) => {
        return title
          .replace(/[^a-zA-Z0-9]+/g, '-')
          .substring(0, 50)
      };

      const categoryToSearch = this.mydataCategory || 'dataset';

      const findDataset = (title: string, category?: string, mydataId?: string) => {
        return data.find(d => {
          const formattedTitle = formatTitle(d.title_original || '');
          const formattedTitleFromUrl = formatTitle(title);
          const categoryMatches = category
            ? (d.mydata_category?.toLowerCase() === category.toLowerCase() || !d.mydata_category || d.mydata_category === '')
            : true;
          const idMatches = mydataId ? d.mydata_id?.toLowerCase() === mydataId.toLowerCase() : true;
          console.log('Comparando:', {
            categoryMatches,
            idMatches,
            formattedTitle,
            formattedTitleFromUrl,
            category: d.mydata_category
          });

          return categoryMatches && idMatches && formattedTitle.toLocaleLowerCase() === formattedTitleFromUrl.toLocaleLowerCase();
        });
      };

      if (this.mydataCategory === 'resource' && this.titleOriginal) {
        this.dataset = data.find(d => d.mydata_id?.toLowerCase() === this.titleOriginal?.toLowerCase());

        if (!this.dataset) {
          console.error('Dataset no encontrado para category: resource y ID:', this.mydataId);
          this.router.navigate(['/not-found']);
        } else {
          const mydataCategory = this.dataset.mydata_category || 'dataset';
          const titleOriginal = this.dataset.title_original;
          const mydataId = this.dataset.mydata_id;

          const formattedTitle = formatTitle(titleOriginal);
          this.router.navigate([`/${mydataCategory}/${formattedTitle}`]);
        }
      }
      else if (this.titleOriginal) {
        this.dataset = findDataset(this.titleOriginal ?? '', categoryToSearch, this.mydataId ?? '');

        if (this.dataset) {
          console.log('Dataset encontrado:', this.dataset);
          const formattedTitle = formatTitle(this.dataset.title_original);
          const category = this.dataset.mydata_category || 'dataset';
          this.router.navigate([`/${category}/${formattedTitle}`], { replaceUrl: true });
        } else {
          console.error('Dataset no encontrado. Revisar parámetros.');
          this.router.navigate(['/not-found']);
        }
      } else {
        console.error('Parámetros insuficientes para buscar el dataset.');
      }

      this.loading = false;
    }, error => {
      console.error('Error al cargar la metadata:', error);
      this.loading = false;
      this.router.navigate(['/not-found']);
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
    const personalAuthors = this.dataset?.creator_personal?.map((author: string) => author.trim()) || [];
    const organizationalAuthors = this.dataset?.creator_organizational?.map((author: string) => author.trim()) || [];
    return [...personalAuthors, ...organizationalAuthors].join('; ').trim();
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
