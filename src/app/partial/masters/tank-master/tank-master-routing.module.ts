import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TankMasterComponent } from './tank-master.component';

const routes: Routes = [{ path: '', component: TankMasterComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TankMasterRoutingModule { }
