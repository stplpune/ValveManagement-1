import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NetworkMasterRoutingModule } from './network-master-routing.module';
import { NetworkMasterComponent } from './network-master.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    NetworkMasterComponent
  ],
  imports: [
    CommonModule,
    NetworkMasterRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class NetworkMasterModule { }
