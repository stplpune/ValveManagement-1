import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SegmentMasterRoutingModule } from './segment-master-routing.module';
import { SegmentMasterComponent } from './segment-master.component';


@NgModule({
  declarations: [
    SegmentMasterComponent
  ],
  imports: [
    CommonModule,
    SegmentMasterRoutingModule
  ]
})
export class SegmentMasterModule { }
