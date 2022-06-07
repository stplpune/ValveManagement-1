import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './partial/layout/footer/footer.component';
import { NavbarComponent } from './partial/layout/navbar/navbar.component';
import { SidebarComponent } from './partial/layout/sidebar/sidebar.component';
import { PartialLayoutComponent } from './partial/partial-layout.component';

@NgModule({
  declarations: [
    AppComponent,
    PartialLayoutComponent,
    SidebarComponent,
    NavbarComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
