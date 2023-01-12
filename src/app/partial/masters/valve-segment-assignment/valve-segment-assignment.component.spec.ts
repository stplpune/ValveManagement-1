import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValveSegmentAssignmentComponent } from './valve-segment-assignment.component';

describe('ValveSegmentAssignmentComponent', () => {
  let component: ValveSegmentAssignmentComponent;
  let fixture: ComponentFixture<ValveSegmentAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValveSegmentAssignmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValveSegmentAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
