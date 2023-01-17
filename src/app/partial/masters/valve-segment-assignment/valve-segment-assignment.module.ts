import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';

import { ValveSegmentAssignmentRoutingModule } from './valve-segment-assignment-routing.module';
import { ValveSegmentAssignmentComponent } from './valve-segment-assignment.component';


@NgModule({
  declarations: [
    ValveSegmentAssignmentComponent
  ],
  imports: [
    CommonModule,
    ValveSegmentAssignmentRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSelectModule
  ]
})
export class ValveSegmentAssignmentModule { }
