import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SimListRoutingModule } from './sim-list-routing.module';
import { SimListComponent } from './sim-list.component';

import { NgxPaginationModule } from 'ngx-pagination';
@NgModule({
  declarations: [
    SimListComponent
  ],
  imports: [
    CommonModule,
    SimListRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class SimListModule { }
