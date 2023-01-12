import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { YojanaMasterRoutingModule } from './yojana-master-routing.module';
import { YojanaMasterComponent } from './yojana-master.component';


@NgModule({
  declarations: [
    YojanaMasterComponent
  ],
  imports: [
    CommonModule,
    YojanaMasterRoutingModule
  ]
})
export class YojanaMasterModule { }
