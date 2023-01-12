import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SegmentMasterRoutingModule } from './segment-master-routing.module';
import { SegmentMasterComponent } from './segment-master.component';
import { AgmCoreModule } from '@agm/core';


@NgModule({
  declarations: [
    SegmentMasterComponent
  ],
  imports: [
    CommonModule,
    SegmentMasterRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAkNBALkBX7trFQFCrcHO2I85Re2MmzTo8',
      language: 'en',
      libraries: ['places', 'geometry'],
    }),
  ]
})
export class SegmentMasterModule { }
