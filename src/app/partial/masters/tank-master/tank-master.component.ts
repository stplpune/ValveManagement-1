import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';

@Component({
  selector: 'app-tank-master',
  templateUrl: './tank-master.component.html',
  styleUrls: ['./tank-master.component.css']
})
export class TankMasterComponent implements OnInit {
  tankForm!: FormGroup;
  yojanaArray = new Array();
  networkArray = new Array();
  getYojanaId = this.local.getLoggedInLocalstorageData();
  editFlag:boolean=false;
  responseArray=new Array();
   
    constructor(private fb: FormBuilder, private service: ApiService, private local: LocalstorageService, private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.geFormData();
    this.getTableData();
    this.getYojana();
  }

  geFormData() {
    this.tankForm = this.fb.group({
      tankName: [''],
      address: [''],
      yojanaId: [0],
      networkId: [0],
    })
  }
  // DeviceInfo/GetAllTankInformation?UserId=1&pageno=1&pagesize=10&YojanaId=1&NetworkId=1
  getTableData(){
    debugger
    this.service.setHttp('get', 'DeviceInfo/GetAllTankInformation?UserId=1&YojanaId=1&NetworkId=1', false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        console.log(res)
        if (res.statusCode == '200') {
          this.responseArray = res.responseData.responseData1;
          // this.editFlag || this.levelId != 1 ? (this.registerForm.controls['districtId'].setValue(formData), this.getTaluka()) : this.getTaluka();
        } else {
          this.responseArray = [];
          // this.common.checkEmptyData(res.statusMessage) == false ? this.error.handelError(res.statusCode) : this.common.snackBar(res.statusMessage, 1);
        }
      }), error: (error: any) => {
        // this.error.handelError(error.status);
      }
    })
  }
  getYojana() {
    this.service.setHttp('get', 'api/MasterDropdown/GetAllYojana?YojanaId='+this.getYojanaId.yojanaId, false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200') {
          this.yojanaArray = res.responseData;
          // this.editFlag || this.levelId != 1 ? (this.registerForm.controls['districtId'].setValue(formData), this.getTaluka()) : this.getTaluka();
        } else {
          this.yojanaArray = [];
          // this.common.checkEmptyData(res.statusMessage) == false ? this.error.handelError(res.statusCode) : this.common.snackBar(res.statusMessage, 1);
        }
      })
    })
  }

  getNetwork() {
    let formData = this.tankForm.value;
    this.service.setHttp('get', 'api/MasterDropdown/GetAllNetwork?YojanaId=' + formData.yojanaId, false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200') {
          this.networkArray = res.responseData;
          // this.editFlag || this.levelId != 1 ? (this.registerForm.controls['districtId'].setValue(formData), this.getTaluka()) : this.getTaluka();
        } else {
          this.networkArray = [];
          // this.common.checkEmptyData(res.statusMessage) == false ? this.error.handelError(res.statusCode) : this.common.snackBar(res.statusMessage, 1);
        }
      })
    })
  }


  //DeviceInfo/AddTankDetails     post
  //DeviceInfo/UpdateTankDetails   update
  onSubmit() {
    debugger
    let formData = this.tankForm.value;
    if (this.tankForm.invalid) {
      return;
    } else {
      let obj={
        ...formData,
        id: 0,
        isDeleted: true,
        createdBy:this.local.userId(),
        modifiedBy: this.local.userId(),
        createdDate:new Date(),
        modifiedDate:new Date(),
        timeStamp:new Date()
      }
      console.log(obj)
      this.service.setHttp(!this.editFlag ?'get' : 'put','DeviceInfo'+(!this.editFlag ? 'AddTankDetails' :'UpdateTankDetails'), false, obj, false, 'valvemgt');
      this.service.getHttp().subscribe({
        next: ((res: any) => {
          console.log(this.editFlag)
          if (res.statusCode == '200') {
            this.toastrService.success(res.statusMessage);
            this.getTableData();
          }
        })
      })
    }

  }

  clearForm() {
    this.editFlag=false;
    this.tankForm.reset();
    this.yojanaArray=[];
    this.networkArray=[];
  }



}
