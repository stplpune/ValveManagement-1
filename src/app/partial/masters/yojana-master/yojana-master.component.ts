import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { ValidationService } from 'src/app/core/services/validation.service';


@Component({
  selector: 'app-yojana-master',
  templateUrl: './yojana-master.component.html',
  styleUrls: ['./yojana-master.component.css']
})
export class YojanaMasterComponent implements OnInit {
  yojanaForm!: FormGroup | any;
  filterForm!:FormGroup | any;
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows!: number;
  yojanaListArray = new Array();
  submitted = false;
  districtListArray = new Array();
  districtFilterArray = new Array();
  talukaListArray = new Array();
  talukaFilterArray =new Array();
  villageListArray = new Array();
  villageFilterArray = new Array();
  editFlag: boolean = false;
  updatedObj: any;
  data: any;
  onSelFlag:boolean = true;
  highlitedRow:any;
  btnText = 'Submit';
  talukaFlag!:string;
  villageFlag!:string


  @ViewChild('yojanaModal',) yojanaModal: any;
  @ViewChild('yojanafrm') yoj!: NgForm;
  constructor(
    private fb: FormBuilder,
    private localStorage: LocalstorageService,
    private spinner: NgxSpinnerService,
    public apiService: ApiService,
    private errorSerivce: ErrorsService,
    private toastrService: ToastrService,
    public commonService: CommonService,
    public validation:ValidationService
  ) { }

  ngOnInit(): void {
    this.defaultForm();
    this.getFilterFrm();
    this.getAllDistrict();
    this.getAllYojanaList();
  }

  defaultForm() {
    this.yojanaForm = this.fb.group({
      yojanaName: ['', [Validators.required,Validators.pattern('^[^[ ]+|[ ][gm]+$')]],
      districtId: ['', [Validators.required]],
      talukaId: ['', [Validators.required]],
      villageId: ['', [Validators.required]]
    });
  }

   getFilterFrm(){
    this.filterForm = this.fb.group({
      districtId: [0],
      talukaId: [0],
      villageId: [0]
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
          this.districtFilterArray =res.responseData;
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

  getTaluka(flag?:any) {
    let districtId = flag =='tal' ?  this.filterForm.value.districtId : this.yojanaForm.value.districtId;
    this.apiService.setHttp('get','api/MasterDropdown/GetAllTaluka?DistrictId=' + districtId, false,false,false,'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
           flag == 'tal' ? this.talukaFilterArray= res.responseData : this.talukaListArray = res.responseData;
          if (this.editFlag && this.onSelFlag) {
            this.yojanaForm.controls['talukaId'].setValue(this.updatedObj.talukaId);
            this.getVillage();
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

  getVillage(flag?:any) {
   let talukaId = flag == 'vil'? this.filterForm.value.talukaId : this.yojanaForm.value.talukaId;
    this.apiService.setHttp('get','api/MasterDropdown/GetAllVillage?DistrictId=0&TalukaId=' + talukaId, false,false,false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          flag =='vil' ? this.villageFilterArray = res.responseData : this.villageListArray = res.responseData;
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
    switch (flag) {
      case 'district':
        this.yojanaForm.controls['talukaId'].setValue('');
        this.yojanaForm.controls['villageId'].setValue('');
        break;
      case 'taluka':
        this.yojanaForm.controls['villageId'].setValue('');
        break;
    }
    this.getAllYojanaList();
  }

  clearfilter(flag:any){
    switch (flag) {
      case 'district':
        this.filterForm.controls['talukaId'].setValue(0);
        this.filterForm.controls['villageId'].setValue(0);
        break;
      case 'taluka':
        this.filterForm.controls['villageId'].setValue(0);
        break;
    }
    // this.filterData();
  }

  filterData(){
    this.pageNumber=1;
    this.getAllYojanaList();
  }

  getAllYojanaList() {
    this.spinner.show();
    let formData = this.filterForm.value;
    console.log(formData)
    let str ='DistrictId='+ (formData.districtId ? formData.districtId : 0) +'&TalukaId='+ (formData.talukaId ? formData.talukaId : 0) +'&VillageId='+ (formData.villageId ? formData.villageId :0) +'&pageno=' + this.pageNumber + '&pagesize=' + this.pagesize;
    this.apiService.setHttp('get','ValveManagement/Yojana-Master/GetAllYojana?' + str, false,false,false,'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.spinner.hide();
          this.yojanaListArray = res.responseData.responseData1;
          this.totalRows = res.responseData.responseData2?.totalCount;
          this.highlitedRow=0;
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

  onClickPagintion(pagNo: number) {
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

  updateYojana(yojana: any) {
    this.editFlag = true;
    this.onSelFlag = true;
    this.updatedObj = yojana
    this.highlitedRow = yojana.id;
    this.btnText = 'Update'
    this.yojanaForm.patchValue({
      yojanaName: this.updatedObj.yojanaName,
    })
    this.getAllDistrict();
  }

  deleteConformation(ele: number) {
    this.data = ele;
    this.highlitedRow = this.data.id;
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
    this.btnText = 'Submit';
    this.defaultForm();
  }
}