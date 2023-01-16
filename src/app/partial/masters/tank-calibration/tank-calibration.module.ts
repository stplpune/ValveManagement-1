import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TankCalibrationRoutingModule } from './tank-calibration-routing.module';
import { TankCalibrationComponent } from './tank-calibration.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';


@NgModule({
  declarations: [
    TankCalibrationComponent
  ],
  imports: [
    CommonModule,
    TankCalibrationRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxSelectModule
  ]
})
export class TankCalibrationModule { }
