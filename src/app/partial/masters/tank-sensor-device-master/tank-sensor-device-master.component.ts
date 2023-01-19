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
  selector: 'app-tank-sensor-device-master',
  templateUrl: './tank-sensor-device-master.component.html',
  styleUrls: ['./tank-sensor-device-master.component.css']
})
export class TankSensorDeviceMasterComponent implements OnInit {

  editFlag:boolean = false;
  deleteSegmentId!:any;
  postObj!:any;
  formData!:any;
  deleteObj!:any;
  tankSensorDeviceFrm!:FormGroup | any;
  searchForm!:FormGroup | any;
  getAllSimArray = new Array();
  getAllTankArray = new Array();
  getAllFilterTankArray = new Array();
  getAllYojanaArray = new Array();
  getAllNetworkArray = new Array();
  getAllFilterNetworkArray = new Array();
  allSensorDeviceArray = new Array();
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  submitted = false;
  highlitedRow:any;
  buttonName:string = 'Submit';
  getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
  @ViewChild('closebutton') closebutton:any;
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
    this.searchFormControl();
    // this.getAllSim();
    this.getAllYojana();
    // this.getAllTank();
    // this.getAllNetwork();
    this.getAllSensorDeviceTableData();
  }

  //Get Form Control Values
  get f() {
    return this.tankSensorDeviceFrm.controls;
  }

  controlForm(){
    this.tankSensorDeviceFrm = this.fb.group({
      id:[0],
      deviceId: ['',Validators.required],
      deviceName: ['',Validators.required],
      simId: ['',Validators.required],
      deviceDescription: ['',Validators.required],
      tankId: ['',Validators.required],
      yojanaId: ['',Validators.required],
      networkId: ['',Validators.required]
    })
  }

  searchFormControl(){
    this.searchForm=this.fb.group({
      yojana:[''],
      network:[''],
      tank:['']
    })
  }

  onEdit(data?:any){
  this.editFlag = true;
  this.buttonName = 'Update';
  this.highlitedRow = data.id;
  this.tankSensorDeviceFrm.patchValue({
      id: data.id,
      deviceId: data.deviceId,
      deviceName: data.deviceName,
      deviceDescription: data.deviceDescription,
      simId: data.simId,
      tankId: data.tankId,
      tankName: data.tankName,
      isDeleted: data.isDeleted,
      createdBy: data.createdBy,
      modifiedBy: data.modifiedBy,
      yojanaId: data.yojanaId,
      networkId: data.networkId
  })
  console.log(data,'editData');
}

getAllYojana() {
  this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getAllLocalStorageData.yojanaId, false, false, false, 'valvemgt');
  this.apiService.getHttp().subscribe({
    next: (res: any) => {
      if (res.statusCode == '200') {
        this.getAllYojanaArray = res.responseData;
      }
    },  error: (error: any) => {
      this.errorSerivce.handelError(error.status);
    },
  })
}
  
getAllNetwork(flag?:any) {
  let networkFlag = flag;
  console.log(networkFlag);
  
  // http://valvemgt.erpguru.in/api/MasterDropdown/GetAllNetworkbyUserId?UserId=1&YojanaId=1
  this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllNetworkbyUserId?UserId='+ this.getAllLocalStorageData.userId
  +'&YojanaId=' + (networkFlag?this.tankSensorDeviceFrm.value.yojanaId:this.searchForm.value.yojana) , false, false, false, 'valvemgt');
  this.apiService.getHttp().subscribe({
    next: (res: any) => {
      if (res.statusCode == '200') {
        networkFlag ? (this.getAllNetworkArray = res.responseData) : (this.getAllFilterNetworkArray = res.responseData)
      }
    },  error: (error: any) => {
      this.errorSerivce.handelError(error.status);
    },
  })
}

  getAllSim() {
    this.apiService.setHttp('GET', 'SimMaster/GetSimListDropdownList?YojanaId=' + this.getAllLocalStorageData.yojanaId , false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.getAllSimArray = res.responseData;
        }
      }, error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    })
  }

  getAllTank(flag?:any){
    let tankFlag = flag;
    console.log(tankFlag,'tankFlag');
    
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllTank?YojanaId='+ (tankFlag?this.tankSensorDeviceFrm.value.yojanaId:this.searchForm.value.yojana) +'&NetworkId=' + 
    (tankFlag?this.tankSensorDeviceFrm.value.networkId:this.searchForm.value.network), false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          tankFlag ? (this.getAllTankArray = res.responseData) : (this.getAllFilterTankArray = res.responseData)
        }
      }, error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    })
  }



clearForm(formDirective?:any){
  formDirective?.resetForm();
  this.editFlag = false;
  this.submitted = false;
  this.buttonName = 'Submit';
  this.controlForm();
}

getAllSensorDeviceTableData() {
  let yojanaIds = this.tankSensorDeviceFrm.value.yojanaId;
  let networkIds = this.tankSensorDeviceFrm.value.networkId;
  let tankIds = this.tankSensorDeviceFrm.value.tankId;
  console.log(networkIds,'re');
  // this.spinner.show();
  this.apiService.setHttp('GET', 'DeviceInfo/GetAllDeviceInformation?UserId='+ this.getAllLocalStorageData.userId +'&pageno='+ 
  this.pageNumber+'&pagesize='+ this.pagesize +'&YojanaId='+ (this.searchForm.value.yojana ? this.searchForm.value.yojana : 0) +
  '&NetworkId='+ (this.searchForm.value.network ? this.searchForm.value.network : 0) +'&TankId=' + (this.searchForm.value.tank ? this.searchForm.value.tank : 0), false, false, false, 'valvemgt');
  this.apiService.getHttp().subscribe({
    next: (res: any) => {
      // this.spinner.hide();
      if (res.statusCode == "200") {
        this.allSensorDeviceArray = res.responseData.responseData1;
        this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;
        this.highlitedRow=0;
      } else {
        this.spinner.hide();
        this.allSensorDeviceArray = [];
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
  if(this.tankSensorDeviceFrm.invalid){
    return
  }else{
    let formData = this.tankSensorDeviceFrm.value;
    this.postObj = {
      ...formData,
      "createdBy": this.localStorage.userId(),
      "tankName": "string",
      "isDeleted": false,
      "modifiedBy": this.localStorage.userId(),
    }
    this.spinner.show();
    let id:any;
    let urlType:any;
    urlType = (this.editFlag ? (urlType = 'PUT') : (urlType = 'POST'));
    let urlName:any;
    urlName = this.editFlag ? (urlName = 'DeviceInfo/UpdateDeviceDetails') : (urlName = 'DeviceInfo/AddDeviceDetails');
    this.apiService.setHttp(urlType,urlName,false,this.postObj,false,'valvemgt');
    this.apiService.getHttp().subscribe(
      (res: any) => {
        if (res.statusCode == '200') {
          this.spinner.hide();
          this.toastrService.success(res.statusMessage);
          this.getAllSensorDeviceTableData();
          this.clearForm();
          this.buttonName = 'Submit'
          this.closebutton.nativeElement.click();
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

onClickPagintion(pageNo: number) {
  this.pageNumber = pageNo;
  this.getAllSensorDeviceTableData();
}

deleteConformation(data?:any){
  this.deleteObj = data;
  this.highlitedRow = data.id;
}

deleteNetworkMaster(){
  this.deleteObj.isDeleted = true;
  this.apiService.setHttp('DELETE', 'DeviceInfo/DeleteDeviceDetails', false, this.deleteObj, false, 'valvemgt');
  this.apiService.getHttp().subscribe({
    next: (res: any) => {
      if (res.statusCode === '200') {
        this.toastrService.success(res.statusMessage);
        this.getAllSensorDeviceTableData();
      } else {
        this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : this.toastrService.error(res.statusMessage);
      }
    },
    error: (error: any) => {
      this.errorSerivce.handelError(error.status);
    },
  });
}

 clearSerach(flag: any) {
  this.pageNumber = 1;
  this.getAllSensorDeviceTableData();
  this.clearForm();
}
}
