import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValveWaterSummeryComponent } from './valve-water-summery.component';

describe('ValveWaterSummeryComponent', () => {
  let component: ValveWaterSummeryComponent;
  let fixture: ComponentFixture<ValveWaterSummeryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValveWaterSummeryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValveWaterSummeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
