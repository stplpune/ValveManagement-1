import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ValidationService } from 'src/app/core/services/validation.service';
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
  filterFrm!: FormGroup;
  @ViewChild('closebutton') closebutton: any;

  constructor
    (
      private fb: FormBuilder,
      private service: ApiService,
      private local: LocalstorageService,
      private toastrService: ToastrService,
      private error: ErrorsService,
      private spinner: NgxSpinnerService,
      public validation:ValidationService
    ) { }

  ngOnInit(): void {
    this.geFormData();
    this.getFilterFormData();
    this.getTableData();
    this.getYojana();
  }

  geFormData() {
    this.tankForm = this.fb.group({
      "id": [0],
      "tankName": ['', [Validators.required]],
      "address": ['', [Validators.required, Validators.maxLength(500)]],
      "yojanaId": [this.getData.yojanaId, [Validators.required]],
      "networkId": [0, Validators.required],
    })
  }

  get f() {
    return this.tankForm.controls;
  }

  clearFormData(flag?: any) {
    if (flag == 'formYojana') {
      this.tankForm.controls['yojanaId'].setValue(0);
      this.tankForm.controls['networkId'].setValue(0);
    } else if (flag == 'networkId') {
      this.tankForm.controls['yojanaId'].setValue(this.tankForm.value.yojanaId);
      this.tankForm.controls['networkId'].setValue(0);
    }
  }

  getFilterFormData() {
    this.filterFrm = this.fb.group({
      yojanaId: [0],
      networkId: [0]
    })
  }

  clearfilter(flag: any) {
    // flag=='yojana' ? (this.filterFrm.controls['yojanaId'].setValue(0),this.filterFrm.controls['networkId'].setValue(0),this.getTableData())
    //                :(this.tankForm.controls['networkId'].setValue(0));

    // flag=='network'? (this.filterFrm.controls['yojanaId'].setValue(0),this.filterFrm.controls['networkId'].setValue(0),this.getTableData())
    //                :(this.tankForm.controls['networkId'].setValue(0));     

    if (flag == 'yojana') {
      this.filterFrm.controls['yojanaId'].setValue(0);
      this.filterFrm.controls['networkId'].setValue(0);
      this.getTableData();
    } else if (flag == 'network') {
      this.filterFrm.controls['yojanaId'].setValue(this.filterFrm.value.yojanaId);
      this.filterFrm.controls['networkId'].setValue(0);
      this.getTableData();
    }

  }

  getTableData() {
    this.spinner.show();
    let formData = this.filterFrm.value;
    this.service.setHttp('get', 'DeviceInfo/GetAllTankInformation?UserId=' + this.getData.userId + '&pageno=' + this.pageNumber + '&pagesize=' + this.pagesize + '&YojanaId=' + this.getData.yojanaId + '&NetworkId=' + formData.networkId, false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200') {
          this.spinner.hide();
          this.responseArray = res.responseData.responseData1;
          this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;
        } else {
          this.spinner.hide();
          this.responseArray = [];
        }
      }), error: (error: any) => {
        this.error.handelError(error.status);
      }
    })
  }

  getYojana() {
    let formData = this.tankForm.value.yojanaId;
    this.service.setHttp('get', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getData.yojanaId, false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200') {
          this.yojanaArray = res.responseData;
          this.editFlag ? (this.tankForm.controls['yojanaId'].setValue(formData), this.getNetwork()) : '';
        } else {
          this.yojanaArray = [];
        }
      }), error: (error: any) => {
        this.error.handelError(error.status);
      }
    })
  }

  getNetwork(status?: any) {
    let netId: any;
    netId = status == 'net' ? this.filterFrm.value.yojanaId : this.tankForm.value.yojanaId
   if(netId){
    this.service.setHttp('get', 'api/MasterDropdown/GetAllNetwork?YojanaId=' + netId, false, false, false, 'valvemgt');
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
        ...formData,
        "isDeleted": false,
        "createdBy": this.local.userId(),
        "modifiedBy": this.local.userId(),
      }
      this.service.setHttp(!this.editFlag ? 'post' : 'put', 'DeviceInfo/' + (!this.editFlag ? 'AddTankDetails' : 'UpdateTankDetails'), false, obj, false, 'valvemgt');
      this.service.getHttp().subscribe({
        next: ((res: any) => {
          if (res.statusCode == '200') {
            this.closebutton.nativeElement.click();
            this.toastrService.success(res.statusMessage);
            this.clearForm();
            this.getTableData();
          }
        }), error: (error: any) => {
          this.error.handelError(error.status);
        }
      })
    }
  }

  onEditData(res?: any) {
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
    this.tankForm.controls['yojanaId'].setValue(0);this.tankForm.controls['networkId'].setValue(0)
    // this.editFlag ? (this.filterFrm.controls['yojanaId'].setValue(0),this.filterFrm.controls['networkId'].setValue(0)):'';
  }

  getDeleteConfirm(getData?: any) {
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
