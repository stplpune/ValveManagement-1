import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TankCalibrationComponent } from './tank-calibration.component';

const routes: Routes = [{ path: '', component: TankCalibrationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TankCalibrationRoutingModule { }
