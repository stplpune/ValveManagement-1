import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { ValidationService } from 'src/app/core/services/validation.service';

@Component({
  selector: 'app-network-master',
  templateUrl: './network-master.component.html',
  styleUrls: ['./network-master.component.css']
})
export class NetworkMasterComponent implements OnInit {

  networkRegForm!: FormGroup | any;
  allNetworkArray = new Array();
  allYojanaArray = new Array();
  yojanaAddResp: any;
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  editFlag: boolean = false;
  deleteSegmentId: any;
  submitted: boolean = false;
  highlitedRow: any;
  getAllLocalStorageData: any;
  respYojanaId: any;
  allYojanaFilterArray: any;
  filterFlag: any = 'filter';
  yojana = new FormControl('');
  editData!:any;
  @ViewChild('closebutton') closebutton: any;
  get f() {
    return this.networkRegForm.controls;
  }
  constructor(private apiService: ApiService,
    private fb: FormBuilder,
    public validation: ValidationService,
    private localStorage: LocalstorageService,
    public commonService: CommonService,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    private errorSerivce: ErrorsService) { }

  ngOnInit(): void {
    this.controlForm();
    this.getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
    this.getAllNetworkTableData();
    this.getAllYojana();
  }

  controlForm() {
    this.networkRegForm = this.fb.group({
      // id: [0],
      networkName: ['', Validators.required],
      yojanaId: [this.allYojanaArray?.length == 1 ? this.allYojanaArray[0].yojanaId : '', Validators.required]
    })

  }

  getAllYojana() {
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getAllLocalStorageData.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.allYojanaArray = res.responseData;
          this.allYojanaFilterArray = res.responseData;
          this.filterFlag == 'filter' ? this.allYojanaFilterArray = res.responseData : this.allYojanaArray = res.responseData;
          this.allYojanaFilterArray?.length == 1 ? (this.yojana.setValue(this.allYojanaFilterArray[0].yojanaId)) : '';
          this.allYojanaArray?.length == 1 ? (this.networkRegForm.patchValue({ yojanaId: this.allYojanaArray[0].yojanaId })) : '';

        } else {
          this.allYojanaArray = [];
          this.filterFlag == 'filter' ? this.allYojanaFilterArray = [] : this.allYojanaArray = [];
          this.toastrService.error(res.statusMessage);
        }
      }, error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    })
  }

  getAllNetworkTableData() {
    let formData = this.yojana.value || 0;
    this.spinner.show();
    this.apiService.setHttp('GET', 'ValveManagement/Network/GetAllNetwork?YojanaId=' + (formData ||  this.getAllLocalStorageData.yojanaId) + '&pageno=' + this.pageNumber + '&pagesize=' + this.pagesize, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode == "200") {
          this.allNetworkArray = res.responseData.responseData1;
          this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;
          this.highlitedRow = 0;
        } else {
          this.spinner.hide();
          this.allNetworkArray = [];
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.networkRegForm.invalid) {
      return;
    } else {
      let formData = this.networkRegForm.value;
      if(this.editFlag) {formData.id = this.editData.id};
      formData.createdBy = this.localStorage.userId();
      formData.timestamp = new Date();
      this.spinner.show();
      let urlType = this.editFlag ? 'PUT' : 'POST';
      let urlName = this.editFlag ? ('ValveManagement/Network/UpdateNetwork') : ('ValveManagement/Network/AddNetwork');
      this.apiService.setHttp(urlType, urlName, false, formData, false, 'valvemgt');
      this.apiService.getHttp().subscribe(
        (res: any) => {
          if (res.statusCode == '200') {
            this.spinner.hide();
            this.toastrService.success(res.statusMessage);
            this.getAllNetworkTableData();
            this.filterFlag = 'filter';
            this.closebutton.nativeElement.click();
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

  onEdit(data?: any) {
    this.editData = data;
    this.editFlag = true;
    this.highlitedRow = data.id;
    this.networkRegForm.patchValue({
      id: data.id,
      networkName: data.networkName,
      yojanaId: data.yojanaId,
      createdBy: data.createdBy,
      timestamp: data.timestamp
    })
  }

  clearForm(formDirective?: any) {
    formDirective?.resetForm();
    this.submitted = false;
    this.editFlag = false;
    this.allYojanaArray?.length == 1 ? (this.networkRegForm.patchValue({ yojanaId: this.allYojanaArray[0].yojanaId })) : '';

  }

  deleteConformation(id?: any) {
    this.deleteSegmentId = id;
    this.highlitedRow = id;
  }

  deleteNetworkMaster() {
    let deleteObj = {
      id: this.deleteSegmentId,
      modifiedBy: this.localStorage.userId(),
      modifiedDate: new Date()
    }
    this.apiService.setHttp('DELETE', 'ValveManagement/Network/DeleteNetwork', false, deleteObj, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.toastrService.success(res.statusMessage);
          this.getAllNetworkTableData();
        } else {
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : this.toastrService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  onClickPagintion(pageNo: number) {
    this.pageNumber = pageNo;
    this.getAllNetworkTableData();
  }

  clearDropdown(flag: any) {
    this.editFlag = false;
    switch (flag) {
      case 'yojana': this.networkRegForm.controls['yojanaId'].setValue('');
        break;
    }
  }

  defaultPageNo() {
    this.pageNumber = 1;
    this.getAllNetworkTableData()
  }


}
