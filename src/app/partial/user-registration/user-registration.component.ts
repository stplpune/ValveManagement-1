import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/core/services/common.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css'],
})
export class UserRegistrationComponent implements OnInit {
  //Intialize the Component Property
  userDetails: FormGroup | any;
  searchForm: FormGroup | any;
  submitted = false;
  @ViewChild('addUserModel') addUserModel: any;
  @ViewChild('openBlockUserPopup') blockUserModel: any;
  buttontextFlag:String='Submit';
  pageNumber: number = 1;
  pageSize: number = 10;
  userListArray=new Array();
  deleteUserId: number = 0;
  blockUserId: number = 0;
  listCount!: number;
  blockUserText: string = 'Block';
  preventEvent!: any;
  isBlockStatus: number = 0;
  userTypeArray=new Array();
  yoganaIdArray=new Array();
  networkIdArray=new Array();
  networkFilterArray=new Array();
  getLoginData:any;
  subject: Subject<any> = new Subject();

  constructor(
    private fb: FormBuilder,
    private localStorage: LocalstorageService,
    private spinner: NgxSpinnerService,
    public apiService: ApiService,
    private errorSerivce: ErrorsService,
    private toastrService: ToastrService,
    public commonService: CommonService,
    public validation: ValidationService
  ) {}

  ngOnInit(): void {
    this.getLoginData=this.localStorage.getLoggedInLocalstorageData();
    this.defaultForm();
    this.searchFormControl();
    this.getUserRegistrationList();
    this.getUserType();
    this.getYoganaId();
    this.searchFilters('false');
  }

  //Intialize Form Fields
  defaultForm() {
    this.userDetails = this.fb.group({
      Id: [0],
      fullName: ['', [Validators.required]],
      mobileNo: ['', [Validators.required, Validators.pattern('^[6-9][0-9]*$')]],
      userTypeId: ['',[Validators.required]],
      yojanaId: ['',[Validators.required]],
      networkId: ['',[Validators.required]],
      address: ['',[Validators.required]],
    });
  }
  searchFormControl(){
    this.searchForm=this.fb.group({
      yojana:[''],
      network:[''],
      searchField:['']
    })
  }

  //Get Form Control Values
  get f() {
    return this.userDetails.controls;
  }

  getUserType(){
    this.apiService.setHttp('GET', 'UserRegistration/GetUserTypeList?UserId='+this.getLoginData.userId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res:any)=>{
      if(res.statusCode=="200"){
        this.userTypeArray=res.responseData;
      }
      else{
        this.toastrService.error(res.statusMessage);
      }
    },
    (error: any) => {
      this.errorSerivce.handelError(error.status);
    })
  }

  getYoganaId(){
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllYojana?YojanaId=' +this.getLoginData.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res:any)=>{
      if(res.statusCode=="200"){
        this.yoganaIdArray=res.responseData;
        // this.getNetworkID();
      }
      else{
        this.toastrService.error(res.statusMessage);
      }
    },
    (error: any) => {
      this.errorSerivce.handelError(error.status);
    })
  }

  getNetworkID(yojanaId?:number){
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllNetworkbyUserId?UserId='+this.getLoginData.userId+'&YojanaId='+yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res:any)=>{
      if(res.statusCode=="200"){
        this.networkIdArray=res.responseData;
        this.networkFilterArray=res.responseData
      }
      else{
        this.toastrService.error(res.statusMessage);
      }
    },
    (error: any) => {
      this.errorSerivce.handelError(error.status);
    })
  }

  //Clear All Data In the Form Fields
  clearForm(formDirective?:any) {
    this.submitted = false;
    formDirective.resetForm();
    this.defaultForm();
  }

  //Save User Registration Details
  onSubmit(formDirective:any) {
    this.submitted = true;
    if (this.userDetails.invalid) {
      return;
    } else {
    let ids:any=[];
      let networdIds=this.userDetails.value.networkId;
        networdIds.forEach((ele:any) => {
          ids.push({
            "networkId" : ele,
            "networkName": ""
        })
      });

      let obj=this.userDetails.value;
      obj.userTypeId=parseInt(obj.userTypeId);
      obj.yojanaId=parseInt(obj.yojanaId);
      obj.networkId=parseInt(obj.networkId);
      obj.modifiedBy=this.getLoginData.userId;
      obj.createdBy=this.getLoginData.userId;
      obj.userNetworkListModels=ids;
      this.spinner.show();
      let urlType:any;
      obj.Id == 0 ? (urlType = 'POST') : (urlType = 'PUT');
      this.apiService.setHttp(urlType,'UserRegistration',false,obj,false,'valvemgt');
      this.apiService.getHttp().subscribe(
        (res: any) => {
          if (urlType == 'POST'? res.statusCode == '201': res.statusCode == '200') {
            this.spinner.hide();
            this.buttontextFlag='Submit';
            this.toastrService.success(res.statusMessage);
            this.addUserModel.nativeElement.click();
            this.clearForm();
            this.getUserRegistrationList();
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
    let obj = 'pageno=' + this.pageNumber + '&pagesize=' + this.pageSize+ '&search='+(this.searchForm.value.searchField?this.searchForm.value.searchField:'')
    +'&yojanaId='+(this.searchForm.value.yojana?this.searchForm.value.yojana:0)+'&networkId='+(this.searchForm.value.network?this.searchForm.value.network:0);
    this.apiService.setHttp('get','UserRegistration?' + obj,false,false,false,'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.userListArray = res.responseData.responseData1;
          this.listCount = res.responseData.responseData2?.totalCount;
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
    this.apiService.setHttp('DELETE','UserRegistration/DeleteUser?' + obj,false,false,false,'valvemgt');
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
    console.log(userData);
    let ids:any=[];
    userData.userNetworkListModels.forEach((ele:any)=>{
      ids.push(ele.networkId)
    })
    this.getNetworkID(userData.yojanaId)
    this.buttontextFlag='Update';
    this.userDetails.patchValue({
      Id: userData.id,
      fullName: userData.fullName,
      mobileNo: userData.mobileNo,
      userTypeId: userData.userTypeId,
      yojanaId: userData.yojanaId,
      networkId:ids,
      address: userData.address,
    });
  }

  //Check User Is Block Or Not
  getBlockUser(status: number): boolean {
    return status == 1 ? true : false;
  }

  //Applying Pagination
  selPagination(pagNo: number) {
    this.pageNumber = pagNo;
    this.getUserRegistrationList();
  }

  //Refresh the Value
  refreshData() {
    this.getUserRegistrationList();
  }

  //Set User Block
  blockUserDetails(blockUserId: number, blockStaus: number, event: any) {
    this.blockUserText = blockStaus == 1 ? 'UnBlock' : 'Block';
    this.blockUserId = blockUserId;
    this.preventEvent = event;
    this.isBlockStatus = this.preventEvent.target.checked ? 1 : 0;
    this.blockUserModel.nativeElement.click();
  }

  //Prevent Check
  preventCheck() {
    this.preventEvent.target.checked = (<HTMLInputElement>(
      this.preventEvent.target
    )).checked
      ? false
      : true;
  }

  //Block User Call API
  blockUser() {
    let obj =
      'Id=' +
      this.blockUserId +
      '&ModifiedBy=' +
      this.localStorage.userId() +
      '&isBlock=' +
      this.isBlockStatus;
    this.apiService.setHttp(
      'DELETE',
      'UserRegistration/BlockUser?' + obj,
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
          // this.clearForm();
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

 

  onKeyUpFilter() {
    this.subject.next(true);
  }

  searchFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchForm.value.searchField == "" || this.searchForm.value.searchField == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchForm.value.searchField;
        this.pageNumber = 1;
        this.getUserRegistrationList();
      });
  }

  clearSerach(flag: any) {
    if (flag == 'yojana') {
      this.searchForm.controls['network'].setValue('');
    } else if (flag == 'network') {
      // this.searchForm.controls['network'].setValue('');
    } else if (flag == 'search') {
      this.searchForm.controls['searchField'].setValue('');
    }
    this.pageNumber = 1;
    this.getUserRegistrationList();
    this.clearForm();
  }

}


