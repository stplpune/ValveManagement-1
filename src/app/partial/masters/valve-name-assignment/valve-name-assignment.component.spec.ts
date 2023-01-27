import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValveNameAssignmentComponent } from './valve-name-assignment.component';

describe('ValveNameAssignmentComponent', () => {
  let component: ValveNameAssignmentComponent;
  let fixture: ComponentFixture<ValveNameAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValveNameAssignmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValveNameAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
