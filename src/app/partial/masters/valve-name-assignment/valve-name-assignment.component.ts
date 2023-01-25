import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-valve-name-assignment',
  templateUrl: './valve-name-assignment.component.html',
  styleUrls: ['./valve-name-assignment.component.css']
})
export class ValveNameAssignmentComponent implements OnInit {

  filterForm: FormGroup | any;

  valveNameAssignmtForm: FormGroup | any; 
  submited: boolean = false;
  textName = 'Submit';
  valveNameAssignmentArray: any;
  pageNumber: number = 1; 
  pagesize: number = 10;
  totalRows: any;
  getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
  ValveNameAssignmentId: any;
  @ViewChild('valveNameAssignmtModel') valveNameAssignmtModel: any;
  yoganaArray: any;
  networkArray: any;  
  networkIdAddArray: any;
  ValveNameListArray: any;
  masterValveListArray: any;


  constructor(
    public commonService: CommonService,
    public apiService: ApiService,
    private toastrService: ToastrService,
    private errorSerivce: ErrorsService,
    private spinner: NgxSpinnerService,
    private localStorage: LocalstorageService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.defaultForm();
    this.defaultFilterForm();
    this.getYoganaId();
    this.localStorage.userId() == 1 ? this.getValveNameAssignmentAll() : '';
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      yojanaId: [''],
      networkId: [''],
      searchText: ['']
    })
  }

  defaultForm() {
    this.valveNameAssignmtForm = this.fb.group({
      id: [0],
      yojanaId: ['', [Validators.required]],
      networkId: ['', [Validators.required]],
      valveId: ['', [Validators.required]],
      valveNameId: ['', [Validators.required]],
    })  
  }  


  get f() { return this.valveNameAssignmtForm.controls }

  getYoganaId() {
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getAllLocalStorageData.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.yoganaArray = res.responseData;
        this.yoganaArray?.length == 1 ? (this.filterForm.patchValue({ yojanaId: this.yoganaArray[0].yojanaId }), this.getNetworkId()) : '';
        this.yoganaArray?.length == 1 ? (this.valveNameAssignmtForm.patchValue({ yojanaId: this.yoganaArray[0].yojanaId }), this.getNetworkIdAdd()) : '';
      }
      else {
        this.yoganaArray = [];
        this.toastrService.error(res.statusMessage);
      }
    },
      (error: any) => {
        this.errorSerivce.handelError(error.status);
      })
  }

  getNetworkId() {
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllNetworkbyUserId?YojanaId=' + this.filterForm.value.yojanaId + '&UserId=' + this.localStorage.userId(), false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.networkArray = res.responseData;
        this.networkArray?.length == 1 ? (this.filterForm.patchValue({ networkId: this.networkArray[0].networkId }),this.getValveNameAssignmentAll()) : '';
      }
      else {
        this.networkArray = [];
        this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
      }
    },
      (error: any) => {
        this.errorSerivce.handelError(error.status);
      })
  }

  getNetworkIdAdd(flag?:any) { // For Filter
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllNetworkbyUserId?YojanaId=' + this.valveNameAssignmtForm.value.yojanaId + '&UserId=' + this.localStorage.userId(), false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.networkIdAddArray = res.responseData;
        this.networkIdAddArray?.length == 1 ? (this.valveNameAssignmtForm.patchValue({ networkId: this.networkIdAddArray[0].networkId }),this.getValveNameList(),this.getAllMasterValveList()) : '';
        this.networkIdAddArray?.length > 1 && flag == 'bind' ? (this.valveNameAssignmtForm.patchValue({ networkId: this.valveNameAssignmtForm.value.networkId }),this.getValveNameList(),this.getAllMasterValveList()) : '';
      }
      else {
        this.networkIdAddArray = [];
        this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
      }
    },
      (error: any) => {
        this.errorSerivce.handelError(error.status);
      })
  }

  getValveNameList() { // valveId  
    let obj = this.localStorage.userId() + '&YojanaId=' + (this.valveNameAssignmtForm.value.yojanaId || 0) + '&NetworkId=' + (this.valveNameAssignmtForm.value.networkId || 0)
    this.apiService.setHttp('GET', 'ValveMaster/GetValveNameList?userId=' + obj, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.ValveNameListArray = res.responseData;
        this.ValveNameListArray?.length > 1 ? (this.valveNameAssignmtForm.patchValue({ valveId: this.valveNameAssignmtForm.value.valveId })) : '';
    }
      else {
        this.ValveNameListArray = [];
        this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
      }
    },
      (error: any) => {
        this.errorSerivce.handelError(error.status);
      })
  }

  getAllMasterValveList() { // valveNameId
    let obj = (this.valveNameAssignmtForm.value.yojanaId || 0) + '&NetworkId=' + (this.valveNameAssignmtForm.value.networkId || 0) + '&ValveMasterId=' + 0
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllMasterValveList?YojanaId=' + obj, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.masterValveListArray = res.responseData;
        this.masterValveListArray?.length > 1 ? (this.valveNameAssignmtForm.patchValue({ valveNameId: this.valveNameAssignmtForm.value.valveNameId })) : '';
    }
      else {
        this.masterValveListArray = [];
        this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
      }
    },
      (error: any) => {
        this.errorSerivce.handelError(error.status);
      })
  }

  clearFilter(flag: any) {
    if (flag == 'yojana') {
      this.filterForm.controls['networkId'].setValue('');
    } else if (flag == 'network') {
    } 
    this.pageNumber = 1;   
    this.getValveNameAssignmentAll();
  }


  getValveNameAssignmentAll() { //table Api
    this.spinner.show();
    let obj =  this.localStorage.userId() + '&YojanaId=' + (this.filterForm.value.yojanaId || this.getAllLocalStorageData.yojanaId) + '&NetworkId=' + (this.filterForm.value.networkId || 0)
      + '&pageno=' + this.pageNumber + '&pagesize=' + this.pagesize + '&Search=' ;
    this.apiService.setHttp('get', 'ValveNameAssignment/GetValveNameAssignmentAll?userId=' + obj, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.valveNameAssignmentArray = res.responseData.responseData1; 
          this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;
        } else {
          this.spinner.hide();
          this.valveNameAssignmentArray = [];
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  onClickPagintion(pageNo: number) {
    this.pageNumber = pageNo;
    this.getValveNameAssignmentAll();
  }

  onSubmit() {
    this.submited = true;
    if (this.valveNameAssignmtForm.invalid) {
      return;
    } else {
      let formData = this.valveNameAssignmtForm.value;
      let obj = {
        "id": formData.id,
        "valveMasterId": formData.valveId,
        "valveDetailsId": formData.valveNameId,
        "yojanaId": formData.yojanaId,
        "networkId": formData.networkId,
        "isDeleted": false,
        "createdBy": this.localStorage.userId(),
        "createdDate": new Date(),
        "modifiedBy": this.localStorage.userId(),
        "modifiedDate": new Date(),
        "timestamp": new Date(),
      }

      this.spinner.show();
      let urlType = formData.id == 0 ? 'POST' : 'PUT';
      let UrlName = formData.id == 0 ? 'ValveNameAssignment/AddValveNameAssignment' : 'ValveNameAssignment/UpdateValveNameAssignment';
      this.apiService.setHttp(urlType, UrlName, false, JSON.stringify(obj), false, 'valvemgt');
      this.apiService.getHttp().subscribe(
        (res: any) => {
          if (res.statusCode == '200') {
            this.spinner.hide();
            this.toastrService.success(res.statusMessage);
            this.clearForm();
            this.getValveNameAssignmentAll();
            this.valveNameAssignmtModel.nativeElement.click();
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

  clearForm() {
    this.submited = false;
    this.textName = 'Submit';
    this.defaultForm(); 
    this.yoganaArray?.length == 1 ?  this.valveNameAssignmtForm.controls['yojanaId'].setValue(this.yoganaArray[0].yojanaId) : '';
    (this.networkIdAddArray?.length == 1 && this.valveNameAssignmtForm.value.yojanaId) ? this.valveNameAssignmtForm.controls['networkId'].setValue(this.networkIdAddArray[0].networkId) : '';
    // this.getYoganaId();
  }

  deleteConformation(id: any) { 
    this.ValveNameAssignmentId = id;
  }

  deleteValveNameAss() {
    let obj = {
      id: parseInt(this.ValveNameAssignmentId),
      deletedBy: this.localStorage.userId(),
    };
    this.apiService.setHttp('DELETE', 'ValveNameAssignment/DeleteValveNameAssignment', false, JSON.stringify(obj), false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.toastrService.success(res.statusMessage);
          this.getValveNameAssignmentAll();
        } else {
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : this.toastrService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  patchFormData(obj: any) {
    this.textName = 'Update';

    this.valveNameAssignmtForm.patchValue({
      id: obj.valveAssignmentId,
      yojanaId: obj.yojanaId,
      networkId: obj.networkId,
      valveId: obj.valveDetailsId,
      valveNameId: obj.valveMasterId,
    })
    this.getNetworkIdAdd('bind');

  }

  clearFormDrop(flag: any) {
    if (flag == 'yojana') {
      this.valveNameAssignmtForm.controls['networkId'].setValue('');
      this.valveNameAssignmtForm.controls['valveId'].setValue('');
      this.valveNameAssignmtForm.controls['valveNameId'].setValue('');
    } else if (flag == 'network') {
      this.valveNameAssignmtForm.controls['valveId'].setValue('');
      this.valveNameAssignmtForm.controls['valveNameId'].setValue('');
    } 
  }

}
