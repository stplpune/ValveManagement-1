import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TankMasterRoutingModule } from './tank-master-routing.module';
import { TankMasterComponent } from './tank-master.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
import { NgxPaginationModule } from 'ngx-pagination';
import { AgmCoreModule } from '@agm/core';
@NgModule({
  declarations: [
    TankMasterComponent
  ],
  imports: [
    CommonModule,
    TankMasterRoutingModule,
    ReactiveFormsModule,
    NgxSelectModule,
    NgxPaginationModule,
     AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAkNBALkBX7trFQFCrcHO2I85Re2MmzTo8',
      language: 'en',
      libraries: ['places', 'geometry'],
    }),


  ]
})
export class TankMasterModule { }
