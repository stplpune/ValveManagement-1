import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';


@Component({
  selector: 'app-yojana-master',
  templateUrl: './yojana-master.component.html',
  styleUrls: ['./yojana-master.component.css']
})
export class YojanaMasterComponent implements OnInit {
  yojanaForm!: FormGroup | any;
  pageNumber: number = 1;
  pageSize: number = 10;
  listCount!: number;
  yojanaListArray = new Array();
  submitted = false;
  districtListArray = new Array();
  talukaListArray = new Array();
  villageListArray = new Array();
  editFlag: boolean = false;
  updatedObj: any;
  yojanaId: any;
  data: any;
  btnText: any;
  onSelFlag:boolean = true;

  @ViewChild('yojanaModal') yojanaModal: any;
  constructor(
    private fb: FormBuilder,
    private localStorage: LocalstorageService,
    private spinner: NgxSpinnerService,
    public apiService: ApiService,
    private errorSerivce: ErrorsService,
    private toastrService: ToastrService,
    public commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.defaultForm();
    this.getAllDistrict();
    this.getAllYojanaList();
  }

  defaultForm() {
    this.yojanaForm = this.fb.group({
      yojanaName: ['', [Validators.required]],
      districtId: ['', [Validators.required]],
      talukaId: ['', [Validators.required]],
      villageId: ['', [Validators.required]]
    });
  }

  get f() {
    return this.yojanaForm.controls;
  }

  getAllDistrict() {
    this.apiService.setHttp('get','api/MasterDropdown/GetAllDistrict', false, false, false,'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.districtListArray = res.responseData;
          if (this.editFlag && this.onSelFlag) {
            this.yojanaForm.controls['districtId'].setValue(this.updatedObj.districtId);
            this.getTaluka(this.updatedObj.districtId);
          }
        } else {
          this.districtListArray = [];
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

  getTaluka(districtId: number) {
    debugger;
    this.apiService.setHttp('get','api/MasterDropdown/GetAllTaluka?DistrictId=' + districtId, false,false,false,'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.talukaListArray = res.responseData;
          if (this.editFlag && this.onSelFlag) {
            this.yojanaForm.controls['talukaId'].setValue(this.updatedObj.talukaId);
            this.getVillage(this.updatedObj.talukaId);
          }
        } else {
          this.talukaListArray = [];
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

  getVillage(talukaId: number) {
    this.apiService.setHttp('get','api/MasterDropdown/GetAllVillage?DistrictId=0&TalukaId=' + talukaId, false,false,false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.villageListArray = res.responseData;
          if (this.editFlag && this.onSelFlag) {
            this.yojanaForm.controls['villageId'].setValue(this.updatedObj.villageId);
          }
        } else {
          this.villageListArray = [];
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

  clearDropdown(flag: any) {
    debugger;
    switch (flag) {
      case 'district':
        this.yojanaForm.controls['talukaId'].setValue('');
        this.yojanaForm.controls['villageId'].setValue('');
        break;
      case 'taluka':
        this.yojanaForm.controls['villageId'].setValue('');
        break;
    }
  }


  getAllYojanaList() {
    this.spinner.show();
    let obj = 'pageno=' + this.pageNumber + '&pagesize=' + this.pageSize;
    this.apiService.setHttp('get','ValveManagement/Yojana-Master/GetAllYojana?' + obj, false,false,false,'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.spinner.hide();
          this.yojanaListArray = res.responseData.responseData1;
          this.listCount = res.responseData.responseData2?.totalCount;
          //console.log(this.userListArray);
        } else {
          this.spinner.hide();
          this.yojanaListArray = [];
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
    this.getAllYojanaList();
  }

  onSubmit() {
    this.submitted = true;
    if (this.yojanaForm.invalid) {
      return;
    } else {
      let formData = this.yojanaForm.value;
      let urlType = this.editFlag ? 'PUT' : 'POST'
      let url = this.editFlag ? 'ValveManagement/Yojana-Master/UpdateYojana' : 'ValveManagement/Yojana-Master/AddYojana'
      let obj = {
        "id": this.editFlag ? this.updatedObj.id : 0,
        "yojanaName": formData.yojanaName,
        "districtId": formData.districtId,
        "talukaId": formData.talukaId,
        "villageId": formData.villageId,
        "isDeleted": false,
        "createdBy": this.localStorage.userId(),
        "createdDate": new Date(),
        "modifiedBy": this.localStorage.userId(),
        "modifiedDate": new Date(),
        "timestamp": new Date()
      }

      this.apiService.setHttp(urlType,url,false,obj, false,'valvemgt');
      this.apiService.getHttp().subscribe(
        (res: any) => {
          if (res.statusCode == '200') {
            this.onSelFlag = true;
            this.spinner.hide();
            this.toastrService.success(res.statusMessage);
            this.yojanaModal.nativeElement.click();
            this.getAllYojanaList();
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

  updateYojana(yojana: any) {
    this.editFlag = true;
    this.updatedObj = yojana
    this.yojanaForm.patchValue({
      yojanaName: this.updatedObj.yojanaName,
    })
    this.getAllDistrict();
  }

  deleteConformation(ele: number) {
    this.data = ele;
  }

  deleteYojana() {
    let obj = {
      "id": this.data.id,
      "yojanaName": '',
      "districtId": 0,
      "talukaId": 0,
      "villageId": 0,
      "isDeleted": true,
      "createdBy": this.localStorage.userId(),
      "createdDate": new Date(),
      "modifiedBy": this.localStorage.userId(),
      "modifiedDate": new Date(),
      "timestamp": new Date()
    }

    this.apiService.setHttp('DELETE','ValveManagement/Yojana-Master/DeleteYojana',false,obj,false,'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.toastrService.success(res.statusMessage);
          this.getAllYojanaList();
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

  refreshData() {
    this.getAllYojanaList();
  }

  clearForm() {
    this.submitted = false;
    this.editFlag = false;
    this.defaultForm();
  }
}