import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalstorageService } from '../services/localstorage.service';



@Injectable({
  providedIn: 'root'
})
export class NoAuthGuardService {
  constructor(private localstorageService: LocalstorageService,
    private router: Router) {
  }
  logInUserType: any = localStorage.getItem('user');

  canActivate(): any {
    if (this.localstorageService.checkUserIsLoggedIn()) {
      this.router.navigate(['../dashboard']);
      // let getUrlPath = this.localstorageService.checkUserIsLoggedIn();
      // this.router.navigate([getUrlPath])
    } else {
      return true;
    }
  }
}
