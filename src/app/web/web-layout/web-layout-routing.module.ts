import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NoAuthGuardService } from 'src/app/core/auth/no-auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('../../web/login/login.module').then(m => m.LoginModule) 
  , canActivate: [NoAuthGuardService]},
  { path: 'privacy-policy', loadChildren: () => import('../../web/privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyModule) },
  ];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebLayoutRoutingModule { }
