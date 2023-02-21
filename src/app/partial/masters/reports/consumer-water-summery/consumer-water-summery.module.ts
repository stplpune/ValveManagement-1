import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConsumerWaterSummeryRoutingModule } from './consumer-water-summery-routing.module';
import { ConsumerWaterSummeryComponent } from './consumer-water-summery.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    ConsumerWaterSummeryComponent
  ],
  imports: [
    CommonModule,
    ConsumerWaterSummeryRoutingModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    NgxSelectModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
  ]
})
export class ConsumerWaterSummeryModule { }
