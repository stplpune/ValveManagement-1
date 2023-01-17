import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ValveConnectionRoutingModule } from './valve-connection-routing.module';
import { ValveConnectionComponent } from './valve-connection.component';
import { NgxSelectModule } from 'ngx-select-ex';

@NgModule({
  declarations: [
    ValveConnectionComponent
  ],
  imports: [
    CommonModule,
    ValveConnectionRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxSelectModule
  ]
})
export class ValveConnectionModule { }
