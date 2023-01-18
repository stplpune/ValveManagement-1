import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';

@Component({
  selector: 'app-valve-connection',
  templateUrl: './valve-connection.component.html',
  styleUrls: ['./valve-connection.component.css']
})
export class ValveConnectionComponent implements OnInit {
  valveConnectionForm!: FormGroup | any;
  searchForm!:FormGroup;
   dataSource: any;
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows!: number;
  highlitedRow: any;
  valveConnectionArray = new Array();
  editFlag: boolean = false;
  getLoginData: any;
  yoganaArray = new Array();
  networkArray = new Array();
  // @ViewChild('formDirective')
  // private formDirective!: NgForm;
  @ViewChild('closebutton') closebutton: any;
  data: any;
  submitted:boolean = false;

  constructor(private fb: FormBuilder,
    private localStorage: LocalstorageService,
    private toasterService: ToastrService,
    private apiService: ApiService,
    private errorSerivce: ErrorsService,
    public commonService: CommonService,
    private spinner: NgxSpinnerService,) { }

  ngOnInit(): void {
    this.getLoginData = this.localStorage.getLoggedInLocalstorageData();
    this.defaultValveConnectionForm();
    this.filterFormControl();
    this.getYoganaDropdown();
    this.bindValveConnectionsTable();
  }

  defaultValveConnectionForm() {
    this.valveConnectionForm = this.fb.group({
      "id": [0],
      "valveMasterId": ['',[Validators.required]],
      "personName": ['',[Validators.required]],
      "mobileNo": ['',[Validators.required,Validators.pattern('[6-9]\\d{9}')]],
      "remark": [''],
      "createdBy": this.localStorage.userId(),
      "yojanaId":['',[Validators.required]],
      "networkId":['',[Validators.required]],
      "consumerUserId": [0],
      "totalConnection": ['',[Validators.required]],
      "connectiondetails": this.fb.array([
        this.fb.group({
          "pipeDiameter": ['',[Validators.required]],
          "connectionNo": ['',[Validators.required]]
        })
      ])
    })
  }

  filterFormControl(){
    this.searchForm=this.fb.group({
      yojana:[''],
      network:[''],
      valveMaster:['']
    })
  }

  get f() {
    return this.valveConnectionForm.controls;
  }

  get connectionForm(): FormArray {
    return this.valveConnectionForm.get('connectiondetails') as FormArray;
  }

  addConnection() {
    let arrayData = this.fb.group({
      pipeDiameter: [''],
      connectionNo: []
    });
    if (this.valveConnectionForm.value.connectiondetails.length > 0) {
      if (this.valveConnectionForm.value.connectiondetails[this.valveConnectionForm.value.connectiondetails.length - 1].pipeDiameter && this.valveConnectionForm.value.connectiondetails[this.valveConnectionForm.value.connectiondetails.length - 1].connectionNo) {
        this.connectionForm.push(arrayData);
      } else {
        this.toasterService.error('Please, Enter Pipe Diameter and Connection No. !');
      }
    }
    else {
      this.connectionForm.push(arrayData);
    }
  }

  removeItem(i: number) {
    this.connectionForm.removeAt(i)
  }
 // ValveConnection/GetAllRemark?YojanaId=1&NetworkId=1&UserId=1&pageno=1&pagesize=1&ValveMasterId=1

  bindValveConnectionsTable() {
    this.spinner.show();
    // (this.searchForm.value.yojana?this.searchForm.value.yojana:0)
    let obj = 'YojanaId='+(this.searchForm.value.yojana?this.searchForm.value.yojana:0)
    +'&NetworkId='+(this.searchForm.value.network?this.searchForm.value.network:0)
    +'&UserId='+this.localStorage.userId()+'&pageno='+ this.pageNumber + '&pagesize='+this.pagesize
    +'&ValveMasterId='+(this.searchForm.value.valveMaster?this.searchForm.value.valveMaster:0);

    // let obj1 = 'UserId=' + this.localStorage.userId() + '&pageno=' + this.pageNumber + '&pagesize=' + this.pagesize;
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
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toasterService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.spinner.hide();
        this.errorSerivce.handelError(error.status);
      },
    });
  }
//#region -------------------Start Dropdown Here-----------------------------------------
  getYoganaDropdown(){
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllYojana?YojanaId=' +this.getLoginData.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res:any)=>{
      if(res.statusCode=="200"){
        this.yoganaArray=res.responseData;
       
      }
      else{
        this.yoganaArray = [];
        this.commonService.checkDataType(res.statusMessage) == false
        ? this.errorSerivce.handelError(res.statusCode)
        : this.toasterService.error(res.statusMessage);
      }
    },
    (error: any) => {
      this.errorSerivce.handelError(error.status);
    })
  }

  getNetworkDropdown(){
    
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllNetwork?YojanaId='+this.valveConnectionForm.value.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res:any)=>{
      if(res.statusCode=="200"){
        this.networkArray=res.responseData;
      }
      else{
        this.networkArray = [];
        this.commonService.checkDataType(res.statusMessage) == false
        ? this.errorSerivce.handelError(res.statusCode)
        : this.toasterService.error(res.statusMessage);
      }
    },
    (error: any) => {
      this.errorSerivce.handelError(error.status);
    })
  }
   getValveConnectionDropdown() {
    this.apiService.setHttp('get','ValveMaster/GetValveNameList?userId=' + this.localStorage.userId() + '&YojanaId=' + this.valveConnectionForm.value.yojanaId + '&NetworkId=' + this.valveConnectionForm.value.networkId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.valveConnectionArray = res.responseData;
          // this.editFlag ? this.valveConnectionForm.controls['valveMasterId'].setValue() : '';

        }
        else {
          this.valveConnectionArray = [];
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toasterService.error(res.statusMessage);
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
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toasterService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  onClickEdit(editObj: any) {
    console.log("editObj",editObj)
    this.connectionForm.clear()
    this.highlitedRow = editObj.id;
    this.editFlag = true;
    this.valveConnectionForm.patchValue({
      "id": editObj.id,
      "valveMasterId": editObj.valveMasterId,
      "personName": editObj.personName,
      "mobileNo": editObj.mobileNo,
      "remark": editObj.remark,
      "createdBy": this.localStorage.userId(),
      "yojanaId":editObj.yojanaId,
      "networkId":editObj.networkId,
      "consumerUserId": 0,
      "totalConnection":editObj.totalConnection,
    });
    editObj.connectiondetails?.map((element: any) => {
      let arrayData = this.fb.group({
        pipeDiameter: [element.pipeDiameter],
        connectionNo: [+element.connectionNo]
      });
      this.connectionForm.push(arrayData);
    })
    this.getYoganaDropdown();
  }

  onClickSubmit() {
    this.submitted = true;
    if (!this.valveConnectionForm.valid) {
      if (this.connectionForm.controls[this.connectionForm.length - 1].status == 'INVALID') {
        return;
      }
      return;
    }
    else {
      this.spinner.show();
      let formData = this.valveConnectionForm.value;
     this.apiService.setHttp(this.editFlag ? 'put' : 'post', 'ValveConnection', false, formData, false, 'valvemgt');
      this.apiService.getHttp().subscribe({
        next: ((res: any) => {
         if (res.statusCode == "200") {
            this.spinner.hide();
            this.highlitedRow = 0;
            this.toasterService.success(res.statusMessage);
            this.closebutton.nativeElement.click();
            this.bindValveConnectionsTable();
            this.clearForm();
         }
          else {
            this.commonService.checkDataType(res.statusMessage) == false
              ? this.errorSerivce.handelError(res.statusCode)
              : this.toasterService.error(res.statusMessage);
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
  clearForm(formDirective?:any) {
    this.submitted = false;
    formDirective?.resetForm();
    this.defaultValveConnectionForm();
    this.editFlag = false;
  }

  clearSearch(flag: any) {
    if (flag == 'yojana') {
      this.searchForm.controls['network'].setValue('');
      this.searchForm.controls['valveMaster'].setValue('')
    } 
    else (flag == 'network')
    {
      this.searchForm.controls['valveMaster'].setValue('')
    } 
    // else if (flag == 'valveMaster') {
    //   this.searchForm.controls['valveMaster'].setValue('');
    // }
    this.pageNumber = 1;
    // this.getUserRegistrationList();
    this.clearForm();
  }





}
