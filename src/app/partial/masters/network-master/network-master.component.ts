import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { ValidationService } from 'src/app/core/services/validation.service';

@Component({
  selector: 'app-network-master',
  templateUrl: './network-master.component.html',
  styleUrls: ['./network-master.component.css']
})
export class NetworkMasterComponent implements OnInit {

  networkRegForm!:FormGroup | any;
  allNetworkArray = new Array();
  allYojanaArray = new Array();
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  editFlag:boolean = false;
  deleteSegmentId: any;
  submitted:boolean =false;
  buttonName:string = 'Submit';
  highlitedRow:any; 
  getAllLocalStorageData:any;
  @ViewChild('closebutton') closebutton:any;
  get f(){
    return this.networkRegForm.controls;
  }
  constructor(private apiService: ApiService,
    private fb: FormBuilder,
    public validation: ValidationService,
    private localStorage: LocalstorageService,
    public commonService: CommonService,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    private errorSerivce: ErrorsService) {}

  ngOnInit(): void {
    this.controlForm();
    this.getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
    this.getAllNetworkTableData();
    this.getAllYojana();
  }

  controlForm(){
    this.networkRegForm = this.fb.group({
      id:[0],
      networkName : ['', Validators.required],
      yojanaId: ['', Validators.required]
    })
  }

  getAllYojana() {
      this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getAllLocalStorageData.yojanaId, false, false, false, 'valvemgt');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == '200') {
            this.allYojanaArray = res.responseData;
          }
        },  error: (error: any) => {
          this.errorSerivce.handelError(error.status);
        },
      })
  }

  getAllNetworkTableData() {
    this.spinner.show();
    this.apiService.setHttp('GET', 'ValveManagement/Network/GetAllNetwork?YojanaId=' + this.getAllLocalStorageData.yojanaId + '&pageno=' + this.pageNumber + '&pagesize=' + this.pagesize, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode == "200") {
          this.allNetworkArray = res.responseData.responseData1;
          this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;
          this.highlitedRow=0;
        } else {
          this.spinner.hide();
          this.allNetworkArray = [];
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  onSubmit() {
    this.submitted = true;
    if(this.networkRegForm.invalid){
      return;
    }else{
      let formData = this.networkRegForm.value;
      formData.createdBy=this.localStorage.userId();
      formData.timestamp=new Date();
    this.spinner.show();
    let urlType= this.editFlag ? 'PUT':'POST';
    let urlName= this.editFlag ? ('ValveManagement/Network/UpdateNetwork') : ('ValveManagement/Network/AddNetwork');
    this.apiService.setHttp(urlType,urlName,false,formData,false,'valvemgt');
    this.apiService.getHttp().subscribe(
      (res: any) => {
        if (res.statusCode == '200') {
          this.spinner.hide();
          this.toastrService.success(res.statusMessage);
          this.getAllNetworkTableData();
          this.closebutton.nativeElement.click();
          this.buttonName = 'Submit';
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

onEdit(data?:any){
  this.editFlag = true;
  this.highlitedRow = data.id;
  this.buttonName = 'Update';
  this.networkRegForm.patchValue({
    id:data.id,
    networkName : data.networkName,
    yojanaId: data.yojanaId,
    createdBy: data.createdBy,
    timestamp: data.timestamp
  })
}

clearForm(formDirective?:any){
  formDirective?.resetForm();
  this.submitted = false;
  this.editFlag = false;
  this.buttonName = 'Submit';
}

deleteConformation(id?:any){
  this.deleteSegmentId = id;
  this.highlitedRow = id;
}

deleteNetworkMaster(){
  let deleteObj = {
    id: this.deleteSegmentId,
    modifiedBy: this.localStorage.userId(),
    modifiedDate: new Date()
  }
  this.apiService.setHttp('DELETE', 'ValveManagement/Network/DeleteNetwork', false, deleteObj, false, 'valvemgt');
  this.apiService.getHttp().subscribe({
    next: (res: any) => {
      if (res.statusCode === '200') {
        this.toastrService.success(res.statusMessage);
        this.getAllNetworkTableData();
      } else {
        this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : this.toastrService.error(res.statusMessage);
      }
    },
    error: (error: any) => {
      this.errorSerivce.handelError(error.status);
    },
  });
}

onClickPagintion(pageNo: number) {
  this.pageNumber = pageNo;
  this.getAllNetworkTableData();
}

clearDropdown(flag:any){
   this.editFlag = false;
  switch(flag){
    case 'yojana': this.networkRegForm.controls['yojanaId'].setValue('');
                      break;
  }
}

}
