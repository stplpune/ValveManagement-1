import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartialLayoutComponent } from './partial/partial-layout.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./web/login/login-routing.module').then(m => m.LoginRoutingModule) ,data: { title: 'Login' } },
  {
    path: '',
    // canActivate: [AuthGuard], // for admin only
    // canActivateChild: [AuthorizationGuard],
    component: PartialLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./partial/partial-layout.module').then(m => m.PartialLayoutModule), data: { title: 'Login' } },
      // /partial/layouts/partial-layout/partial-layout.module
    ]
  },
  
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
