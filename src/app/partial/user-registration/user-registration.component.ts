import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css'],
})
export class UserRegistrationComponent implements OnInit {
  //Intialize the Component Property
  userDetails: FormGroup | any;
  submitted = false;
  @ViewChild('addUserModel') addUserModel: any;
  pageNumber: number = 1;
  pageSize: number = 10;
  userListArray: {
    id: number;
    fullName: string;
    mobileNo: string;
    isUserBlock: number;
    address: number;
  }[] = [];
  deleteUserId: number = 0;

  constructor(
    private fb: FormBuilder,
    private localStorage: LocalstorageService,
    private spinner: NgxSpinnerService,
    public apiService: ApiService,
    private errorSerivce: ErrorsService,
    private toastrService: ToastrService,
    public commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.defaultForm();
    this.getUserRegistrationList();
  }

  //Intialize Form Fields
  defaultForm() {
    this.userDetails = this.fb.group({
      Id: [0],
      fullName: ['', [Validators.required]],
      mobileNo: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      address: [''],
    });
  }

  //Get Form Control Values
  get f() {
    return this.userDetails.controls;
  }

  //Clear All Data In the Form Fields
  clearForm() {
    this.submitted = false;
    this.defaultForm();
  }

  //Save User Registration Details
  onSubmit() {
    let formData = this.userDetails.value;
    this.submitted = true;
    if (this.userDetails.invalid) {
      return;
    } else {
      let obj = {
        id: formData.Id,
        fullName: formData.fullName,
        mobileNo: formData.mobileNo,
        address: formData.address,
        userTypeId: 2,
        createdBy: this.localStorage.userId(),
        modifiedBy: 0,
      };
      this.spinner.show();
      let urlType;
      formData.Id == 0 ? (urlType = 'POST') : (urlType = 'PUT');
      this.apiService.setHttp(
        urlType,
        'UserRegistration',
        false,
        JSON.stringify(obj),
        false,
        'valvemgt'
      );
      this.apiService.getHttp().subscribe(
        (res: any) => {
          if (res.statusCode == '201') {
            this.spinner.hide();
            this.toastrService.success(res.statusMessage);
            this.addUserModel.nativeElement.click();
          } else {
            this.toastrService.error(res.statusMessage);
            this.spinner.hide();
          }
        },
        (error: any) => {
          this.errorSerivce.handelError(error.status);
          this.spinner.hide();
        }
      );
    }
  }

  //Get User Registration Data
  getUserRegistrationList() {
    this.spinner.show();
    let obj = 'pageno=' + this.pageNumber + '&pagesize=' + this.pageSize;
    this.apiService.setHttp(
      'get',
      'UserRegistration?' + obj,
      false,
      false,
      false,
      'valvemgt'
    );
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.userListArray = res.responseData.responseData1;
          //console.log(this.userListArray);
        } else {
          this.spinner.hide();
          this.userListArray = [];
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toastrService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  //Delete User Details
  deleteConformation(userId: number) {
    this.deleteUserId = userId;
  }

  //Delete User Data Call API
  deleteUser() {
    let obj =
      'Id=' + this.deleteUserId + '&ModifiedBy=' + this.localStorage.userId();
    this.apiService.setHttp(
      'DELETE',
      'UserRegistration/DeleteUser?' + obj,
      false,
      false,
      false,
      'valvemgt'
    );
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.toastrService.success(res.statusMessage);
          this.getUserRegistrationList();
          this.clearForm();
        } else {
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toastrService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  //Update User Data
  updateUserData(userData: any) {
    this.userDetails.patchValue({
      Id: userData.id,
      fullName: userData.fullName,
      mobileNo: userData.mobileNo,
      address: userData.address,
    });
  }

  //Check User Is Block Or Not
  getBlockUser(status: number): boolean {
    return status == 1 ? true : false;
  }
}
