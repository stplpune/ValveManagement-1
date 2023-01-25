import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ValveNameAssignmentRoutingModule } from './valve-name-assignment-routing.module';
import { ValveNameAssignmentComponent } from './valve-name-assignment.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    ValveNameAssignmentComponent
  ],
  imports: [
    CommonModule,
    ValveNameAssignmentRoutingModule,
    ReactiveFormsModule,
    NgxSelectModule,
    NgxPaginationModule,
  ]
})
export class ValveNameAssignmentModule { }
