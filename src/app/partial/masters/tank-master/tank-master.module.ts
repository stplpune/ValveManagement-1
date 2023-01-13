import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TankMasterRoutingModule } from './tank-master-routing.module';
import { TankMasterComponent } from './tank-master.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    TankMasterComponent
  ],
  imports: [
    CommonModule,
    TankMasterRoutingModule,
    ReactiveFormsModule
  ]
})
export class TankMasterModule { }
