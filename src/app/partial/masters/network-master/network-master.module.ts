import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NetworkMasterRoutingModule } from './network-master-routing.module';
import { NetworkMasterComponent } from './network-master.component';


@NgModule({
  declarations: [
    NetworkMasterComponent
  ],
  imports: [
    CommonModule,
    NetworkMasterRoutingModule
  ]
})
export class NetworkMasterModule { }
