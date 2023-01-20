import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { CommonService } from 'src/app/core/services/common.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { ValidationService } from 'src/app/core/services/validation.service';
@Component({
  selector: 'app-sim-list',
  templateUrl: './sim-list.component.html',
  styleUrls: ['./sim-list.component.css'],
})
export class SimListComponent implements OnInit {
  //Initialize variable
  editFlag!: boolean;
  editData!: any;
  simOperatorList: { id: number; operatorName: string; sortOrder: number }[] = [];
  simFormData: FormGroup | any;
  submitted: boolean = false;
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  getAllYojanaArray = new Array();
  getAllNetworkArray = new Array();
  simArray = new Array();
  listCount!: number;
  headerText: string = 'Add Sim';
  getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
  @ViewChild('addSimData') addSimData: any;
  deleteSimId: number = 0;
  highlitedRow: any;

  constructor(
    private spinner: NgxSpinnerService,
    public apiService: ApiService,
    public commonService: CommonService,
    public validations: ValidationService,
    private errorSerivce: ErrorsService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private localStorage: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.controlForm();
    this.getSimOperator();
    this.getAllYojana();
    this.getAllSimData();
  }

  //Form Initialize
  controlForm() {
    this.simFormData = this.fb.group({
      id: [0],
      yojanaId: ['', Validators.required],
      networkId: ['', Validators.required],
      simNo: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9]{20}$')],
      ],
      imsiNo: [
        '',
        [Validators.required, Validators.pattern('^[a-zA-Z0-9]{15}$')],
      ],
      operatorId: ['', [Validators.required,Validators.pattern('[^0]+')]],
    });
  }

  // Yojana Array
  getAllYojana() {
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getAllLocalStorageData.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.getAllYojanaArray = res.responseData;
        }
      }, error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    })
  }

  // Network Array
  getAllNetwork() {
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllNetworkbyUserId?UserId=' + this.getAllLocalStorageData.userId
      + '&YojanaId=' + (this.simFormData.value.yojanaId || 0), false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.getAllNetworkArray = res.responseData;
          this.editFlag ? (this.simFormData.controls['networkId'].setValue(this.editData.networkId)) : '';
        } else {
          this.getAllNetworkArray = [];
        }
      }, error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    })
  }

  //Get Sim Operator
  getSimOperator() {
    this.spinner.show();
    this.apiService.setHttp('get','SimMaster/GetSIMOperatorList',false,false,false,'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.simOperatorList = res.responseData;
        } else {
          this.spinner.hide();
          this.simOperatorList = [];
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

  //Clear Form Data
  clearForm(formDirective?: any) {
    formDirective?.resetForm();
    this.getAllNetworkArray = [];
    this.editFlag = false;
    this.headerText = 'Add Sim';
    this.submitted = false;
  }

  //To Submit the Data
  onSubmit() {
    let formData = this.simFormData.value;
    this.submitted = true;
    if (this.simFormData.invalid) {
      return;
    } else {
      let obj = {
        ...formData,
        operatorName:"",
        createdBy: this.localStorage.userId(),
      };
      this.spinner.show();
      let urlType;
      formData.id == 0 ? (urlType = 'POST') : (urlType = 'PUT');
      this.apiService.setHttp(urlType,'SimMaster',false, obj,false,'valvemgt'
      );
      this.apiService.getHttp().subscribe(
        (res: any) => {
          if (res.statusCode == '200') {
            this.spinner.hide();
            this.toastrService.success(res.statusMessage);
            this.editFlag = false;
            this.addSimData.nativeElement.click();
            this.getAllSimData();
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

  //Get Form Data using Validation Purpose
  get f() {
    return this.simFormData.controls;
  }

  //Get Sim Details
  getAllSimData() {
    this.spinner.show();
    let obj = 'UserId=1&pageno=' + this.pageNumber + '&pagesize=' + this.pagesize;
    this.apiService.setHttp('get', 'SimMaster?UserId=1&pageno=' + this.pageNumber + '&pagesize=' + this.pagesize, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.simArray = res.responseData.responseData1;
          this.listCount = res.responseData.responseData2?.totalCount;
          this.highlitedRow = 0;
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

  selPagination(pagNo: number) {
    this.pageNumber = pagNo;
    this.getAllSimData();
  }

  //Update Sim Data
  updateSimData(simData: any) {
    this.editData = simData;
    this.highlitedRow = simData.id;
    this.editFlag = true;
    this.headerText = 'Update Sim';
    this.simFormData.patchValue({
      id: simData.id,
      yojanaId: simData.yojanaId,
      simNo: simData.simNo,
      imsiNo: simData.imsiNo,
      operatorId: simData.operatorId,
    });
    this.getAllNetwork();
  }

  //Bind We need to deleted Id
  deleteConformation(id: any) {
    this.deleteSimId = id;
    this.highlitedRow = id;
  }

  //Delete Sim Data
  deleteSim() {
    let obj = {
      id: this.deleteSimId,
      deletedBy: this.localStorage.userId(),
    };
    this.apiService.setHttp('DELETE','SimMaster',false,obj,false,'valvemgt'
    );
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.toastrService.success(res.statusMessage);
          this.getAllSimData();
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

  clearDropdown() {
    this.simFormData.controls['networkId'].setValue('');
    this.getAllNetworkArray = [];
  }
}
