import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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

  valveRegForm!:FormGroup;
  valveArray = new Array();
  valveDropdownArray = new Array();
  sgmentDropdownArray = new Array();
  getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
  constructor(private apiService: ApiService,public commonService: CommonService,private errorSerivce: ErrorsService ,private localStorage: LocalstorageService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.formData();
    this.getAllValveTableData();
    console.log("localstorage",this.getAllLocalStorageData);
    this.getAllvalve();
    this.getAllSegment();
    
  }

  formData(){
    this.valveRegForm = this.fb.group({      
        "id": 0,
        "valveId": 0,
        "segmentId": 0,
        "isDeleted": true,
        "createdBy": 0,
        "createdDate": "2023-01-16T12:49:47.055Z",
        "modifiedBy": 0,
        "modifiedDate": "2023-01-16T12:49:47.055Z",
        "timestamp": "2023-01-16T12:49:47.055Z",
        "valvesegmet": [
          {
            "segmentId": 0,
            "segmentName": "string"
          }
        ]
    })
  }

  getAllvalve(){
    // ValveMaster/GetValveNameList?userId=1&YojanaId=1&NetworkId=1
    this.apiService.setHttp('GET', 'ValveMaster/GetValveNameList?userId='+this.getAllLocalStorageData.userId+'&YojanaId='+ this.getAllLocalStorageData.yojanaId+'&NetworkId='+this.getAllLocalStorageData.networkId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.valveDropdownArray = res.responseData;
          console.log("valveDropdownArray",this.valveDropdownArray);
          
        }
      },  error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    })

}

getAllSegment(){
      this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllSegment?YojanaId='+ this.getAllLocalStorageData.yojanaId+'&NetworkId='+this.getAllLocalStorageData.networkId, false, false, false, 'valvemgt');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.sgmentDropdownArray = res.responseData;
            console.log("sagment",this.sgmentDropdownArray);
            
          }
        },  error: (error: any) => {
          this.errorSerivce.handelError(error.status);
        },
      })

  }

  getAllValveTableData(){
    this.apiService.setHttp('GET', 'ValveManagement/Valvesegment/GetAllVaveSegments', false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        // this.spinner.hide();
        if (res.statusCode == 200) {
          this.valveArray = res.responseData.responseData1;
          console.log("valveArray",this.valveArray);
          
          // this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;
        } else {
          // this.spinner.hide();
          this.valveArray = [];
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  onSubmit(){

  }

}
