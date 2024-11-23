import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule} from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  counts = {
    datasets: '0',
    linkedResearchDatasets: '0',
  };

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getMetadata().subscribe(metadata => {
      this.counts = this.dataService.getFormattedCounts(metadata);
    });
  }
}
