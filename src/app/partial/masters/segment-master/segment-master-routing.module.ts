import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SegmentMasterComponent } from './segment-master.component';

const routes: Routes = [{ path: '', component: SegmentMasterComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SegmentMasterRoutingModule { }
