import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValveListRoutingModule } from './valve-list-routing.module';
import { ValveListComponent } from './valve-list.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ValveListComponent
  ],
  imports: [
    CommonModule,
    ValveListRoutingModule,
    NgxPaginationModule,
    ReactiveFormsModule,
  ]
})
export class ValveListModule { }
