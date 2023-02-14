import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ValveWaterSummeryRoutingModule } from './valve-water-summery-routing.module';
import { ValveWaterSummeryComponent } from './valve-water-summery.component';


@NgModule({
  declarations: [
    ValveWaterSummeryComponent
  ],
  imports: [
    CommonModule,
    ValveWaterSummeryRoutingModule
  ]
})
export class ValveWaterSummeryModule { }
