import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ValveListRoutingModule } from './valve-list-routing.module';
import { ValveListComponent } from './valve-list.component';


@NgModule({
  declarations: [
    ValveListComponent
  ],
  imports: [
    CommonModule,
    ValveListRoutingModule
  ]
})
export class ValveListModule { }
