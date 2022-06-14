import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalstorageService } from '../services/localstorage.service';


@Injectable({
  providedIn: 'root'
  
})
export class ExpenseGuard implements CanActivate {
  constructor(private router: Router, private localstorageService: LocalstorageService) { }
  canActivate(
    route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let urlSplit:any =  route.routeConfig?.path?.split('/');
    if (this.localstorageService?.getAllPageName().find((x: any) => x.pageURL.includes(urlSplit[0]))) {
      return true
    }
    else {
      this.router.navigate(['/access-denied']);
      return false
    }
  }
}
