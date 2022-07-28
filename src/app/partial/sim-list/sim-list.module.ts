import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SimListRoutingModule } from './sim-list-routing.module';
import { SimListComponent } from './sim-list.component';


@NgModule({
  declarations: [
    SimListComponent
  ],
  imports: [
    CommonModule,
    SimListRoutingModule
  ]
})
export class SimListModule { }
