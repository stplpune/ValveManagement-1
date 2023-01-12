import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TankCalibrationComponent } from './tank-calibration.component';

describe('TankCalibrationComponent', () => {
  let component: TankCalibrationComponent;
  let fixture: ComponentFixture<TankCalibrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TankCalibrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TankCalibrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
