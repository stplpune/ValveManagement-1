import { Component, ElementRef, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MapsAPILoader } from '@agm/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { number } from '@amcharts/amcharts4/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ValidationService } from 'src/app/core/services/validation.service';
@Component({
  selector: 'app-valve-list',
  templateUrl: './valve-list.component.html',
  styleUrls: ['./valve-list.component.css'],
})
export class ValveListComponent implements OnInit {
  valveListForm: FormGroup | any;
  searchForm!: FormGroup;
  submitted = false;
  iseditbtn = false;
  editFlag:boolean=false;
  editObj: any;
  readioSelected: any;
  btnText = 'Save Changes';
  headingText = 'Add Valve';
  valveStatusArray: any;
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  districtArray: any;
  yojanaArray: any;
  networkArray: any;
  tankArray: any;
  valvelistArray: any;
  yoganaArrayFilter: any;
  networkArrayfilter: any;
  getAllLocalStorageData: any;
  filterFlag: any = 'filter';
  @ViewChild('addValveModel') addValveModel: any;
  @ViewChild('addValveModal', { static: false }) addValveModal: any;
  HighlightRow!: number;
  deleteValveId: any;
  simArray: any;
  addressZoomSize = 6;
  subject: Subject<any> = new Subject();
  geoCoder: any;
  editChangeFlag:any;
  constructor(
    private mapsAPILoader: MapsAPILoader,
    public commonService: CommonService,
    public apiService: ApiService,
    private toastrService: ToastrService,
    private errorSerivce: ErrorsService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private localStorage: LocalstorageService,
    private ngZone: NgZone,
    public validation: ValidationService,
  ) { }

  ngOnInit() {
    this.Filter();
    this.defaultForm();
    this.getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
    //  this.getAllValveData();
    this.getAllYojana();
     this.localStorage.userId() == 1 ?  this.getAllValveData() : '';
  }
  get f() {
    return this.valveListForm.controls;
  }

  defaultForm() {
    this.valveListForm = this.fb.group({
      simId: ['', [Validators.required]],     
      yojana: ['', [Validators.required],],
      network: ['', [Validators.required],],     
      valveId: ['', [Validators.required, Validators.pattern('^[^[ ]+|[ ][gm]+$')],],
      companyName: ['', [Validators.required, Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+"\'/\\]\\]{}][a-zA-Z.\\s]+$'),],],    

    });
  }

  Filter() {
    this.searchForm = this.fb.group({
      yojana: [''],
      network: [''],
      
    })
  }

  getAllYojana() {
    this.apiService.setHttp('get', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getAllLocalStorageData.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode =='200') {
          this.spinner.hide();
          this.filterFlag == 'filter' ? this.yoganaArrayFilter = res.responseData : this.yojanaArray = res.responseData; 
          // this.yoganaArrayFilter?.length == 1 ? (this.searchForm.controls['yojana'].setValue(this.yoganaArrayFilter[0].yojanaId), this.getAllNetwork()) : '';
          // this.yojanaArray?.length == 1 ? (this.valveListForm.controls['yojana'].setValue(this.yojanaArray[0].yojanaId), this.getAllNetwork()) : '';  
          // this.editFlag ? (this.valveListForm.controls['yojana'].setValue(this.editObj.yojanaId),this.getAllNetwork()) : '';
          this.filterFlag == 'filter' ? this.yoganaArrayFilter = res.responseData : this.yojanaArray = res.responseData; 
          (this.filterFlag == 'filter' && this.yoganaArrayFilter?.length == 1 && !this.editFlag) ? (this.searchForm.controls['yojana'].setValue(this.yoganaArrayFilter[0].yojanaId), this.getAllNetwork()) : '';
          (this.yojanaArray?.length == 1  && !this.editFlag )? (this.valveListForm.controls['yojana'].setValue(this.yojanaArray[0].yojanaId), this.getAllNetwork()) : '';  
          this.editFlag ? (this.valveListForm.controls['yojana'].setValue(this.editObj.yojanaId), this.getAllNetwork()) : '';
        } else {
          this.spinner.hide();
          this.filterFlag == 'filter' ? this.yoganaArrayFilter = [] : this.yojanaArray = [];
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

  getAllNetwork(){
    let id = this.filterFlag == 'filter' ? this.searchForm.value.yojana : this.valveListForm.value.yojana;
    this.apiService.setHttp('get', 'api/MasterDropdown/GetAllNetworkbyUserId?UserId=' + this.getAllLocalStorageData.userId + '&YojanaId=' + (id || this.getAllLocalStorageData.yojanaId), false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.spinner.hide();
          this.filterFlag == 'filter' ? this.networkArrayfilter = res.responseData : this.networkArray = res.responseData;
          (this.yoganaArrayFilter?.length == 1 && this.networkArrayfilter?.length > 1) ?  this.getAllValveData() : '';
          // this.networkArrayfilter?.length == 1 ? (this.searchForm.patchValue({ network: this.networkArrayfilter[0].networkId }),this.getAllValveData()) : '';
          // this.networkArray?.length == 1 ? (this.valveListForm.patchValue({ network: this.networkArray[0].networkId }),this.ToBindSimNumberList()) : '';
          // this.editFlag ? (this.valveListForm.setValue(this.editObj.networkId),this.ToBindSimNumberList()) :'' ;
          this.filterFlag == 'filter' ? this.networkArrayfilter = res.responseData : this.networkArray = res.responseData;
          (this.filterFlag == 'filter' && this.networkArrayfilter?.length == 1 &&  !this.editFlag)? (this.searchForm.patchValue({ network: this.networkArrayfilter[0].networkId }),this.getAllValveData()) : '';
          (this.networkArray?.length == 1 && !this.editFlag) ? (this.valveListForm.patchValue({ network: this.networkArray[0].networkId }),this.ToBindSimNumberList()) : '';
          // this.editObj ? (this.valveListForm.controls['network'].setValue(this.editObj.networkId),this.ToBindSimNumberList()) :'';
          (this.editFlag) ? (this.valveListForm.controls['network'].setValue(this.editObj.networkId), this.ToBindSimNumberList()) : '';
        } else {
          this.spinner.hide();
          this.filterFlag == 'filter' ? this.networkArrayfilter = [] : this.networkArray = [];
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

  ToBindSimNumberList() {
   let formData= this.valveListForm.value
   let simMasterId=  this.btnText == 'Save Changes'? 0 : this.editObj.simid;
    this.apiService.setHttp('get', 'SimMaster/GetSimListDropdownNewList?YojanaId=' + formData.yojana + '&NetworkId=' + formData.network +'&SIMId='+ simMasterId , false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.simArray = res.responseData;
          this.simArray?.length == 1 ? this.valveListForm.patchValue({ simId: this.simArray[0].id }) : '';
          (this.editFlag) ? (this.valveListForm.controls['simId'].setValue(this.editObj.simid)) :'';
        } else {
          this.spinner.hide();
          this.simArray = [];
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

  clearForm() {
    this.submitted = false;
    this.defaultForm();
    this.editFlag = false;
    this.btnText = 'Save Changes';
    this.headingText = 'Add Valve';
    this.yojanaArray?.length == 1 ? (this.valveListForm.patchValue({ yojana: this.yojanaArray[0].yojanaId })) : '';
    this.networkArray?.length == 1 && this.getAllLocalStorageData.userTypeId == 2 ? (this.valveListForm.patchValue({ network: this.networkArray[0].networkId })) : '';
  }

  getAllValveData() {
    let formdata = this.searchForm.value;
    this.spinner.show();
    let obj = {
      "pageno": this.pageNumber,
      "YojanaId": formdata.yojana || this.getAllLocalStorageData.yojanaId || 0,
      "NetworkId": formdata.network || 0
    }
    this.apiService.setHttp('get', 'ValveMaster?UserId=' + this.localStorage.userId() + '&pageno=' + obj.pageno + '&pagesize=10&YojanaId=' + (obj.YojanaId || this.getAllLocalStorageData.yojanaId) + '&NetworkId=' + obj.NetworkId + '&Search=', false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.spinner.hide();
          this.valveStatusArray = res.responseData.responseData1;
          this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;
        } else {
          this.spinner.hide();
          this.valveStatusArray = [];
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

  onClickPagintion(pageNo: any) {
    this.pageNumber = pageNo;
    this.getAllValveData();
    
  }

  onSubmit() {
    let formData = this.valveListForm.value;
    this.submitted = true;
    if (this.valveListForm.invalid) {
      return;
    } else {
      let obj = {
        "id": this.editFlag ? this.editObj.id : 0,
        "valveName":'',
        "valveDetailsId": 0,
        "valveName_En": "",
        "valveId": formData.valveId,
        "companyName": formData.companyName,
        "description": '',
        "createdBy": this.localStorage.userId(),
        "statusId": 0,
        "valveStatus": "",
        "statusDate": new Date(),
        "valvePipeDiameter": '',
        "noOfConnection": 0,
        "simid": formData.simId,
        "latitude": 0,
        "longitude": 0,
        "simNo": "",
        "actionDate": new Date(),
        "valveAddress": '',
        "isPrecidingValve": 0,
        "valveId_TankId": 0,
        "yojanaId":formData.yojana,
        "networkId":formData.network,
         "isScheduler": 0
      }
      this.spinner.show();
      let urlType;
      this.editFlag ? (urlType = 'PUT') : (urlType = 'POST');
      this.apiService.setHttp(urlType, 'ValveMaster', false, obj, false, 'valvemgt');
      this.apiService.getHttp().subscribe(
        (res: any) => {
          if (res.statusCode == '200') {
            this.spinner.hide();
            this.toastrService.success(res.statusMessage);
            this.addValveModel.nativeElement.click();
            this.filterFlag = 'filter';
            this.getAllValveData();
            this.clearForm();
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

  updateValveData(obj: any) {
    this.editObj= obj;
    this.editFlag=true;
    this.iseditbtn = true;
    this.btnText = 'Update Changes';
    this.headingText = 'Update Valve';
    this.HighlightRow = obj.id;
    this.valveListForm.patchValue({     
      valveId:this.editObj.valveId ,
      companyName:this.editObj.companyName,    
      // yojana:this.editObj.yojanaId,
      // network:this.editObj.networkId,
      // simId:this.editObj.simid
    });  
    // this.getAllYojana();
    // this.getAllNetwork();
    //  this.ToBindSimNumberList();
  }

  deleteConformation(id: any) {
    this.HighlightRow = id;
    this.deleteValveId = id;
  }

  deleteJobPost() {
    let obj = {
      id: parseInt(this.deleteValveId),
      deletedBy: this.localStorage.userId(),
    };
    this.apiService.setHttp('DELETE', 'ValveMaster', false, JSON.stringify(obj), false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.toastrService.success(res.statusMessage);
          this.getAllValveData();
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

 

  clearSerach(flag: any) {
    if (flag == 'yojana') {
      this.searchForm.controls['network'].setValue('');
    }  else if (flag == 'network') {
      this.searchForm.controls['network'].setValue('');
    }
    this.pageNumber = 1;
    // this.getAllValveData();
    this.clearForm();
  }

  clearhighlightrow() {
    this.HighlightRow = 0;
  }

  clearFilter(flag: any) {
    if (flag == 'yojana') {
      this.valveListForm.controls['network'].setValue('');
      this.valveListForm.controls['simId'].setValue('');
    } else if (flag == 'network') {
      this.valveListForm.controls['simId'].setValue('');
    }
  }

  defaultPageNo() {
    this.pageNumber = 1;
    this.getAllValveData()
  }


}
