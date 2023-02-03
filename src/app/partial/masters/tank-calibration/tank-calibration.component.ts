import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { ValidationService } from 'src/app/core/services/validation.service';

@Component({
  selector: 'app-tank-calibration',
  templateUrl: './tank-calibration.component.html',
  styleUrls: ['./tank-calibration.component.css']
})
export class TankCalibrationComponent implements OnInit {

  tankForm !: FormGroup | any;
  filterFrm!: FormGroup | any;
  tankArray = new Array();
  submitted: boolean = true;
  pageNumber: number = 1;
  pagesize: number = 10;
  tankCalibrationArray = new Array();
  totalRows: any;
  highlitedRow: any;
  localstorageData: any;
  editFlag: boolean = false;
  updatedObj: any;
  tankName: any;
  btnText!: string;
  yojanaArray = new Array();
  networkArray = new Array();
  @ViewChild('AddValveModal') AddValveModal: any;
  constructor(
    private fb: FormBuilder,
    private localStorage: LocalstorageService,
    private spinner: NgxSpinnerService,
    public apiService: ApiService,
    private errorSerivce: ErrorsService,
    private toastrService: ToastrService,
    public commonService: CommonService,
    public validation: ValidationService,
  ) { }

  ngOnInit(): void {
    this.localstorageData = this.localStorage.getLoggedInLocalstorageData();
    this.defaultForm();
    this.getFilterForm();
    this.getAllYojana();
   this.localStorage.userId() == 1 ? this.getAllTankCalibration() : '';
  }

  defaultForm() {
    this.tankForm = this.fb.group({
      tankId: ['', [Validators.required]],
      tankMinLevel: ['', [Validators.required]],
      tankMaxLevel: ['', [Validators.required]],
      tankMinQty: ['', [Validators.required]],
      tankMaxQty: ['', [Validators.required]],
    })
  }

  getFilterForm() {
    this.filterFrm = this.fb.group({
      yojanaId: [''],
      networkId: ['']
    })
  }

 
  get f() { return this.tankForm.controls }


  getAllYojana() {
    this.apiService.setHttp('get', 'api/MasterDropdown/GetAllYojana?YojanaId=' +this.localstorageData.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.yojanaArray = res.responseData;
          this.yojanaArray?.length == 1 ? (this.filterFrm.controls['yojanaId'].setValue(this.yojanaArray[0].yojanaId), this.getNetworkByYojanaId()) : '';
        } else {
          this.yojanaArray = [];
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

  getNetworkByYojanaId() {
    let yojanaId=this.filterFrm.value.yojanaId;
    this.apiService.setHttp('get', 'api/MasterDropdown/GetAllNetworkbyUserId?UserId='+ this.localstorageData.userId +'&YojanaId=' + yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.networkArray = res.responseData;
          this.networkArray.length == 1 ? (this.filterFrm.controls['networkId'].setValue(this.networkArray[0].networkId),this.getAllTankCalibration()) : '';
        } else {
          this.networkArray = [];
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : '';
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }


  getAllTank() {
    this.apiService.setHttp('get', 'api/MasterDropdown/GetAllTank', false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.tankArray = res.responseData;
          this.editFlag ? this.tankForm.controls['tankId'].setValue(this.updatedObj.tankId) : '';
        } else {
          this.tankArray = [];
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

  getAllTankCalibration() {
    this.spinner.show();
    let filterValue = this.filterFrm.value;
    console.log('filter',filterValue);
    let str = 'UserId=' + this.localstorageData.userId + '&pageno=' + this.pageNumber + '&pagesize=' + this.pagesize + '&YojanaId=' + (filterValue.yojanaId ? filterValue.yojanaId : 0 || this.localstorageData.yojanaId) + '&NetworkId=' + (filterValue.networkId ? filterValue.networkId : 0 || this.localstorageData.networkId);
    this.apiService.setHttp('get', 'TankInfo/GetAllTankCalibration?' + str, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.spinner.hide();
          this.tankCalibrationArray = res.responseData.responseData1;
          this.totalRows = res.responseData.responseData2?.totalCount;
          this.highlitedRow = 0;
        } else {
          this.spinner.hide();
          this.tankCalibrationArray = [];
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : '';
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  filterData() {
    this.pageNumber = 1;
    this.getAllTankCalibration();
   
  }

  onClickPagintion(pagNo: number) {
    this.pageNumber = pagNo;
    this.getAllTankCalibration();
  }

  clearfilter(flag: any) {
    if (flag == 'yojana') {
      // this.filterFrm.controls['yojanaId'].setValue(''); 
      this.filterFrm.controls['networkId'].setValue('');           
    } 
    // else if (flag == 'network') {
    //   this.filterFrm.controls['yojanaId'].setValue(this.filterFrm.value.yojanaId); 
    //   this.filterFrm.controls['networkId'].setValue('');        
    // }  
    
  }

  onSubmit() {
    this.submitted = true;
    if (this.tankForm.invalid) {
      return;
    } else {
      let formdata = this.tankForm.value;
      let obj = {
        "tankId": formdata.tankId,
        "tankName": '',
        "tankHeightInCM": 0,
        "tankCapcityInLiter": 0,
        "tankMinLevel": formdata.tankMinLevel,
        "tankMaxLevel": formdata.tankMaxLevel,
        "tankMinQty": formdata.tankMinQty,
        "tankMaxQty": formdata.tankMaxQty,
        "createdBy": 0
      }

      this.apiService.setHttp('PUT', 'TankInfo/UpdateTankCalibration', false, obj, false, 'valvemgt');
      this.apiService.getHttp().subscribe(
        (res: any) => {
          if (res.statusCode == '200') {
            this.spinner.hide();
            this.toastrService.success(res.statusMessage);
            this.getAllTankCalibration();
            this.AddValveModal.nativeElement.click();
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

  updateTankCal(obj: any) {
    this.editFlag = true;
    this.updatedObj = obj;
    this.highlitedRow = obj.tankId;
    this.btnText = 'Update';
    this.tankForm.patchValue({
      tankMinLevel: this.updatedObj.tankMinLevel,
      tankMaxLevel: this.updatedObj.tankMaxLevel,
      tankMinQty: this.updatedObj.tankMinQty,
      tankMaxQty: this.updatedObj.tankMaxQty,
    })
    this.getAllTank();
  }

  clearForm() {
    this.submitted = false;
    this.editFlag = false;
    this.defaultForm();
  }

}
