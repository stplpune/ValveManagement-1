import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TankMasterRoutingModule } from './tank-master-routing.module';
import { TankMasterComponent } from './tank-master.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';

@NgModule({
  declarations: [
    TankMasterComponent
  ],
  imports: [
    CommonModule,
    TankMasterRoutingModule,
    ReactiveFormsModule,
    NgxSelectModule
  ]
})
export class TankMasterModule { }
