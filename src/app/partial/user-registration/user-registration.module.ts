import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UserRegistrationRoutingModule } from './user-registration-routing.module';
import { UserRegistrationComponent } from './user-registration.component';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    UserRegistrationComponent
  ],
  imports: [
    CommonModule,
    UserRegistrationRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class UserRegistrationModule { }
