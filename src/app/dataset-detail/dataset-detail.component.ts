import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { Title, Meta } from '@angular/platform-browser';
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

  sortedThemes: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit(): void {
    this.mydataCategory = this.route.snapshot.paramMap.get('mydata_category');
    console.log(this.mydataCategory);
    this.titleOriginal = this.route.snapshot.paramMap.get('title_original');
    console.log (this.titleOriginal);
    this.mydataId = this.route.snapshot.paramMap.get('mydata_id');
    console.log(this.mydataId);
    this.loadMetadata();
  }

  loadMetadata(): void {
    this.dataService.getMetadata().subscribe(
      (data) => {

        const formatSocrataTitle = (title: string) =>
          title.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().substring(0, 50);

        const formatGithubTitle = (title: string) =>
          title.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(/-+$/g, '');

        const findDataset = (): any => {
          if (this.titleOriginal) {
            const formattedSocrataTitle = formatSocrataTitle(this.titleOriginal);
            const categoryToSearch = this.mydataCategory || 'dataset';

            return data.find((d) => {
              const matchesId = this.mydataId && d.mydata_id?.toLowerCase() === this.mydataId?.toLowerCase();
              const matchesCategory = d.mydata_category?.toLowerCase() === categoryToSearch.toLowerCase() || !d.mydata_category;
              const matchesTitle = formatSocrataTitle(d.title_original) === formattedSocrataTitle;
              const matchesResource = this.mydataCategory === 'resource' && d.mydata_id?.toLowerCase() === this.titleOriginal?.toLowerCase();

              return (this.mydataCategory === 'idb' && this.titleOriginal === 'dataset' && matchesId) ||
                     matchesResource ||
                     (matchesCategory && matchesTitle);
            });
          }

          return null;
        };

        const dataset = findDataset();

        if (dataset) {
          this.dataset = dataset;
          this.loading = false;

          this.sortedThemes = dataset.theme ? dataset.theme.sort() : [];

          const dynamicTitle = dataset.title || 'Dataset';
          this.titleService.setTitle(`IDB Open Data LAC | ${dynamicTitle}`);

          this.updateMetaTags(dataset);

          const category = dataset.mydata_category || "dataset";

          this.router.navigate([`/${category.toLowerCase()}/${formatGithubTitle(dataset.title_original)}`], { replaceUrl: true }).then(() => {
              this.titleService.setTitle(`IDB Open Data LAC | ${dynamicTitle}`);
          });

        } else {
          this.router.navigate(["/browse"]);
        }
      },
      (error) => {
        this.router.navigate(["/"]);
      }
    );
  }

  updateMetaTags(dataset: any): void {
    const description = dataset.description;
    const keywords = (dataset.keyword || '').join(', ');
    const datePublished = dataset.issued;
    const dateModified = dataset.modified;
    const license = dataset.license || '';

    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: keywords });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({ name: 'datePublished', content: datePublished });
    this.metaService.updateTag({ name: 'dateModified', content: dateModified });
    this.metaService.updateTag({ name: 'license', content: license });
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
