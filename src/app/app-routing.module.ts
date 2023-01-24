import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';
import { AuthorizationGuard } from './core/auth/authorization.guard';
import { PageNotFoundComponent } from './errors/page-not-found/page-not-found.component';
import { PartialLayoutComponent } from './partial/partial-layout.component';
import { WebLayoutComponent } from './web/web-layout/web-layout.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // { path: 'login', loadChildren: () => import('./web/login/login-routing.module').then(m => m.LoginRoutingModule) ,data: { title: 'Login' } },
  { path: '', component: WebLayoutComponent,  loadChildren: () => import('./web/web-layout/web-layout.module').then(m => m.WebLayoutModule) },
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthorizationGuard],
    component: PartialLayoutComponent,
    loadChildren: () => import('./partial/partial-layout.module').then(m => m.PartialLayoutModule)
  },
  { path: 'valve-connection', loadChildren: () => import('./partial/masters/valve-connection/valve-connection.module').then(m => m.ValveConnectionModule) },
 
  { path: '**', component: PageNotFoundComponent},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
