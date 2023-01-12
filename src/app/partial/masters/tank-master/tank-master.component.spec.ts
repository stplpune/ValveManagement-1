import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TankMasterComponent } from './tank-master.component';

describe('TankMasterComponent', () => {
  let component: TankMasterComponent;
  let fixture: ComponentFixture<TankMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TankMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TankMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
