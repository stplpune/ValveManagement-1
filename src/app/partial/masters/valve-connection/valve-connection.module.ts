import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ValveConnectionRoutingModule } from './valve-connection-routing.module';
import { ValveConnectionComponent } from './valve-connection.component';


@NgModule({
  declarations: [
    ValveConnectionComponent
  ],
  imports: [
    CommonModule,
    ValveConnectionRoutingModule
  ]
})
export class ValveConnectionModule { }
