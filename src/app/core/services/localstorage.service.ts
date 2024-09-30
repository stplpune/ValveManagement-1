import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalstorageService {
  getlocalStorageData: any;

  constructor() { }

  checkUserIsLoggedIn() { // check user isLoggedIn or not  
    let sessionData:any =  sessionStorage.getItem('loggedIn');
    sessionData == null || sessionData == ''  ? localStorage.clear(): '';
    if (localStorage.getItem('user') && sessionData == 'true') return true;
    else return false;
  }

  getLoggedInLocalstorageData() {
    let data = JSON.parse(localStorage['user']);
    return data;
  }

  loggedInUserName() {
    let data = JSON.parse(localStorage['user']);
    return data['userName'];
  }

  userId() {
    let getObj = this.getLoggedInLocalstorageData();
    return getObj.userId;
  }

  profilePath() {
    let userId = this.getLoggedInLocalstorageData();
    let profilePath = userId.profilePath =="" || userId.profilePath == null || userId.profilePath == undefined  ? 'assets/images/user.png' : userId.profilePath;
    return profilePath;
  }

  userTypeId() {
    let userTypeId = this.getLoggedInLocalstorageData();
    return userTypeId.userTypeId;
  }

  subUserTypeId() {
    let userTypeId = this.getLoggedInLocalstorageData();
    return userTypeId.subUserTypeId;
  }

  getAllPageName() {
    let getAllPageName = this.getLoggedInLocalstorageData();
    return getAllPageName.pageList;
  }

  redirectToDashborad() {
    let logInUserType: any = this.getAllPageName();
    let redirectToDashboard = logInUserType[0].pageURL;
    return redirectToDashboard;
  }

  userMobileNo() {
    let mobileNumber = this.getLoggedInLocalstorageData();
    return mobileNumber.mobileNo;
  }

  getFullName_ProfilePhoto() {
    let localStorage = this.getLoggedInLocalstorageData();
    let obj = { 'fullName': localStorage.fullName, 'profilePath': localStorage.profilePath }
    return obj;
}

 // set full name in edit profile page 
 private setName = new BehaviorSubject('');
 getNameOnChange = this.setName.asObservable();

 sendFullName(fullName: string) {
     this.setName.next(fullName);
 }

 //img url path
 private imgUrlPath = new BehaviorSubject('');
 imageChange = this.imgUrlPath.asObservable();

 //change url header
 pathchange(imagePath: string) {
     this.imgUrlPath.next(imagePath)
 }

}
