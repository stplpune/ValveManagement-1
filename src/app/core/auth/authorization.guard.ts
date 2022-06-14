import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
  CanActivateChild
} from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';

// import { Observable } from 'rxjs';
import { AuthorizationService } from './authorization.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationGuard implements CanActivate, CanActivateChild {
  constructor(
    private authorizationService: AuthorizationService,
    private router: Router,
    private spinner: NgxSpinnerService,
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    //state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const allowedRoles = next.data['allowedRoles'];
    const isAuthorized = this.authorizationService.isAuthorized(allowedRoles);

    if (!isAuthorized) {
      this.router.navigate(['access-denied']);
    }

    return isAuthorized;
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    //state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const allowedRoles = next.data['allowedRoles'];
    const isAuthorized = this.authorizationService.isAuthorized(allowedRoles);
    if (!isAuthorized) {
      // if not authorized, show access denied message
      this.router.navigate(['access-denied']);
      this.spinner.hide();
    }

    return isAuthorized;
  }
}
