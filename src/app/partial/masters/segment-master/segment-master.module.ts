import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SegmentMasterRoutingModule } from './segment-master-routing.module';
import { SegmentMasterComponent } from './segment-master.component';
import { AgmCoreModule } from '@agm/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    SegmentMasterComponent
  ],
  imports: [
    CommonModule,
    SegmentMasterRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAkNBALkBX7trFQFCrcHO2I85Re2MmzTo8',
      language: 'en',
      libraries: ['places', 'geometry'],
    }),
  ]
})
export class SegmentMasterModule { }
