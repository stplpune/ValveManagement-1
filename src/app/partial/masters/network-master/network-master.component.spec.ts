import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkMasterComponent } from './network-master.component';

describe('NetworkMasterComponent', () => {
  let component: NetworkMasterComponent;
  let fixture: ComponentFixture<NetworkMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NetworkMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
