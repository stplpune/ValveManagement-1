import { Component, OnInit, ViewChild } from '@angular/core';
import {FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  valveRegForm:FormGroup | any;
  submited: boolean = false;
  filterForm!:FormGroup;
  valveArray = new Array();
  valveDropdownArray = new Array();
  sgmentDropdownArray = new Array();
  segmentShowArray = new Array();
  editFlag:boolean=false;
  editObj:any;
  yojanaArr = new Array();
  networkArr = new Array();
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  valveId:any;
  id:any;
  valvelabel:any;
  searchFilter:boolean=false;
  getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
  @ViewChild('closebutton') closebutton:any;
  constructor(private apiService: ApiService,public commonService: CommonService,private errorSerivce: ErrorsService ,private localStorage: LocalstorageService,
    private toastrService: ToastrService,private spinner: NgxSpinnerService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.formData();
    this.filterFormField();
    this.getAllValveTableData();      
    this.getAllYojana();
  }

  formData(){
    this.valveRegForm = this.fb.group({      
        "id": [this.editObj ? this.editObj.id :0,Validators.required],
        "valveId":['',Validators.required],
        "segmentId": [''],
        // "segmentId": [this.editFlag ? this.editObj.segmentId :0],
        "yojanaId": ['',Validators.required],
        "networkId": ['',Validators.required],
        "valvesegmet":[]
    })
  }

  get f(){
    return this.valveRegForm.controls;
  }


  filterFormField(){
    this.searchFilter=true;
    this.filterForm = this.fb.group({
      yojanaId : [0],
      networkId : [0]
    })
  }

clearFilter(){
  this.filterFormField();
  this.getAllValveTableData();
  this.networkArr = [];
}

  getAllYojana() {    
    this.apiService.setHttp('get', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getAllLocalStorageData.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200') {
          this.yojanaArr = res.responseData;      
          this.editObj ? (this.f['yojanaId'].setValue(this.editObj.yojanaId), this.getAllNetwork()) : '';          
        } else {
          this.yojanaArr = [];
        }
      }),
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      }
    })
  }

  getAllNetwork() {        
    this.apiService.setHttp('get', 'api/MasterDropdown/GetAllNetwork?YojanaId='+ this.valveRegForm.value.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: ((res: any) => {   
        if (res.statusCode == 200) {
          this.networkArr = res.responseData;        
          this.editObj ? (this.f['networkId'].setValue(this.editObj.networkId), this.getAllvalve(),this.getAllSegment()) : '';
        } else {
          this.networkArr = [];
        }
      }),
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      }
    })
  }
 
  getAllvalve(){   
    this.apiService.setHttp('GET', 'ValveMaster/GetValveNameList?userId='+this.getAllLocalStorageData.userId+'&YojanaId='+ this.valveRegForm.value.yojanaId+'&NetworkId='+this.valveRegForm.value.networkId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.valveDropdownArray = res.responseData;  
          this.editObj ? (this.f['valveId'].setValue(this.editObj.valveId)) : '';  
        }
      },  error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    })

}

getAllSegment(){
      this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllSegmentForValve?YojanaId='+ this.valveRegForm.value.yojanaId+'&NetworkId='+this.valveRegForm.value.networkId, false, false, false, 'valvemgt');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.sgmentDropdownArray = res.responseData;  
            this.editObj ? (this.f['segmentId'].setValue(this.editObj.segmentId)) : '';              
          }
        },  error: (error: any) => {
          this.errorSerivce.handelError(error.status);
        },
      })
  }

  getAllValveTableData(){   
    this.spinner.show();
    this.apiService.setHttp('GET', 'ValveManagement/Valvesegment/GetAllVaveSegments?pageNo='+this.pageNumber+'&pageSize='+this.pagesize+'&yojanaId='+this.filterForm.value.yojanaId+'&networkId='+this.filterForm.value.networkId, false, false, false, 'valvemgt');
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

  addSegment(){  
    if(this.valveRegForm.value.segmentId == ''){
      return;
    }

   let segId= this.valveRegForm.value.segmentId    
   let data= this.sgmentDropdownArray.find((res:any)=>{
      if(res.segmentId == segId){
        return res;
      }
    }) 

    //--------------------clear segment dropdown ------------------------------//
    if( this.segmentShowArray.length > 0 && this.valvelabel == 'valve'){      
      this.segmentShowArray = [];     
      this.f['segmentId'].setValue('');
      this.valvelabel = '';  
    }else{
      this.valvelabel = ''
    }  
  //--------------------clear segment dropdown ------------------------------//

    for(var i=0; i < this.segmentShowArray.length; i++){
      if(this.segmentShowArray[i].segmentId == this.valveRegForm.value.segmentId){
        this.toastrService.success("Dublicate");        
        return
      }
    }
    this.segmentShowArray.push(data);

    this.f['segmentId'].setValue(0); 
  }

  onSubmit(){
    this.submited = true;
    if(this.valveRegForm.invalid){
      return;
    }else{
      let formValue = this.valveRegForm.value
    formValue.valvesegmet = this.segmentShowArray;
    let obj={
      "id": formValue.id,
      "valveId": formValue.valveId,
      "segmentId": 0,
      "isDeleted": false,
      "createdBy": 0,
      "createdDate": new Date(),
      "modifiedBy": 0,
      "modifiedDate": new Date(),
      "timestamp":new Date(),
      "networkId": formValue.networkId,
      "yojanaId":formValue.yojanaId,
      "valvesegmet":this.segmentShowArray
    }
    this.spinner.show();
    this.apiService.setHttp('PUT','ValveManagement/Valvesegment/Updatevalvesegmentassignment',false,obj,false,'valvemgt');
    this.apiService.getHttp().subscribe(
      (res: any) => {
        if (res.statusCode == 200) {
          this.spinner.hide();
          this.toastrService.success(res.statusMessage);  
          this.getAllValveTableData();        
           this.closebutton.nativeElement.click();  
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

  onEdit(obj:any){
    console.log("this.editObj ",obj);
    
    this.editFlag = true
    this.editObj = obj;    
    this.getAllYojana();
    this.segmentShowArray = this.editObj.valvesegmet    
    
  }

  deleteSegment(index:any){
    this.segmentShowArray.splice(index,1);
  }

  clearForm(formDirective:any){
    formDirective?.resetForm();
    this.editFlag = false;
    this.editObj ='';
    this.formData();
    this.segmentShowArray=[];
    this.submited = false;
  }
  clearDropdown(){  
    this.f['segmentId'].setValue('');   
  }

  valvedropdown(label:any){   
    this.valvelabel = label
  }
  onClickPagintion(pageNo: number) {
    this.pageNumber = pageNo;
    this.getAllValveTableData();
  }

  clearFormData(flag:any){
    if(flag == 'yojana'){
      this.valveRegForm.controls['networkId'].setValue('');
      this.valveRegForm.controls['valveId'].setValue('');
      this.valveRegForm.controls['segmentId'].setValue('');
    }else if(flag == ''){
      this.valveRegForm.controls['valvesegmet'].setValue('');
    }else   
    
    
    if(flag == ''){
      this.valveRegForm.controls['yojanaId'].setValue('');

    }else if(flag == ''){
      this.valveRegForm.controls['networkId'].setValue('');
    } else{
      this.valveRegForm.controls['valvesegmet'].setValue('');
    }

  }

}
