import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentMasterComponent } from './segment-master.component';

describe('SegmentMasterComponent', () => {
  let component: SegmentMasterComponent;
  let fixture: ComponentFixture<SegmentMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SegmentMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SegmentMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
