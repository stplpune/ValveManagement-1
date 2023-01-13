import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TankSegmentAssignmentRoutingModule } from './tank-segment-assignment-routing.module';
import { TankSegmentAssignmentComponent } from './tank-segment-assignment.component';


@NgModule({
  declarations: [
    TankSegmentAssignmentComponent
  ],
  imports: [
    CommonModule,
    TankSegmentAssignmentRoutingModule
  ]
})
export class TankSegmentAssignmentModule { }
