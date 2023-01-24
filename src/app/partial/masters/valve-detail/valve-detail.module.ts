import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValveDetailRoutingModule } from './valve-detail-routing.module';
import { ValveDetailComponent } from './valve-detail.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule} from '@agm/core';
import { FormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';


@NgModule({
  declarations: [
    ValveDetailComponent
  ],
  imports: [
    CommonModule,
    ValveDetailRoutingModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSelectModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAkNBALkBX7trFQFCrcHO2I85Re2MmzTo8',
      language: 'en',
      libraries: ['places', 'geometry'],
    }),
  ]
})
export class ValveDetailModule { }
