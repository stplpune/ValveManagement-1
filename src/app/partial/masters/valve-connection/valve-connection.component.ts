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
  editObj :any;
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
    private spinner: NgxSpinnerService,
    public validation: ValidationService,) { }

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

  bindValveConnectionsTable() {
    this.spinner.show();
      let obj = 'YojanaId='+(this.searchForm.value.yojana?this.searchForm.value.yojana:0)
    +'&NetworkId='+(this.searchForm.value.network?this.searchForm.value.network:0)
    +'&UserId='+this.localStorage.userId()+'&pageno='+ this.pageNumber + '&pagesize='+this.pagesize
    +'&ValveMasterId='+(this.searchForm.value.valveMaster?this.searchForm.value.valveMaster:0);

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
    // let data = this.valveConnectionForm.value.yojanaId;
     this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getLoginData.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res:any)=>{
      if(res.statusCode=="200"){
        this.yoganaArray=res.responseData;
         this.editFlag ? (this.valveConnectionForm.controls['yojanaId'].setValue(this.editObj.yojanaId),this.getNetworkDropdown()) : '';
       
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

  getNetworkDropdown(flag?:any){
    let id = flag == 'filter' ? this.searchForm.value.yojana : this.valveConnectionForm.value.yojanaId;
   if(id){
    this.apiService.setHttp('GET','api/MasterDropdown/GetAllNetworkbyUserId?UserId='+ this.localStorage.userId() +'&YojanaId='+ id, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res:any)=>{
      if(res.statusCode=="200"){
        this.networkArray=res.responseData;
        this.editFlag ? (this.valveConnectionForm.controls['networkId'].setValue(this.editObj.networkId),this.getValveConnectionDropdown()) : '';
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
  }
   getValveConnectionDropdown(flag?:any) {
    let params = flag == 'filter' ? ( '&YojanaId=' + this.searchForm.value.yojana + '&NetworkId=' + this.searchForm.value.network):('&YojanaId=' + this.valveConnectionForm.value.yojanaId + '&NetworkId=' + this.valveConnectionForm.value.networkId);
    this.apiService.setHttp('get','ValveMaster/GetValveNameList?userId=' + this.localStorage.userId()+ params , false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.valveConnectionArray = res.responseData;
         this.editFlag ? this.valveConnectionForm.controls['valveMasterId'].setValue(this.editObj.valveMasterId) : '';

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

  onClickEdit(Obj: any) {
   this.editObj = Obj;
   console.log("editObj",this.editObj);
    this.connectionForm.clear()
    this.highlitedRow = this.editObj.id;
    this.editFlag = true;
    this.valveConnectionForm.patchValue({
      "id":this.editObj.id,
      "valveMasterId":this.editObj.valveMasterId,
      "personName":this.editObj.personName,
      "mobileNo":this.editObj.mobileNo,
      "remark":this.editObj.remark,
      "createdBy":this.localStorage.userId(),
      "yojanaId":this.editObj.yojanaId,
       "networkId":this.editObj.networkId,
      "consumerUserId":this.editObj.consumerUserId,
      "totalConnection":this.editObj.totalConnection,
    });
    this.editObj.connectiondetails?.map((element: any) => {
      let arrayData = this.fb.group({
        pipeDiameter: [element.pipeDiameter],
        connectionNo: [element.connectionNo]
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
      formData.totalConnection = parseInt(formData.totalConnection);
      formData.connectionNo = parseInt(formData.connectionNo);
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
     this.bindValveConnectionsTable();
    this.clearForm();
  }





}
