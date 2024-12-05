import { Meta, Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule} from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  counts = {
    datasets: '0',
    linkedResearchDatasets: '0',
  };

  recentDatasets: any[] = [];

  constructor(private dataService: DataService, private metaService: Meta, private titleService: Title,) {}

  ngOnInit(): void {
    this.dataService.getMetadata().subscribe(metadata => {
      this.counts = this.dataService.getFormattedCounts(metadata);
    });

    this.dataService.getRecentLinkedResearchDatasets().subscribe(datasets => {
      this.recentDatasets = datasets;
    });
    this.setMetaTags();
  }

  setMetaTags(): void {
    const pageDescription = 'Discover the Inter-American Development Bank’s open data resources for Latin America and the Caribbean. Explore datasets, data-driven research publications, indicators, and data portals.';
    const keywords = 'open data, Latin America, Caribbean, IDB, research data, indicators, data portals, regional data, datasets, Open Data LAC';

    this.titleService.setTitle('IDB Open Data LAC');
    this.metaService.updateTag({ name: 'description', content: pageDescription });
    this.metaService.updateTag({ name: 'keywords', content: keywords });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({ name: 'author', content: 'Inter-American Development Bank (IDB)' });
    this.metaService.updateTag({ property: 'og:title', content: 'IDB Open Data LAC' });
    this.metaService.updateTag({ property: 'og:description', content: pageDescription });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:image', content: 'https://github.com/EL-BID/open-data-catalog/raw/878f649543aca6b14bfc082c5d27866df27cab7b/public/assets/images/open-graph/open-data-lac.png' });
    this.metaService.updateTag({ property: 'og:image:alt', content: 'Screenshot of the IDB Open Data LAC' });
  }

  generateDatasetUrl(dataset: any): string {
    return this.dataService.generateDatasetRoute(dataset.mydata_category, dataset.title_original, dataset.mydata_id);
  }
}
