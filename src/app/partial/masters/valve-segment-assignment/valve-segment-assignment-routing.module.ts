import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValveSegmentAssignmentComponent } from './valve-segment-assignment.component';

const routes: Routes = [{ path: '', component: ValveSegmentAssignmentComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValveSegmentAssignmentRoutingModule { }
