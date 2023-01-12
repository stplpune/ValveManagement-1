import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TankCalibrationRoutingModule } from './tank-calibration-routing.module';
import { TankCalibrationComponent } from './tank-calibration.component';


@NgModule({
  declarations: [
    TankCalibrationComponent
  ],
  imports: [
    CommonModule,
    TankCalibrationRoutingModule
  ]
})
export class TankCalibrationModule { }
