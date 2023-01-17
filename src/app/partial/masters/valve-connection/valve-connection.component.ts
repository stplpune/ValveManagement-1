import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';

@Component({
  selector: 'app-valve-connection',
  templateUrl: './valve-connection.component.html',
  styleUrls: ['./valve-connection.component.css']
})
export class ValveConnectionComponent implements OnInit {
  valveConnectionForm!: FormGroup | any;
  dataSource: any;
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows!: number;
  highlitedRow: any;
  valveConnectionArray = new Array();
  editFlag: boolean = false;
  getLoginData: any;
  // @ViewChild('formDirective')
  // private formDirective!: NgForm;
  @ViewChild('closebutton') closebutton: any;
  data: any;
  submitted:boolean = false;

  constructor(private fb: FormBuilder,
    private localStorage: LocalstorageService,
    private toasterService: ToastrService,
    private apiService: ApiService,
    private errorSerivce: ErrorsService,
    public commonService: CommonService,
    private spinner: NgxSpinnerService,) { }

  ngOnInit(): void {
    this.getLoginData = this.localStorage.getLoggedInLocalstorageData();
    this.defaultValveConnectionForm();
    this.getValveConnectionDropdown();
    this.bindValveConnectionsTable();
  }

  defaultValveConnectionForm() {
    this.valveConnectionForm = this.fb.group({
      "id": [0],
      "valveMasterId": ['',[Validators.required]],
      "personName": ['',[Validators.required]],
      "mobileNo": ['',[Validators.required]],
      "remark": [''],
      "createdBy": this.localStorage.userId(),
      "yojanaId": [this.getLoginData.yojanaId],
      "networkId": [this.getLoginData.networkId],
      "consumerUserId": [0],
      "totalConnection": ['',[Validators.required]],
      "connectiondetails": this.fb.array([
        this.fb.group({
          "pipeDiameter": ['',[Validators.required]],
          "connectionNo": ['',[Validators.required]]
        })
      ])
    })
  }

  get f() {
    return this.valveConnectionForm.controls;
  }



  get connectionForm(): FormArray {
    return this.valveConnectionForm.get('connectiondetails') as FormArray;
  }

  addConnection() {
    let arrayData = this.fb.group({
      pipeDiameter: [''],
      connectionNo: []
    });
    if (this.valveConnectionForm.value.connectiondetails.length > 0) {
      if (this.valveConnectionForm.value.connectiondetails[this.valveConnectionForm.value.connectiondetails.length - 1].pipeDiameter && this.valveConnectionForm.value.connectiondetails[this.valveConnectionForm.value.connectiondetails.length - 1].connectionNo) {
        this.connectionForm.push(arrayData);
      } else {
        this.toasterService.error('Please, Enter Pipe Diameter and Connection No. !');
      }
    }
    else {
      this.connectionForm.push(arrayData);
    }
  }

  removeItem(i: number) {
    this.connectionForm.removeAt(i)
  }

  bindValveConnectionsTable() {
    this.spinner.show();
    let obj = 'UserId=' + this.localStorage.userId() + '&pageno=' + this.pageNumber + '&pagesize=' + this.pagesize;
    this.apiService.setHttp('get', 'ValveConnection?' + obj, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.spinner.hide();
          this.dataSource = res.responseData.responseData1;
          this.totalRows = res.responseData.responseData2.totalCount;
          this.highlitedRow = 0;
        } else {
          this.spinner.hide();
          this.dataSource = [];
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toasterService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  getValveConnectionDropdown() {
    this.apiService.setHttp('get', 'ValveMaster/GetValveNameList?userId=' + this.localStorage.userId() + '&YojanaId=' + this.getLoginData.yojanaId + '&NetworkId=' + this.getLoginData.networkId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.valveConnectionArray = res.responseData;
          // this.editFlag ? this.valveConnectionForm.controls['valveMasterId'].setValue() : '';

        }
        else {
          this.valveConnectionArray = [];
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toasterService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  deleteConformation(ele: number) {
    this.data = ele;
    this.highlitedRow = this.data.id;
  }

  deleteConnection() {
    let obj = {
      "id": this.data.id,
      "deletedBy": 0
    }

    this.apiService.setHttp('DELETE', 'ValveConnection', false, obj, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.toasterService.success(res.statusMessage);
          this.bindValveConnectionsTable();
        } else {
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toasterService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  onClickEdit(editObj: any) {
    this.connectionForm.clear()
    this.highlitedRow = editObj.id;
    this.editFlag = true;
    this.valveConnectionForm.patchValue({
      "id": editObj.id,
      "valveMasterId": editObj.valveMasterId,
      "personName": editObj.personName,
      "mobileNo": editObj.mobileNo,
      "remark": editObj.remark,
      "createdBy": this.localStorage.userId(),
      "yojanaId": this.getLoginData.yojanaId,
      "networkId": this.getLoginData.networkId,
      "consumerUserId": 0,
      "totalConnection": +editObj.totalConnection,
    });
    editObj.connectiondetails?.map((element: any) => {
      let arrayData = this.fb.group({
        pipeDiameter: [element.pipeDiameter],
        connectionNo: [+element.connectionNo]
      });
      this.connectionForm.push(arrayData);
    })
  }

  onClickSubmit() {
    this.submitted = true;
    if (!this.valveConnectionForm.valid) {
      if (this.connectionForm.controls[this.connectionForm.length - 1].status == 'INVALID') {
        return;
      }
      return;
    }
    else {
      this.spinner.show();
      let formData = this.valveConnectionForm.value;
      let url;
      // this.editFlag ? url = 'ValveConnection' : url = 'ValveConnection'
      this.apiService.setHttp(this.editFlag ? 'put' : 'post', 'ValveConnection', false, formData, false, 'valvemgt');
      this.apiService.getHttp().subscribe({
        next: ((res: any) => {
         if (res.statusCode == "200") {
            this.spinner.hide();
            this.highlitedRow = 0;
            this.toasterService.success(res.statusMessage);
            this.closebutton.nativeElement.click();
            this.bindValveConnectionsTable();
            this.clearForm();
            // this.editFlag = false;
            // this.highlitedRow = 0;
            // this.defaultValveConnectionForm();
            // this.bindValveConnectionsTable();
            // this.toasterService.success(res.statusMessage);
            // this.formDirective.resetForm();
            // this.editFlag = false;
          }
          else {
            this.commonService.checkDataType(res.statusMessage) == false
              ? this.errorSerivce.handelError(res.statusCode)
              : this.toasterService.error(res.statusMessage);
          }
        }),
        error: (error: any) => {
          this.errorSerivce.handelError(error.status);
        }
      })
    }
  }

  onClickPagintion(pagNo: number) {
    this.pageNumber = pagNo;
    this.bindValveConnectionsTable();
  }

  //Clear All Data In the Form Fields
  clearForm(formDirective?:any) {
    this.submitted = false;
    formDirective?.resetForm();
    this.defaultValveConnectionForm();
    this.editFlag = false;
  }





}
