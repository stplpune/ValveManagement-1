import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsumerWaterSummeryComponent } from './consumer-water-summery.component';

const routes: Routes = [{ path: '', component: ConsumerWaterSummeryComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsumerWaterSummeryRoutingModule { }
