import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TankSegmentAssignmentComponent } from './tank-segment-assignment.component';

const routes: Routes = [{ path: '', component: TankSegmentAssignmentComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TankSegmentAssignmentRoutingModule { }
