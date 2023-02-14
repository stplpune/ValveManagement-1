import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValveWaterSummeryComponent } from './valve-water-summery.component';

const routes: Routes = [{ path: '', component: ValveWaterSummeryComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValveWaterSummeryRoutingModule { }
