import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { PartialLayoutRoutes } from './partial-layout.routing';


@NgModule({
  declarations: [
  ],

  imports: [
    CommonModule,
    RouterModule.forChild(PartialLayoutRoutes),

  ],

  providers: [DatePipe]
})

export class PartialLayoutModule { }
