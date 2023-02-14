import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumerWaterSummeryComponent } from './consumer-water-summery.component';

describe('ConsumerWaterSummeryComponent', () => {
  let component: ConsumerWaterSummeryComponent;
  let fixture: ComponentFixture<ConsumerWaterSummeryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumerWaterSummeryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumerWaterSummeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
