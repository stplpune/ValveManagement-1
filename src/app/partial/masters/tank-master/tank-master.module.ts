import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TankMasterRoutingModule } from './tank-master-routing.module';
import { TankMasterComponent } from './tank-master.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
import { NgxPaginationModule } from 'ngx-pagination';
@NgModule({
  declarations: [
    TankMasterComponent
  ],
  imports: [
    CommonModule,
    TankMasterRoutingModule,
    ReactiveFormsModule,
    NgxSelectModule,
    NgxPaginationModule


  ]
})
export class TankMasterModule { }
