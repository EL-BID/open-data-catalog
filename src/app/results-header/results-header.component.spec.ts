import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsHeaderComponent } from './results-header.component';

describe('ResultsHeaderComponent', () => {
  let component: ResultsHeaderComponent;
  let fixture: ComponentFixture<ResultsHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
