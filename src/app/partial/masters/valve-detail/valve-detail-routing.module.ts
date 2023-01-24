import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValveDetailComponent } from './valve-detail.component';

const routes: Routes = [{ path: '', component: ValveDetailComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValveDetailRoutingModule { }
