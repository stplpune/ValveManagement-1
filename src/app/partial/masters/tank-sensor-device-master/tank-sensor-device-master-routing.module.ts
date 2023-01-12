import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TankSensorDeviceMasterComponent } from './tank-sensor-device-master.component';

const routes: Routes = [{ path: '', component: TankSensorDeviceMasterComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TankSensorDeviceMasterRoutingModule { }
