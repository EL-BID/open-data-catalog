import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetCatalogComponent } from './dataset-catalog.component';

describe('DatasetCatalogComponent', () => {
  let component: DatasetCatalogComponent;
  let fixture: ComponentFixture<DatasetCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
