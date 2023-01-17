import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSelectModule } from 'ngx-select-ex';
import { PageRightAccessRoutingModule } from './page-right-access-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    // PageRightAccessComponent
  ],
  imports: [
    CommonModule,
    PageRightAccessRoutingModule,
    NgxSelectModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class PageRightAccessModule { }
