import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TankSegmentAssignmentRoutingModule } from './tank-segment-assignment-routing.module';
import { TankSegmentAssignmentComponent } from './tank-segment-assignment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    TankSegmentAssignmentComponent
  ],
  imports: [
    CommonModule,
    TankSegmentAssignmentRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSelectModule,
    NgxPaginationModule
  ]
})
export class TankSegmentAssignmentModule { }
