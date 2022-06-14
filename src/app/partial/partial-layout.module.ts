import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { PartialLayoutComponent } from './partial-layout.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { PartialLayoutRoutingModule } from './partial-layout-routing.module';


@NgModule({
  declarations: [
    PartialLayoutComponent,
    SidebarComponent,
    NavbarComponent,
    FooterComponent,
  ],

  imports: [
    CommonModule,
    PartialLayoutRoutingModule
  ],
  providers: [DatePipe]
})

export class PartialLayoutModule { }
