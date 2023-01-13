import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TankSegmentAssignmentComponent } from './tank-segment-assignment.component';

describe('TankSegmentAssignmentComponent', () => {
  let component: TankSegmentAssignmentComponent;
  let fixture: ComponentFixture<TankSegmentAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TankSegmentAssignmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TankSegmentAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
