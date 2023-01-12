import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TankSensorDeviceMasterComponent } from './tank-sensor-device-master.component';

describe('TankSensorDeviceMasterComponent', () => {
  let component: TankSensorDeviceMasterComponent;
  let fixture: ComponentFixture<TankSensorDeviceMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TankSensorDeviceMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TankSensorDeviceMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
