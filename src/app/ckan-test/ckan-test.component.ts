import { Component, OnInit } from '@angular/core';
import { CkanTestService } from '../ckan-test.service';

@Component({
  standalone: true,
  selector: 'app-ckan-test',
  template: `
    <div>
      <h1>CKAN API Test</h1>
      <button (click)="testApi()">Probar API CKAN</button>
    </div>
  `
})
export class CkanTestComponent implements OnInit  {
  constructor(private ckanService: CkanTestService) {}

  ngOnInit(): void {
  }

  testApi() {
    this.ckanService.testCkanApi();
  }
}
