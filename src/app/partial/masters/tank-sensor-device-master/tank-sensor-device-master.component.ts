import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';

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
  tankSensorDeviceFrm!:FormGroup;
  getAllSimArray = new Array();
  getAllTankArray = new Array();
  getAllYojanaArray = new Array();
  getAllNetworkArray = new Array();
  allSensorDeviceArray = new Array();
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
  @ViewChild('closebutton') closebutton:any;
  constructor(private apiService: ApiService,
    private fb: FormBuilder,
    private localStorage: LocalstorageService,
    public commonService: CommonService,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    private errorSerivce: ErrorsService) { }

  ngOnInit(): void {
    this.controlForm();
    this.getAllSim();
    this.getAllYojana();
    this.getAllTank();
    this.getAllNetwork();
    this.getAllSensorDeviceTableData();
  }

  controlForm(){
    this.tankSensorDeviceFrm = this.fb.group({
      id:[0],
      deviceId: [''],
      deviceName: [''],
      simId: [0],
      deviceDescription: [''],
      tankId: [0],
      yojanaId: [0],
      networkId: [0]
    })
  }

  onEdit(data?:any){
  this.editFlag = true;
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

  getAllSim() {
    this.apiService.setHttp('GET', 'SimMaster/GetSimListDropdownList', false, false, false, 'valvemgt');
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

  getAllTank(){
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllTank', false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.getAllTankArray = res.responseData;
        }
      }, error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    })
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
getAllNetwork() {
  this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllNetwork?YojanaId=1', false, false, false, 'valvemgt');
  this.apiService.getHttp().subscribe({
    next: (res: any) => {
      if (res.statusCode == '200') {
        this.getAllNetworkArray = res.responseData;
      }
    },  error: (error: any) => {
      this.errorSerivce.handelError(error.status);
    },
  })
}

clearForm(formDirective?:any){
  formDirective?.resetForm();
  this.editFlag = false;
  this.controlForm();
}

getAllSensorDeviceTableData() {
  let yojanaIds = this.tankSensorDeviceFrm.value.yojanaId;
  let networkIds = this.tankSensorDeviceFrm.value.networkId;
  let tankIds = this.tankSensorDeviceFrm.value.tankId;
  console.log(networkIds,'re');
  // this.spinner.show();
  this.apiService.setHttp('GET', 'DeviceInfo/GetAllDeviceInformation?UserId=1&pageno=1&pagesize=10&YojanaId=0&NetworkId=0&TankId=0', false, false, false, 'valvemgt');
  this.apiService.getHttp().subscribe({
    next: (res: any) => {
      // this.spinner.hide();
      if (res.statusCode == "200") {
        this.allSensorDeviceArray = res.responseData.responseData1;
        this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;
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
  let formData = this.tankSensorDeviceFrm.value;
  this.postObj = {
    ...formData,
    "createdBy": this.localStorage.userId(),
    // "createdDate": new Date(),
    // "modifiedby": this.localStorage.userId(),
    // "modifiedDate": new Date(),
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

onClickPagintion(pageNo: number) {
  this.pageNumber = pageNo;
  this.getAllSensorDeviceTableData();
}

deleteConformation(id?:any){
  this.deleteSegmentId = id;
  console.log(this.deleteSegmentId);
  
}

deleteNetworkMaster(){
  let formData = this.tankSensorDeviceFrm.value;
  let deleteObj = {
    ...formData,
    "id": this.deleteSegmentId,
    "createdBy": this.localStorage.userId(),
    // "createdDate": new Date(),
    // "modifiedby": this.localStorage.userId(),
    // "modifiedDate": new Date(),
    "tankName": "string",
    "isDeleted": true,
    "modifiedBy": this.localStorage.userId(),
  }
  console.log(deleteObj,'de');
  
  this.apiService.setHttp('DELETE', 'DeviceInfo/DeleteDeviceDetails', false, deleteObj, false, 'valvemgt');
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

  clearDropdown(flag:any){
    // this.editFlag = false;
  //  switch(flag){
  //    case 'simNo': this.networkRegForm.controls['yojanaId'].setValue('');
  //                      break;
  //  }
 }
}
