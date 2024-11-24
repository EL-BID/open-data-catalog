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

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getMetadata().subscribe(metadata => {
      this.counts = this.dataService.getFormattedCounts(metadata);
    });

    this.dataService.getRecentLinkedResearchDatasets().subscribe(datasets => {
      this.recentDatasets = datasets;
    });
  }
  // Generar la URL del dataset usando el servicio
  generateDatasetUrl(dataset: any): string {
    return this.dataService.generateDatasetRoute(dataset.mydata_category, dataset.title_original, dataset.mydata_id);
  }
}
