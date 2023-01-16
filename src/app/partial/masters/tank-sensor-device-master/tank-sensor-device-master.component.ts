import { Component, OnInit } from '@angular/core';
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
  tankSensorDeviceFrm!:FormGroup;
  getAllSimArray = new Array();
  getAllTankArray = new Array();
  getAllYojanaArray = new Array();
  getAllNetworkArray = new Array();
  allSensorDeviceArray = new Array();
  getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
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
    this.getAllTank();
    this.getAllYojana();
    this.getAllNetwork();
    this.getAllSensorDeviceTableData();
  }

  controlForm(){
    this.tankSensorDeviceFrm = this.fb.group({
      id:[0],
      deviceId: [''],
      deviceName: [''],
      simId: +[''],
      deviceDescription: [''],
      tankId: +[''],
      yojanaId: +[''],
      networkId: +['']
    })
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
  this.apiService.setHttp('GET', 'DeviceInfo/GetAllDeviceInformation?UserId='+ this.localStorage.userId() + '&pageno=1&pagesize=10&YojanaId='+ Number(this.editFlag ? yojanaIds : '0') +'&NetworkId='+ Number(this.editFlag ? networkIds : '0') +'&TankId=' + Number(this.editFlag ? tankIds : '0') , false, false, false, 'valvemgt');
  this.apiService.getHttp().subscribe({
    next: (res: any) => {
      // this.spinner.hide();
      if (res.statusCode == "200") {
        this.allSensorDeviceArray = res.responseData.responseData1;
        // this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;
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
  console.log('submit');
  
  let formData = this.tankSensorDeviceFrm.value;
  let obj = {
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
  let urlType
  // this.editFlag ? (urlType = 'PUT') : (urlType = 'POST');
  let urlName 
  // this.editFlag ? (urlName = 'ValveManagement/Network/UpdateNetwork') : (urlName = 'ValveManagement/Network/AddNetwork');
  this.apiService.setHttp('POST','DeviceInfo/AddDeviceDetails',false,obj,false,'valvemgt');
  this.apiService.getHttp().subscribe(
    (res: any) => {
      if (res.statusCode == '200') {
        this.spinner.hide();
        this.toastrService.success(res.statusMessage);
        this.getAllSensorDeviceTableData();
        // this.closebutton.nativeElement.click();
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

onEdit(data?:any){
  this.editFlag = true;
  console.log(data,'editData');
  
  this.tankSensorDeviceFrm.patchValue({
    id: data.id,
  deviceId: data.deviceId,
  deviceName: data.deviceName,
  deviceDescription: data.deviceDescription,
  simId: data.simId,
  tankId: data.tankId,
  tankName: data.tankName,
  isDeleted: true,
  createdBy: data.createdBy,
  modifiedBy: data.modifiedBy,
  yojanaId: data.yojanaId,
  networkId: data.networkId
  })
}


  clearDropdown(flag:any){
    // this.editFlag = false;
  //  switch(flag){
  //    case 'simNo': this.networkRegForm.controls['yojanaId'].setValue('');
  //                      break;
  //  }
 }
}
