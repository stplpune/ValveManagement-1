import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { YojanaMasterComponent } from './yojana-master.component';

const routes: Routes = [{ path: '', component: YojanaMasterComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class YojanaMasterRoutingModule { }
