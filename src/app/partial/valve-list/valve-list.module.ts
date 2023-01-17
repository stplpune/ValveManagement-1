import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValveListRoutingModule } from './valve-list-routing.module';
import { ValveListComponent } from './valve-list.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule} from '@agm/core';
import { FormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
@NgModule({
  declarations: [
    ValveListComponent
  ],
  imports: [
    CommonModule,
    ValveListRoutingModule,
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
export class ValveListModule { }
