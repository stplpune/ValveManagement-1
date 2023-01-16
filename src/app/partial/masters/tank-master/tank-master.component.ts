import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
@Component({
  selector: 'app-tank-master',
  templateUrl: './tank-master.component.html',
  styleUrls: ['./tank-master.component.css']
})
export class TankMasterComponent implements OnInit {
  tankForm!: FormGroup;
  yojanaArray = new Array();
  networkArray = new Array();
  getData = this.local.getLoggedInLocalstorageData();
  editFlag: boolean = false;
  responseArray = new Array();
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  deleteId!: number;
  delData: any;
  @ViewChild('closebutton') closebutton:any;

  constructor
    (
      private fb: FormBuilder,
      private service: ApiService,
      private local: LocalstorageService,
      private toastrService: ToastrService,
      private error: ErrorsService
    ) { }

  ngOnInit(): void {
    console.log(this.getData);
    this.geFormData();
    this.getTableData();
    this.getYojana();
  }

  geFormData() {
    this.tankForm = this.fb.group({
      "id": [0],
      "tankName": ['', [Validators.required]],
      "address": ['', Validators.required],
      "yojanaId": [0, Validators.required],
      "networkId": [0, Validators.required],
    })
  }
  get f() {
    return this.tankForm.controls;
  }

  getTableData() {
    let formData = this.tankForm.value;
    this.service.setHttp('get', 'DeviceInfo/GetAllTankInformation?UserId=' + this.getData.userId + '&pageno=' + this.pageNumber + '&pagesize=' + this.pagesize + '&YojanaId=' + formData.yojanaId + '&NetworkId=' + formData.networkId, false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200') {
          this.responseArray = res.responseData.responseData1;
          this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;

        } else {
          this.responseArray = [];
        }
      }), error: (error: any) => {
        this.error.handelError(error.status);
      }
    })
    console.log(this.responseArray)
  }

  getYojana() {
    let formData = this.tankForm.value;
    this.service.setHttp('get', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getData.yojanaId, false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200') {
          this.yojanaArray = res.responseData;
          this.editFlag ? (this.tankForm.controls['yojanaId'].setValue(this.getData.yojanaId), this.getNetwork()) : '';
        } else {
          this.yojanaArray = [];
        }
      }), error: (error: any) => {
        this.error.handelError(error.status);
      }
    })
  }

  getNetwork() {
    let formData = this.tankForm.value;
    console.log(formData.yojanaId);
    if (formData.yojanaId) {
      this.service.setHttp('get', 'api/MasterDropdown/GetAllNetwork?YojanaId=' + formData.yojanaId, false, false, false, 'valvemgt');
      this.service.getHttp().subscribe({
        next: ((res: any) => {
          if (res.statusCode == '200') {
            this.networkArray = res.responseData;
          } else {
            this.networkArray = [];
          }
        }), error: (error: any) => {
          this.error.handelError(error.status);
        }
      })
    }
  }

  onSubmit() {
    let formData = this.tankForm.value;
    if (this.tankForm.invalid) {
      return;
    } else {
      let obj = {
        "id": 0,
        "tankName": formData.tankName,
        "latitude": "string",
        "longitude": "string",
        "address": formData.address,
        "isDeleted": false,
        "createdBy": this.local.userId(),
        "modifiedBy": this.local.userId(),
        "yojanaId": formData.yojanaId,
        "networkId": formData.networkId,
      }
      console.log(obj)
      this.service.setHttp(!this.editFlag ? 'post' : 'put', 'DeviceInfo/' + (!this.editFlag ? 'AddTankDetails' : 'UpdateTankDetails'), false, obj, false, 'valvemgt');
      this.service.getHttp().subscribe({
        next: ((res: any) => {
          if (res.statusCode == '200') {
            this.toastrService.success(res.statusMessage);
            this.getTableData();
            this.clearForm();
          }
        }), error: (error: any) => {
          this.error.handelError(error.status);
        }
      })
    }
  }

  onEditData(res?: any) {
    console.log('res', res)
    this.editFlag = true;
    this.tankForm.patchValue({
      id: res.id,
      tankName: res.tankName,
      address: res.address,
      yojanaId: res.yojanaId,
      networkId: res.networkId,
    })
  }

  getPagenation(pageNo: number) {
    this.pageNumber = pageNo;
    this.getTableData();
  }

  clearForm(formDirective?: any) {
    formDirective?.resetForm();
    this.editFlag = false;
     this.geFormData();
  }

  getDeleteConfirm(getData?: any) {
    console.log(getData);
    this.delData = {
      "id": getData.id,
      "tankName": getData.tankName,
      "address": getData.address,
      "isDeleted": true,
      "createdBy": this.local.userId(),
      "modifiedBy": this.local.userId(),
      "yojanaId": getData.yojanaId,
      "networkId": getData.networkId,
    }
  }

  deleteData() {
    this.service.setHttp('delete', 'DeviceInfo/DeleteTankDetails', false, this.delData, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.toastrService.success(res.statusMessage);
          this.getTableData();
        }
      }, error: (error: any) => {
        this.error.handelError(error.status);
      }
    })
  }





}
