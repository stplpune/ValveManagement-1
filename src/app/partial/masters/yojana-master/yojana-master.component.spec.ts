import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YojanaMasterComponent } from './yojana-master.component';

describe('YojanaMasterComponent', () => {
  let component: YojanaMasterComponent;
  let fixture: ComponentFixture<YojanaMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YojanaMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YojanaMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
