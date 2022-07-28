import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SimListComponent } from './sim-list.component';

const routes: Routes = [{ path: '', component: SimListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SimListRoutingModule { }
