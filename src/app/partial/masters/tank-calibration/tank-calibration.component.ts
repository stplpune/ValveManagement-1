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
  selector: 'app-tank-calibration',
  templateUrl: './tank-calibration.component.html',
  styleUrls: ['./tank-calibration.component.css']
})
export class TankCalibrationComponent implements OnInit {

  tankForm !:FormGroup | any;
  filterFrm!:FormGroup|any;
  tankArray = new Array();
  submitted : boolean = true;
  pageNumber:number=1;
  pagesize:number =10;
  tankCalibrationArray=new Array();
  totalRows:any;
  highlitedRow:any;
  localstorageData:any;
  editFlag:boolean=false;
  updatedObj:any;
  tankName:any;
  btnText!:string;
  yojanaArray=new Array();
  networkArray=new Array();
  @ViewChild('AddValveModal') AddValveModal: any;
  constructor(
    private fb: FormBuilder,
    private localStorage: LocalstorageService,
    private spinner: NgxSpinnerService,
    public apiService: ApiService,
    private errorSerivce: ErrorsService,
    private toastrService: ToastrService,
    public commonService: CommonService,
    public validation:ValidationService,
  ) { }

  ngOnInit(): void {
    this.localstorageData=this.localStorage.getLoggedInLocalstorageData();
    this.getAllYojana(this.localstorageData.yojanaId);
    this.defaultForm();
    this.getFilterForm();
    this.getAllTankCalibration();
    
  }

  defaultForm(){
    this.tankForm = this.fb.group({
         tankId:['',[Validators.required]],
         tankMinLevel: ['',[Validators.required]],
         tankMaxLevel: ['',[Validators.required]],
         tankMinQty: ['',[Validators.required]],
         tankMaxQty: ['',[Validators.required]],
    })
  }

  getFilterForm(){
     this.filterFrm =this.fb.group({
      yojanaId:[0],
      networkId:[0]
     })
  }

  clearfilter(flag:any){
    if(flag=='yojana'){
      this.filterFrm.controls['yojanaId'].setValue(0);
      this.filterFrm.controls['networkId'].setValue(0);
      this.getAllTankCalibration();
    }else if(flag== 'network'){
      this.filterFrm.controls['yojanaId'].setValue(this.filterFrm.value.yojanaId);
      this.filterFrm.controls['networkId'].setValue(0);
      this.getAllTankCalibration();
    }

  }

  get f(){ return this.tankForm.controls}


  getAllYojana(id:any){
    this.apiService.setHttp('get','api/MasterDropdown/GetAllYojana?YojanaId='+ id, false, false, false,'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.yojanaArray = res.responseData;
        } else {
          this.yojanaArray = [];
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

  getNetworkByYojanaId(yojanaId:any){
    this.apiService.setHttp('get','api/MasterDropdown/GetAllNetwork?YojanaId='+ yojanaId , false, false, false,'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.networkArray = res.responseData; 
        } else {
          this.networkArray = [];
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


  getAllTank(){
    this.apiService.setHttp('get','api/MasterDropdown/GetAllTank', false, false, false,'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.tankArray = res.responseData;
          this.editFlag ? this.tankForm.controls['tankId'].setValue(this.updatedObj.tankId) : ''; 
        } else {
          this.tankArray = [];
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

  getAllTankCalibration(){
    this.spinner.show();
    let filterValue=this.filterFrm.value;
    let obj ='UserId=' + this.localstorageData.userId + '&pageno=' + this.pageNumber +'&pagesize=' + this.pagesize + '&YojanaId=' + filterValue.yojanaId + '&NetworkId=' + filterValue.networkId;
    this.apiService.setHttp('get','TankInfo/GetAllTankCalibration?' + obj, false,false,false,'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.spinner.hide();
          this.tankCalibrationArray = res.responseData.responseData1;
          this.totalRows = res.responseData.responseData2?.totalCount;
          this.highlitedRow=0;
        } else {
          this.spinner.hide();
          this.tankCalibrationArray = [];
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
    this.getAllTankCalibration();
  }

  onSubmit(){
    this.submitted = true;
    if(this.tankForm.invalid){
      return;
    }else{
      let formdata=this.tankForm.value;
      let obj={
        "tankId": formdata.tankId,
        "tankName": '',
        "tankHeightInCM": 0,
        "tankCapcityInLiter": 0,
        "tankMinLevel": formdata.tankMinLevel,
        "tankMaxLevel": formdata.tankMaxLevel,
        "tankMinQty": formdata.tankMinQty,
        "tankMaxQty": formdata.tankMaxQty,
        "createdBy": 0
      }

      this.apiService.setHttp('PUT','TankInfo/UpdateTankCalibration',false,obj, false,'valvemgt');
      this.apiService.getHttp().subscribe(
        (res: any) => {
          if (res.statusCode == '200') {
            this.spinner.hide();
            this.toastrService.success(res.statusMessage);
            this.getAllTankCalibration();
            this.AddValveModal.nativeElement.click();
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

  updateTankCal(obj:any){
    this.editFlag=true;
    this.updatedObj=obj;
    this.highlitedRow = obj.tankId;
    this.btnText='Update';
    this.tankForm.patchValue({
        tankMinLevel: this.updatedObj.tankMinLevel,
         tankMaxLevel: this.updatedObj.tankMaxLevel,
         tankMinQty: this.updatedObj.tankMinQty,
         tankMaxQty: this.updatedObj.tankMaxQty,
    })
    this.getAllTank();
  }

}
