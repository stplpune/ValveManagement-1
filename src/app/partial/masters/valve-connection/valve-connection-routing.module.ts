import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValveConnectionComponent } from './valve-connection.component';

const routes: Routes = [{ path: '', component: ValveConnectionComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValveConnectionRoutingModule { }
