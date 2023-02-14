import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ValveWaterSummeryRoutingModule } from './valve-water-summery-routing.module';
import { ValveWaterSummeryComponent } from './valve-water-summery.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';


@NgModule({
  declarations: [
    ValveWaterSummeryComponent
  ],
  imports: [
    CommonModule,
    ValveWaterSummeryRoutingModule,
    ReactiveFormsModule,
    NgxSelectModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
  ]
})
export class ValveWaterSummeryModule { }
