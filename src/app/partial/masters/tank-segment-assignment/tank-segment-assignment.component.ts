import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';

@Component({
  selector: 'app-tank-segment-assignment',
  templateUrl: './tank-segment-assignment.component.html',
  styleUrls: ['./tank-segment-assignment.component.css']
})
export class TankSegmentAssignmentComponent implements OnInit {
  tankSegmentForm: FormGroup | any;
  filterForm: FormGroup | any;
  responseArray = new Array();
  tankArr = new Array();
  segmentArr = new Array();
  yojanaArr = new Array();
  networkArr = new Array();
  tankSegmentTable = new Array();
  editObj: any;
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  editFlag: boolean = false;
  tankLabel !: string;
  submitted: boolean = false;
  filterYojanaArray = new Array();
  filterNetworkArray = new Array();
  @ViewChild('closebutton') closebutton: any;
  getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();

  constructor(private service: ApiService,
    private error: ErrorsService,
    private localStorage: LocalstorageService,
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.formField();
    this.filterFormField();
    this.getTableData();
    // this.getAllTank();
    // this.getAllSegment();
    this.getAllYojana();
  }

  formField() {
    this.tankSegmentForm = this.fb.group({
      "id": 0,
      "tankId": ['', Validators.required],
      "segmentId": [''],
      // "isDeleted": true,
      // "createdBy": 0,
      // "createdDate": new Date(),
      // "modifiedBy": 0,
      // "modifiedDate": new Date(),
      // "timestamp": new Date(),
      tanksegment: [],
      "yojanaId": ['', Validators.required],
      "networkId": ['', Validators.required]
    })
  }

  filterFormField() {
    this.filterForm = this.fb.group({
      yojanaId: [0],
      networkId: [0]
    })
  }

  get f() {
    return this.tankSegmentForm.controls;
  }

  getTableData() {
    console.log("Filter form : ", this.filterForm.value);

    this.service.setHttp('get', 'ValveTankSegment/GetAllTanksSegment?pageno=' + this.pageNumber + '&pagesize=' + this.pagesize + '&yojanaId=' + (this.filterForm.value.yojanaId || 0) + '&networkId=' + (this.filterForm.value.networkId || 0), false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        // console.log("Table res : ", res);
        if (res.statusCode == '200') {
          this.responseArray = res.responseData.responseData1;
          this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;
        } else {
          this.responseArray = [];
        }
      }),
      error: (error: any) => {
        this.error.handelError(error.status);
      }
    })
  }

  getAllYojana() {
    this.service.setHttp('get', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getAllLocalStorageData.yojanaId, false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200') {
          this.yojanaArr = res.responseData;
          this.filterYojanaArray = res.responseData;
          this.editObj ? (this.f['yojanaId'].setValue(this.editObj.yojanaId), this.getAllNetwork()) : '';
        } else {
          this.yojanaArr = [];
        }
      }),
      error: (error: any) => {
        this.error.handelError(error.status);
      }
    })
  }

  getAllNetwork(label?: string) {
    let yojanaId = label == 'yojana' ? this.filterForm.value.yojanaId : this.tankSegmentForm.value.yojanaId;
    this.service.setHttp('get', 'api/MasterDropdown/GetAllNetwork?YojanaId=' + yojanaId, false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200') {
          label == 'yojana' ? this.filterNetworkArray = res.responseData : this.networkArr = res.responseData
          // this.networkArr = res.responseData;

          this.editObj ? (this.f['networkId'].setValue(this.editObj.networkId), (this.getAllTank(), this.getAllSegment())) : '';
        } else {
          this.networkArr = [];
        }
      }),
      error: (error: any) => {
        this.error.handelError(error.status);
      }
    })
  }

  getAllTank() {
    this.service.setHttp('get', 'api/MasterDropdown/GetAllTank?YojanaId=' + this.tankSegmentForm.value.yojanaId + '&NetworkId=' + this.tankSegmentForm.value.networkId, false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200') {
          this.tankArr = res.responseData;
          this.editObj ? (this.f['tankId'].setValue(this.editObj.tankId)) : '';
        } else {
          this.tankArr = [];
        }
      }),
      error: (error: any) => {
        this.error.handelError(error.status);
      }
    })
  }

  getAllSegment() {
    this.service.setHttp('get', 'api/MasterDropdown/GetAllSegmentForTank?YojanaId=' + this.tankSegmentForm.value.yojanaId + '&NetworkId=' + this.tankSegmentForm.value.networkId, false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200') {
          this.segmentArr = res.responseData;
        } else {
          this.segmentArr = [];
        }
      }),
      error: (error: any) => {
        this.error.handelError(error.status);
      }
    })
  }

  addTankSegment() {
    if (this.tankSegmentForm.value.segmentId == '') {
      return
    }
    let array = this.segmentArr.find((x: any) => {
      return (x.segmentId == this.tankSegmentForm.value.segmentId)
    })
    console.log("Id : ", this.tankSegmentForm.value.segmentId);

    if (this.tankSegmentTable.length > 0 && this.tankLabel == 'tank') {
      this.tankSegmentTable = [];
      this.f['segmentId'].setValue('');
      this.tankLabel = '';
    }
    else {
      this.tankLabel = '';
    }

    for (var i = 0; i < this.tankSegmentTable.length; i++) {
      if (this.tankSegmentTable[i].segmentId == this.tankSegmentForm.value.segmentId) {
        this.toastrService.success("Dublicate");
        return
      }
    }
    this.tankSegmentTable.push(array);
    this.f['segmentId'].setValue(0);
  }

  deleteTankSegment(index: number) {
    this.tankSegmentTable.splice(index, 1);
  }

  onSubmit() {
    this.submitted = true;
    this.tankSegmentForm.value.tanksegment = this.tankSegmentTable;
    this.tankSegmentForm.value.segmentId = 0;
    console.log("Submit : ", this.tankSegmentForm.value);

    let formValue = this.tankSegmentForm.value;

    if (!this.tankSegmentForm.valid) {
      return
    }
    else {
      let obj = {
        "id": formValue.id,
        "tankId": [formValue.tankId],
        "segmentId": [formValue.segmentId],
        "isDeleted": true,
        "createdBy": this.localStorage.userId(),
        "createdDate": new Date(),
        "modifiedBy": this.localStorage.userId(),
        "modifiedDate": new Date(),
        "timestamp": new Date(),
        "yojanaId": [formValue.yojanaId],
        "networkId": [formValue.networkId],
        tanksegment: this.tankSegmentTable
      }

      this.spinner.show();
      this.service.setHttp('put', 'ValveTankSegment/Updatetanksegmentassignment', false, formValue, false, 'valvemgt');
      this.service.getHttp().subscribe({
        next: ((res: any) => {
          if (res.statusCode == '200') {
            this.closebutton.nativeElement.click();
            this.toastrService.success(res.statusMessage);
            this.spinner.hide();
            this.getTableData();
          }
          else {
            this.toastrService.error(res.statusMessage);
            this.spinner.hide();
          }
        }),
        error: (error: any) => {
          this.error.handelError(error.status);
          this.spinner.hide();
        }
      })
    }
  }

  clearForm(formDirective?: any) {
    formDirective?.resetForm();
    this.editFlag = false;
    this.editObj = '';
    // this.tankSegmentForm.reset();
    this.formField();
    this.tankSegmentTable = [];
    this.submitted = false;
  }

  onChangeDropdown(label: string) {
    if (label == 'Yojna') {
      this.f['networkId'].setValue('');
      this.f['tankId'].setValue('');
      this.f['segmentId'].setValue('');
    }
    else if (label == 'Network') {
      this.f['tankId'].setValue('');
      this.f['segmentId'].setValue('');
    }
    else if (label == 'Tank') {
      this.f['segmentId'].setValue('');
    }
  }

  onLable(label: string) {
    this.tankLabel = label;
  }

  onEdit(obj: any) {
    this.editFlag = true;
    console.log("onEdit : ", obj);
    this.editObj = obj;
    // this.formField();
    this.getAllYojana();

    this.tankSegmentTable = this.editObj.tanksegmet;
  }

  onClickPagintion(pageNo: number) {
    this.pageNumber = pageNo;
    this.getTableData();
  }

  clearfilter(label: any) {
    if (label == 'Yojana') {
      this.filterForm.controls['networkId'].setValue(0);
    } else if (label == 'Network') {
      this.filterForm.controls['yojanaId'].setValue(this.filterForm.value.yojanaId);
    }
    this.getTableData();

  }

}
