import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { log } from 'console';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';

@Component({
  selector: 'app-valve-segment-assignment',
  templateUrl: './valve-segment-assignment.component.html',
  styleUrls: ['./valve-segment-assignment.component.css']
})
export class ValveSegmentAssignmentComponent implements OnInit {

  valveRegForm: FormGroup | any;
  filterForm!: FormGroup;
  valveArray: any;
  valveDropdownArray: any;
  sgmentDropdownArray: any;
  segmentShowArray = new Array();
  yojanaArr: any;
  filterYojanaArr = new Array();
  networkArr: any;
  FilterNetworkArr = new Array();
  editFlag: boolean = false;
  submited: boolean = false;
  editObj: any;
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  valvelabel: any;
  getAllLocalStorageData: any;
  valveId: any;
  segDropdown = new Array();

  @ViewChild('closebutton') closebutton: any;

  constructor(private apiService: ApiService,
    public commonService: CommonService,
    private errorSerivce: ErrorsService,
    private localStorage: LocalstorageService,
    private toastrService: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
    this.formData();
    this.filterFormField();
    this.getAllValveTableData();
    this.getAllYojana();
    // || networkIdAddArray?.length <= 1
  }

  formData() {
    this.valveRegForm = this.fb.group({
      "id": [this.editFlag ? this.editObj.id : 0],
      "valveId": ['', Validators.required],
      "segmentId": ['', Validators.required],
      "yojanaId": ['', Validators.required],
      "networkId": ['', Validators.required],
      "valvesegmet": []  
    })
  }

  get f() {
    return this.valveRegForm.controls;
  }

  filterFormField() {
    this.filterForm = this.fb.group({
      yojanaId: [0],
      networkId: [0]
    })
  }

  clearfilter(flag: any) {
    if (flag == 'yojana') {
      this.filterForm.controls['networkId'].setValue(0);
    } else if (flag == 'network') {
      this.filterForm.controls['yojanaId'].setValue(this.filterForm.value.yojanaId);
    }
    this.getAllValveTableData();
  }

  getAllYojana() {
    this.apiService.setHttp('get', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getAllLocalStorageData.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200') {
          this.yojanaArr = res.responseData;
          this.filterYojanaArr = res.responseData;
          this.yojanaArr.length == 1 ? (this.valveRegForm.patchValue({ yojanaId: this.yojanaArr[0].yojanaId }), this.getAllNetwork()) : '';
          this.filterYojanaArr.length == 1 ? (this.filterForm.patchValue({ yojanaId: this.filterYojanaArr[0].yojanaId }), this.getAllNetworkFilter()) : '';
          this.editObj && this.getAllLocalStorageData.userId == 1 ? (this.f['yojanaId'].setValue(this.editObj.yojanaId), this.getAllNetwork()) : '';
        } else {
          this.yojanaArr = [];
        }
      }),
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      }
    })
  }

  getAllNetworkFilter() {
    if (!this.editFlag) {    
      this.apiService.setHttp('get', 'api/MasterDropdown/GetAllNetworkbyUserId?UserId=' + this.getAllLocalStorageData.userId + '&YojanaId=' + this.filterForm.value.yojanaId, false, false, false, 'valvemgt');
      this.apiService.getHttp().subscribe({
        next: ((res: any) => {
          if (res.statusCode == 200) {
            this.FilterNetworkArr = res.responseData;
            this.FilterNetworkArr?.length == 1 ? (this.filterForm.patchValue({ networkId: this.FilterNetworkArr[0].networkId })) : '';
            // this.editObj ? (this.f['networkId'].setValue(this.editObj.networkId),this.getAllvalve(), this.getAllSegment()) : '';
          } else {
            this.FilterNetworkArr = [];
          }
        }),
        error: (error: any) => {
          this.errorSerivce.handelError(error.status);
        }
      })
    }

  }

  getAllNetwork() {
    this.apiService.setHttp('get', 'api/MasterDropdown/GetAllNetworkbyUserId?UserId=' + this.getAllLocalStorageData.userId + '&YojanaId=' + this.valveRegForm.value.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == 200) {
          this.networkArr = res.responseData;
          this.networkArr?.length == 1 ? (this.valveRegForm.patchValue({ networkId: this.networkArr[0].networkId }), this.getAllvalve(), this.getAllSegment()) : '';
          this.networkArr?.length > 1 ? (this.valveRegForm.patchValue({ networkId: this.valveRegForm.value.networkId })) : '';
          this.editObj && this.getAllLocalStorageData.userId == 1 ? (this.f['networkId'].setValue(this.editObj.networkId), this.getAllvalve(), this.getAllSegment()) : '';
        } else {
          this.networkArr = [];
        }
      }),
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      }
    })
  }

  getAllvalve() {
    this.apiService.setHttp('GET', 'ValveMaster/GetValveNameList?userId=' + this.getAllLocalStorageData.userId + '&YojanaId=' + this.valveRegForm.value.yojanaId + '&NetworkId=' + this.valveRegForm.value.networkId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.valveDropdownArray = res.responseData;
          this.editObj ? (this.f['valveId'].setValue(this.editObj.valveDetailsId)) : '';
        }
      }, error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    })

  }

  getAllSegment() {
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllSegmentForValve?YojanaId=' + this.valveRegForm.value.yojanaId + '&NetworkId=' + this.valveRegForm.value.networkId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.sgmentDropdownArray = res.responseData;
          console.log("sgmentDropdownArray",this.sgmentDropdownArray);   
          this.editObj ? (this.f['segmentId'].setValue(this.editObj.segmentId)) : '';
        }
      }, error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    })
  }



  getAllValveTableData() {
    this.spinner.show();
    this.apiService.setHttp('GET', 'ValveManagement/Valvesegment/GetAllVaveSegments?pageNo=' + this.pageNumber + '&pageSize=' + this.pagesize + '&yojanaId=' + (this.filterForm.value.yojanaId || 0 || this.getAllLocalStorageData.yojanaId) + '&networkId=' + (this.filterForm.value.networkId || 0), false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode == 200) {
          this.valveArray = res.responseData.responseData1;
          this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;
        } else {
          this.spinner.hide();
          this.valveArray = [];
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  addSegment() {
    if (this.valveRegForm.value.segmentId == '') {
      return;
    }
    let segId = this.valveRegForm.value.segmentId
    let data = this.sgmentDropdownArray.find((res: any) => {
      if (res.segmentId == segId) {
        return res;
      }
    })

    //--------------------clear segment dropdown ------------------------------//
    if (this.segmentShowArray.length > 0 && this.valvelabel == 'valve') {
      this.segmentShowArray = [];
      this.f['segmentId'].setValue('');
      this.valvelabel = '';
    } else {
      this.valvelabel = ''
    }
    //--------------------clear segment dropdown ------------------------------//

    for (var i = 0; i < this.segmentShowArray.length; i++) {
      if (this.segmentShowArray[i].segmentId == this.valveRegForm.value.segmentId) {
        this.toastrService.success("Record Already Exists");
        return
      }
    }
    this.segmentShowArray.push(data);
    this.f['segmentId'].setValue(0);

    
    for(let i =0 ; i<= this.sgmentDropdownArray.length ; i++){
      for(let j=i+1 ; j <= this.segmentShowArray.length ;j++){
        this.sgmentDropdownArray.splice(i, 1);               
      }
    }
   
    
  }

  onSubmit() {
    this.submited = true;
    if (this.valveRegForm.invalid ||this.segmentShowArray.length == 0) {
      return;
    } else {
      let formValue = this.valveRegForm.value
      formValue.valvesegmet = this.segmentShowArray;
      let obj = {
        "id": formValue.id,
        "valveId": 0,
        "valveDetailsId" : formValue.valveId || 0,
        "segmentId": 0,
        "isDeleted": false,
        "createdBy": this.localStorage.userId(),
        "createdDate": new Date(),
        "modifiedBy": this.localStorage.userId(),
        "modifiedDate": new Date(),
        "timestamp": new Date(),
        "networkId": formValue.networkId,
        "yojanaId": formValue.yojanaId,
        "valvesegmet": this.segmentShowArray
      }

      this.spinner.show();
      this.apiService.setHttp('PUT', 'ValveManagement/Valvesegment/Updatevalvesegmentassignment', false, obj, false, 'valvemgt');
      this.apiService.getHttp().subscribe(
        (res: any) => {
          if (res.statusCode == 200) {
            this.spinner.hide();
            this.toastrService.success(res.statusMessage);
            this.closebutton.nativeElement.click();
            this.getAllValveTableData();
           
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

  onEdit(obj: any) {   
    this.editFlag = true
    this.editObj = obj;
    this.getAllYojana();
    this.formData();
    this.segmentShowArray = this.editObj.valvesegmet;
  }

  deleteSegment(index: any) {
    this.segmentShowArray.splice(index, 1);  
    this.getAllSegment(); 
  }


  deleteConformation(id: any) {
    this.valveId = id;
  }
  onDeleteValve() {   
    console.log("valvearray",this.valveArray);
    console.log("valveId",this.valveId);    
    let obj = {
      id: this.valveId,
      deletedBy: this.localStorage.userId(),
    };  
    this.apiService.setHttp('DELETE', 'ValveManagement/Valvesegment', false, obj, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.toastrService.success(res.statusMessage);
          this.getAllValveTableData();
          // this.clearForm();
        } else {
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : this.toastrService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  clearForm() {   
    this.getAllValveTableData();
    this.formData();
    this.editFlag = false;
    this.editObj = '';
    this.segmentShowArray = [];
    this.submited = false;
    this.yojanaArr?.length == 1 ?  this.valveRegForm.controls['yojanaId'].setValue(this.yojanaArr[0].yojanaId) : '';
    (this.networkArr?.length == 1 && this.valveRegForm.value.yojanaId) ? this.valveRegForm.controls['networkId'].setValue(this.networkArr[0].networkId) : '';
  }
  clearDropdown() {
    this.f['segmentId'].setValue('');
  }

  valvedropdown(label: any) {
    this.valvelabel = label
  }
  onClickPagintion(pageNo: number) {
    this.pageNumber = pageNo;
    this.getAllValveTableData();
  }

  clearFormData(flag: any) {
    if (flag == 'yojana') {
      this.valveRegForm.controls['networkId'].setValue('');
      this.valveRegForm.controls['valveId'].setValue('');
      this.valveRegForm.controls['segmentId'].setValue('');
      this.segmentShowArray = [];
    } else if (flag == 'network') {
      this.valveRegForm.controls['valveId'].setValue('');
      this.valveRegForm.controls['segmentId'].setValue('');
      this.segmentShowArray = [];
    } else if (flag == 'valve') {
      this.valveRegForm.controls['segmentId'].setValue('');
      this.segmentShowArray = [];
    }
  }

}
