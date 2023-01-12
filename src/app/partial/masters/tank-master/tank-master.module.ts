import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TankMasterRoutingModule } from './tank-master-routing.module';
import { TankMasterComponent } from './tank-master.component';


@NgModule({
  declarations: [
    TankMasterComponent
  ],
  imports: [
    CommonModule,
    TankMasterRoutingModule
  ]
})
export class TankMasterModule { }
