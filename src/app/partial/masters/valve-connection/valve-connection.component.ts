import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { ValidationService } from 'src/app/core/services/validation.service';

@Component({
  selector: 'app-valve-connection',
  templateUrl: './valve-connection.component.html',
  styleUrls: ['./valve-connection.component.css']
})
export class ValveConnectionComponent implements OnInit {
  valveConnectionForm!: FormGroup | any;
  searchForm!: FormGroup;
  dataSource: any;
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows!: number;
  highlitedRow: any;
  valveConnectionArray:any;
  valveConnectionArrayFilter:any;
  editFlag: boolean = false;
  getLoginData: any;
  yoganaArray:any;
  networkArray:any;
  yoganaArrayFilter: any;
  networkArrayFilter: any;
  editObj: any;
  filterFlag: any = 'filter';
  @ViewChild('closebutton') closebutton: any;
  data: any;
  submitted: boolean = false;
  editChangeFlag:any;  // note 1 is Edit & 0 is any
  isHaveTapArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
  isHaveMotarArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];

  constructor(private fb: FormBuilder,
    private localStorage: LocalstorageService,
    private toasterService: ToastrService,
    private apiService: ApiService,
    private errorSerivce: ErrorsService,
    public commonService: CommonService,
    private spinner: NgxSpinnerService,
    public validation: ValidationService,) { }

  ngOnInit(): void {
    this.getLoginData = this.localStorage.getLoggedInLocalstorageData();
    console.log(this.getLoginData.yojanaId);
    this.defaultValveConnectionForm();
    this.filterFormControl();
    this.getYoganaDropdown();
    this.localStorage.userId() == 1 ? this.bindValveConnectionsTable() : '';
  }
  // alt(){
  //   alert()
  // }
  defaultValveConnectionForm() {
    this.valveConnectionForm = this.fb.group({
      "id": [0],
      "valveDetailsId": ['', [Validators.required]],
      "personName": ['', [Validators.required]],
      "personName_En": ['', [Validators.required]],
      "valveName": [''],
      "valveName_En": [''],
      "mobileNo": ['', [Validators.required, Validators.pattern('[6-9]\\d{9}')]],
      "remark": [''],
      "createdBy": this.localStorage.userId(),   
      "yojanaId": [this.yoganaArray?.length == 1 ? this.yoganaArray[0].yojanaId : '', [Validators.required]],
      "networkId": [this.networkArray?.length == 1 ? this.networkArray[0].networkId : '', [Validators.required]],
      "consumerUserId": [0],
      "totalConnection": [0, [Validators.required]],
      "connectiondetails": this.fb.array([
        this.fb.group({
          "pipeDiameter": ['', [Validators.required]],
          "connectionNo": ['', ]
        })
      ]),
      "isHaveTap": [1],
      "isHaveMotar": [0],
      // , [Validators.required]
    })
  }

  filterFormControl() {
    this.searchForm = this.fb.group({
      yojana: [0],
      network: [0],
      valveMaster: [0]
    })
  }

  filterData() {
    this.pageNumber = 1;
    this.bindValveConnectionsTable();
  }

  get f() {
    return this.valveConnectionForm.controls;
  }

  get connectionForm(): FormArray {
    return this.valveConnectionForm.get('connectiondetails') as FormArray;
  }

  get connectionFormVal(): any {//used for validation
    return this.valveConnectionForm.controls['connectiondetails'] as FormArray
  }

  addConnection() {
    let arrayData = this.fb.group({
      pipeDiameter: ['', Validators.required],
      connectionNo: ['']
    });
    if (this.valveConnectionForm.value.connectiondetails?.length > 0) {
      if (this.valveConnectionForm.value.connectiondetails[this.valveConnectionForm.value.connectiondetails?.length - 1].pipeDiameter) {
        this.connectionForm.push(arrayData);
      } else {
        this.toasterService.error('Please, Enter Pipe Diameter and Connection No. !');
      }

    }
    else {
      this.connectionForm.push(arrayData);
    }
    this.valveConnectionForm.controls['totalConnection'].setValue(this.connectionForm?.length);
    //set formArray length
  }

  removeItem(i: number) {
    this.connectionForm.removeAt(i)
    this.valveConnectionForm.controls['totalConnection'].setValue(this.connectionForm?.length);//set formArray length
  }

  bindValveConnectionsTable() {
    this.spinner.show();
    let obj = 'YojanaId=' + (this.searchForm.value.yojana ? this.searchForm.value.yojana : this.getLoginData.yojanaId)
      + '&NetworkId=' + (this.searchForm.value.network || 0)
      + '&UserId=' + this.localStorage.userId() + '&pageno=' + this.pageNumber + '&pagesize=' + this.pagesize
      + '&valveDetailsId=' + (this.searchForm.value.valveMaster ? this.searchForm.value.valveMaster : 0);

    this.apiService.setHttp('get', 'ValveConnection/GetAllRemark?' + obj, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.spinner.hide();
          this.dataSource = res.responseData.responseData1;
          this.totalRows = res.responseData.responseData2.totalCount;
          this.highlitedRow = 0;
        } else {
          this.spinner.hide();
          this.dataSource = [];
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : this.toasterService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.spinner.hide();
        this.errorSerivce.handelError(error.status);
      },
    });
  }
  //#region -------------------Start Dropdown Here----------------------------------------- 
  getYoganaDropdown() {
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getLoginData.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.filterFlag == 'filter' ? this.yoganaArrayFilter = res.responseData : this.yoganaArray = res.responseData;
        (this.filterFlag == 'filter' && this.yoganaArrayFilter?.length == 1 && !this.editFlag) ? (this.searchForm.controls['yojana'].setValue(this.yoganaArrayFilter[0].yojanaId), this.getNetworkDropdown()) : '';
        (this.yoganaArray?.length == 1 && !this.editFlag) ? (this.valveConnectionForm.controls['yojanaId'].setValue(this.yoganaArray[0].yojanaId), this.getNetworkDropdown()) : '';
        this.editFlag ? (this.valveConnectionForm.controls['yojanaId'].setValue(this.editObj.yojanaId), this.getNetworkDropdown()) : '';
      }
      else {
        this.filterFlag == 'filter' ? this.yoganaArrayFilter = [] : this.yoganaArray = [];
        this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : this.toasterService.error(res.statusMessage);
      }
    },
      (error: any) => {
        this.errorSerivce.handelError(error.status);
      })
  }

  getNetworkDropdown() {
    let id = this.filterFlag == 'filter' ? this.searchForm.value.yojana : this.valveConnectionForm.value.yojanaId;
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllNetworkbyUserId?UserId=' + this.localStorage.userId() + '&YojanaId=' + (id || this.getLoginData.yojanaId), false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.filterFlag == 'filter' ? this.networkArrayFilter = res.responseData : this.networkArray = res.responseData;
          (this.filterFlag == 'filter' && this.networkArrayFilter?.length == 1 && !this.editFlag) ? (this.searchForm.controls['network'].setValue(this.networkArrayFilter[0].networkId),this.bindValveConnectionsTable(), this.getValveConnectionDropdown()) : '';
          this.networkArray?.length == 1 ? (this.valveConnectionForm.controls['networkId'].setValue(this.networkArray[0].networkId), this.getValveConnectionDropdown()) : '';
          (this.editFlag && this.editChangeFlag) ? (this.valveConnectionForm.controls['networkId'].setValue(this.editObj.networkId), this.getValveConnectionDropdown()) : '';
        }
        else {
          this.filterFlag == 'filter' ? this.networkArrayFilter = [] : this.networkArray = [];
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : this.toasterService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }


  getValveConnectionDropdown() {
    let id = this.filterFlag == 'filter' ? ('&YojanaId=' + this.searchForm.value.yojana + '&NetworkId=' + this.searchForm.value.network) : ('&YojanaId=' + this.valveConnectionForm.value.yojanaId + '&NetworkId=' + this.valveConnectionForm.value.networkId);
    this.apiService.setHttp('get', 'ValveMaster/GetValveNameList?userId=' + this.localStorage.userId() + id, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.filterFlag == 'filter' ? this.valveConnectionArrayFilter = res.responseData : this.valveConnectionArray = res.responseData;

          this.valveConnectionArrayFilter?.length == 1 ? this.searchForm.controls['valveMaster'].setValue(this.valveConnectionArrayFilter[0].valveDetailsId) : '';
          this.valveConnectionArray?.length == 1 ? this.valveConnectionForm.controls['valveDetailsId'].setValue(this.valveConnectionArray[0].valveDetailsId) : '';

          this.editFlag ? this.valveConnectionForm.controls['valveDetailsId'].setValue(this.editObj.valveDetailsId) : '';
        }
        else {
          this.filterFlag == 'filter' ? this.valveConnectionArrayFilter = [] : this.valveConnectionArray = [];
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : this.toasterService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  //#endregion ----------------------------------End Dropdown Logic Here ----------------------------------------
  deleteConformation(ele: number) {
    this.data = ele;
    this.highlitedRow = this.data.id;
  }

  deleteConnection() {
    let obj = {
      "id": this.data.id,
      "deletedBy": 0
    }

    this.apiService.setHttp('DELETE', 'ValveConnection', false, obj, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.toasterService.success(res.statusMessage);
          this.bindValveConnectionsTable();
        } else {
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : this.toasterService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  onClickEdit(Obj: any) {
    // console.log("editObj",Obj);
    this.editObj = Obj;
    this.connectionForm.clear()
    this.highlitedRow = this.editObj.id;
    this.editFlag = true;
    this.valveConnectionForm.patchValue({
      "id": this.editObj.id,
      "valveDetailsId": this.editObj.valveDetailsId,
      "personName": this.editObj.personName,
      "personName_En": this.editObj.personName_En,
      "mobileNo": this.editObj.mobileNo,
      "remark": this.editObj.remark,
      "createdBy": this.localStorage.userId(),
      "yojanaId": this.editObj.yojanaId,
      "networkId": this.editObj.networkId,
      "consumerUserId": this.editObj.consumerUserId,
      "valveName": this.editObj.valveName,
      "isHaveTap": this.editObj.isHaveTap,
      "isHaveMotar": this.editObj.isHaveMotar,
    });
    this.editObj.connectiondetails?.map((element: any) => {
      let arrayData = this.fb.group({
        pipeDiameter: [element.pipeDiameter],
        connectionNo: [element.connectionNo]
      });
      this.connectionForm.push(arrayData);

    })
    this.valveConnectionForm.controls['totalConnection'].setValue(this.connectionForm?.length);//set formArray length
    this.getYoganaDropdown();
  }

  onClickSubmit() {
    this.submitted = true;
    if (!this.valveConnectionForm.valid) {
      if (this.connectionForm.controls[this.connectionForm?.length - 1].status == 'INVALID') {
        return;
      }
      return;
    }
    else {

    this.spinner.show();
  
      let formData = this.valveConnectionForm.value;
      formData.connectiondetails.map((ele:any,index:number)=>  ele.connectionNo= index+1);//code for connection no ++
      // console.log(formData);
      
      formData.totalConnection = parseInt(formData.totalConnection);
      // formData.connectionNo = parseInt(formData.connectionNo);
      this.apiService.setHttp(this.editFlag ? 'put' : 'post', 'ValveConnection', false, formData, false, 'valvemgt');
      this.apiService.getHttp().subscribe({
        next: ((res: any) => {
          if (res.statusCode == "200") {
            this.spinner.hide();
            this.highlitedRow = 0;
            this.toasterService.success(res.statusMessage);
            this.filterFlag = 'filter';
            this.closebutton.nativeElement.click();
            this.bindValveConnectionsTable();
            this.clearForm();
          }
          else {
            this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : this.toasterService.error(res.statusMessage);
          }
        }),
        error: (error: any) => {
          this.errorSerivce.handelError(error.status);
        }
      })
    }
  }

  onClickPagintion(pagNo: number) {
    this.pageNumber = pagNo;
    this.bindValveConnectionsTable();
  }

  //Clear All Data In the Form Fields
  clearForm(formDirective?: any) {
    this.submitted = false;
    formDirective?.resetForm();
    this.defaultValveConnectionForm();
    this.editFlag = false;
  }

  clearDropdown(flag: any) {
    if (flag == 'yojanaId') {
      this.valveConnectionForm.controls['networkId'].setValue('');
      this.valveConnectionForm.controls['valveDetailsId'].setValue('')
    }
    else if (flag == 'networkId') {
      this.valveConnectionForm.controls['valveDetailsId'].setValue('')
    }
    else if (flag == 'valveDetailsId') {
      this.valveConnectionForm.controls['valveDetailsId'].setValue('');
    }
    // this.bindValveConnectionsTable();
  }

  clearSearch(flag: any) {
    if (flag == 'yojana') {
      this.searchForm.controls['network'].setValue(0);
      this.searchForm.controls['valveMaster'].setValue(0)
    }
    else if (flag == 'network') {
      this.searchForm.controls['valveMaster'].setValue(0)
    }
    else if (flag == 'valveMaster') {
      this.searchForm.controls['valveMaster'].setValue(0);
    }
    this.pageNumber = 1;
    // this.bindValveConnectionsTable();
    this.clearForm();
  }

}
