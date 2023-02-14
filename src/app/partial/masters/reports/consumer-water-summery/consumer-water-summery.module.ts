import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConsumerWaterSummeryRoutingModule } from './consumer-water-summery-routing.module';
import { ConsumerWaterSummeryComponent } from './consumer-water-summery.component';


@NgModule({
  declarations: [
    ConsumerWaterSummeryComponent
  ],
  imports: [
    CommonModule,
    ConsumerWaterSummeryRoutingModule
  ]
})
export class ConsumerWaterSummeryModule { }
