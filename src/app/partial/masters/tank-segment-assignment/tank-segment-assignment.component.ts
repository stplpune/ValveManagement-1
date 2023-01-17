import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();

  constructor(private service: ApiService, private error: ErrorsService, private localStorage: LocalstorageService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.formField();
    this.getTableData();
    this.getAllTank();
    this.getAllSegment();
  }

  formField() {
    this.tankSegmentForm = this.fb.group({
      "id": 0,
      "tankId": 0,
      "segmentId": 0,
      "isDeleted": true,
      "createdBy": 0,
      "createdDate": new Date(),
      "modifiedBy": 0,
      "modifiedDate": new Date(),
      "timestamp": new Date(),
      "tanksegment": [
        {
          "segmentId": 0,
          "segmentName": "string"
        }
      ]
    })
  }

  getTableData() {
    this.service.setHttp('get', 'ValveTankSegment/GetAllTanksSegment?pageno=1&pagesize=10&yojanaId=' + this.getAllLocalStorageData.yojanaId + '&networkId=' + this.getAllLocalStorageData.networkId, false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        console.log("Table res : ", res);

        if (res.statusCode == '200') {
          this.responseArray = res.responseData.responseData1;
          // this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;
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
        console.log("Tank res : ", res);
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
        console.log("Segement res : ", res);
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

}
