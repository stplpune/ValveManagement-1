import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TankSensorDeviceMasterRoutingModule } from './tank-sensor-device-master-routing.module';
import { TankSensorDeviceMasterComponent } from './tank-sensor-device-master.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    TankSensorDeviceMasterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TankSensorDeviceMasterRoutingModule,
    NgxSelectModule
  ]
})
export class TankSensorDeviceMasterModule { }
