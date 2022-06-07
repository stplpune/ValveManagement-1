import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValveListComponent } from './valve-list.component';

const routes: Routes = [{ path: '', component: ValveListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValveListRoutingModule { }
