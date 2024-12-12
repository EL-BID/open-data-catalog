import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CkanTestComponent } from './ckan-test.component';

describe('CkanTestComponent', () => {
  let component: CkanTestComponent;
  let fixture: ComponentFixture<CkanTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CkanTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CkanTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
