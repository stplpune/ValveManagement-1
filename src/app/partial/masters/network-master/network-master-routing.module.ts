import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NetworkMasterComponent } from './network-master.component';

const routes: Routes = [{ path: '', component: NetworkMasterComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NetworkMasterRoutingModule { }
