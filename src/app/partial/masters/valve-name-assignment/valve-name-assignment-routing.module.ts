import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValveNameAssignmentComponent } from './valve-name-assignment.component';

const routes: Routes = [{ path: '', component: ValveNameAssignmentComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValveNameAssignmentRoutingModule { }
