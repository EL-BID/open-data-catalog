import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { Title } from '@angular/platform-browser';
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
  filename: string | null = null;
  dataset: any;
  datasetContent: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router,
    private titleService: Title
  ) { }

  ngOnInit(): void {
    console.log("Ruta actual:", this.router.url); // Esto te dará la ruta actual
    console.log("Snapshot params:", this.route.snapshot.paramMap.keys);
    this.mydataCategory = this.route.snapshot.paramMap.get('mydata_category');
    this.titleOriginal = this.route.snapshot.paramMap.get('title_original');
    console.log("mydataCategory:", this.mydataCategory);
    console.log("titleOriginal:", this.titleOriginal);
    this.loadMetadata();
  }

  loadMetadata(): void {
    this.dataService.getMetadata().subscribe(
      (data) => {
        console.log("Metadata cargada:", data);

        const formatTitle = (title: string) =>
          title.replace(/[^a-zA-Z0-9]+/g, '-').substring(0, 50);

        const findDataset = (): any => {
          if (this.mydataCategory === "resource" && this.titleOriginal) {
            return data.find(
              (d) => d.mydata_id?.toLowerCase() === this.titleOriginal?.toLowerCase()
            );
          }

          if (this.titleOriginal) {
            const formattedTitle = formatTitle(this.titleOriginal);
            const categoryToSearch = this.mydataCategory || "dataset";

            return data.find((d) => {
              const matchesCategory =
                d.mydata_category?.toLowerCase() === categoryToSearch.toLowerCase() ||
                !d.mydata_category;
              const matchesTitle =
                formatTitle(d.title_original).toLowerCase() === formattedTitle.toLowerCase();

              return matchesCategory && matchesTitle;
            });
          }

          return null;
        };

        const dataset = findDataset();

        if (dataset) {
          console.log("Dataset encontrado:", dataset);
          this.dataset = dataset;
          this.loading = false;

          const dynamicTitle = dataset.title || 'Dataset';
          this.titleService.setTitle(`IDB | ${dynamicTitle}`);

          if (this.mydataCategory === "resource") {
            const formattedTitle = formatTitle(dataset.title_original || "");
            const category = dataset.mydata_category || "dataset";

            this.router.navigate([`/${category}/${formattedTitle}`], { replaceUrl: true }).then(() => {
            this.titleService.setTitle(`IDB | ${dynamicTitle}`);
            });
          }
        } else {
          console.error("Dataset no encontrado. Redirigiendo...");
          this.router.navigate(["/not-found"]);
        }
      },
      (error) => {
        console.error("Error al cargar la metadata:", error);
        this.router.navigate(["/not-found"]);
      }
    );
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
