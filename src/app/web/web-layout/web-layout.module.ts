import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebLayoutRoutingModule } from './web-layout-routing.module';
import { WebLayoutComponent } from './web-layout.component';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../../web/layout/footer/footer.component';


@NgModule({
  declarations: [
    WebLayoutComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    WebLayoutRoutingModule,
  ]
})
export class WebLayoutModule { }
