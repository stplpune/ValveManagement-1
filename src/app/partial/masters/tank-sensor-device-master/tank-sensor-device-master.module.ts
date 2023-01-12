import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TankSensorDeviceMasterRoutingModule } from './tank-sensor-device-master-routing.module';
import { TankSensorDeviceMasterComponent } from './tank-sensor-device-master.component';


@NgModule({
  declarations: [
    TankSensorDeviceMasterComponent
  ],
  imports: [
    CommonModule,
    TankSensorDeviceMasterRoutingModule
  ]
})
export class TankSensorDeviceMasterModule { }
