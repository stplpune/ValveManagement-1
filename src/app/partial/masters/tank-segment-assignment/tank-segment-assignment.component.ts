import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  tankSegmentForm !: FormGroup;
  responseArray = new Array();
  tankArr = new Array();
  segmentArr = new Array();
  tankSegmentTable = new Array();
  editObj: any;
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  editFlag : boolean = false;
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
    this.getTableData();
    this.getAllTank();
    this.getAllSegment();
  }

  formField() {
    this.tankSegmentForm = this.fb.group({
      "id": 0,
      "tankId": [this.editObj ? this.editObj.tankId : 0],
      "segmentId": [this.editObj ? this.editObj.segmentId : 0],
      "isDeleted": true,
      "createdBy": 0,
      "createdDate": new Date(),
      "modifiedBy": 0,
      "modifiedDate": new Date(),
      "timestamp": new Date(),
      tanksegment: this.fb.array([
        this.fb.group({
          "segmentId": [''],
          "segmentName": ['']
        })
      ])
      // "tanksegment": [
      //   {
      //     "segmentId": 0,
      //     "segmentName": "string"
      //   }
      // ]
    })
  }

  get f() {
    return this.tankSegmentForm.controls;
  }

  getTableData() {
    this.service.setHttp('get', 'ValveTankSegment/GetAllTanksSegment?pageno=' + this.pageNumber + '&pagesize=' + this.pagesize + '&yojanaId=' + this.getAllLocalStorageData.yojanaId + '&networkId=' + this.getAllLocalStorageData.networkId, false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        console.log("Table res : ", res);

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

  getAllTank() {
    this.service.setHttp('get', 'api/MasterDropdown/GetAllTank?YojanaId=' + this.getAllLocalStorageData.yojanaId + '&NetworkId=' + this.getAllLocalStorageData.networkId, false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        // console.log("Tank res : ", res);
        if (res.statusCode == '200') {
          this.tankArr = res.responseData;
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
    this.service.setHttp('get', 'api/MasterDropdown/GetAllSegment?YojanaId=' + this.getAllLocalStorageData.yojanaId + '&NetworkId=' + this.getAllLocalStorageData.networkId, false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        // console.log("Segement res : ", res);
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

    for (var i = 0; i < this.tankSegmentTable.length; i++) {
      if (this.tankSegmentTable[i].segmentId == this.tankSegmentForm.value.segmentId) {
        this.toastrService.success("Dublicate");
        return
      }
    }

    this.tankSegmentTable.push(array)
    console.log("segment table", this.tankSegmentTable);

    // this.tankSegmentTable 
    // console.log(this.tankSegmentForm.value.tanksegment[0].segmentName);
    // for(var i=0; i<this.tankSegmentTable.length; i++){
    //   console.log(this.tankSegmentForm.value.tanksegment.segmentName);
    // }

    // let obj = this.tankSegmentForm.value;
    // console.log("obj : ",obj);
    this.f['segmentId'].setValue(0);
  }

  deleteTankSegment(index: number) {
    this.tankSegmentTable.splice(index, 1);
  }

  onSubmit() {
    this.tankSegmentForm.value.tanksegment = this.tankSegmentTable;
    this.tankSegmentForm.value.segmentId = 0;
    console.log("Submit : ", this.tankSegmentForm.value);

    let formValue = this.tankSegmentForm.value;

    // if(!this.tankSegmentForm.valid){
    //   return
    // }
    // else{

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
  // }
  }

  clearForm(formDirective?: any) {
    formDirective?.resetForm();
    this.editFlag = false;
    this.editObj = '';
    // this.tankSegmentForm.reset();
    this.formField();
    this.tankSegmentTable = [];
  }

  onChangeDropdown(label: string) {
    if (label == 'tank') {
      this.f['segmentId'].setValue('');
      // this.tankSegmentTable = [];
    }
  }

  onEdit(obj: any) {
    this.editFlag = true;
    console.log("onEdit : ", obj);
    this.editObj = obj;
    this.formField();

    this.tankSegmentTable = this.editObj.tanksegmet;
  }

  onClickPagintion(pageNo: number) {
    this.pageNumber = pageNo;
    this.getTableData();
  }

}
