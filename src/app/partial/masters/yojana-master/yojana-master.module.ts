import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { YojanaMasterRoutingModule } from './yojana-master-routing.module';
import { YojanaMasterComponent } from './yojana-master.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';

@NgModule({
  declarations: [
    YojanaMasterComponent
  ],
  imports: [
    CommonModule,
    YojanaMasterRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxSelectModule
  ]
})
export class YojanaMasterModule { }
