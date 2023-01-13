import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NetworkMasterRoutingModule } from './network-master-routing.module';
import { NetworkMasterComponent } from './network-master.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxSelectModule } from 'ngx-select-ex';


@NgModule({
  declarations: [
    NetworkMasterComponent
  ],
  imports: [
    CommonModule,
    NetworkMasterRoutingModule,
    FormsModule,
    NgxPaginationModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    NgxSelectModule
  ]
})
export class NetworkMasterModule { }
