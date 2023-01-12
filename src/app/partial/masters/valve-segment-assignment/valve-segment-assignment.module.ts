import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ValveSegmentAssignmentRoutingModule } from './valve-segment-assignment-routing.module';
import { ValveSegmentAssignmentComponent } from './valve-segment-assignment.component';


@NgModule({
  declarations: [
    ValveSegmentAssignmentComponent
  ],
  imports: [
    CommonModule,
    ValveSegmentAssignmentRoutingModule
  ]
})
export class ValveSegmentAssignmentModule { }
