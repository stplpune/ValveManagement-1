import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValveConnectionComponent } from './valve-connection.component';

describe('ValveConnectionComponent', () => {
  let component: ValveConnectionComponent;
  let fixture: ComponentFixture<ValveConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValveConnectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValveConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
