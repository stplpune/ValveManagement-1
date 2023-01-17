import { Component, OnInit, ViewChild } from '@angular/core';
import {FormBuilder, FormGroup } from '@angular/forms';
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

  valveRegForm!:FormGroup;
  valveArray = new Array();
  valveDropdownArray = new Array();
  sgmentDropdownArray = new Array();
  segmentShowArray = new Array();
  editFlag:boolean=false;
  editObj:any;
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
  @ViewChild('closebutton') closebutton:any;
  constructor(private apiService: ApiService,public commonService: CommonService,private errorSerivce: ErrorsService ,private localStorage: LocalstorageService,
    private toastrService: ToastrService,private spinner: NgxSpinnerService,
    private fb: FormBuilder) { }

    get f(){
      return this.valveRegForm.controls;
    }
  ngOnInit(): void {
    this.formData();
    this.getAllValveTableData();
    console.log("localstorage",this.getAllLocalStorageData);
    this.getAllvalve();
    this.getAllSegment();
    
  }

  formData(){
    this.valveRegForm = this.fb.group({      
        "id": [this.editObj ? this.editObj.id :0],
        "valveId":[this.editObj ? this.editObj.valveId :0],
        "segmentId": [0],
        // "segmentId": [this.editFlag ? this.editObj.segmentId :0],
        "valvesegmet":[]
    })
  }
 
  getAllvalve(){
    // ValveMaster/GetValveNameList?userId=1&YojanaId=1&NetworkId=1
    this.apiService.setHttp('GET', 'ValveMaster/GetValveNameList?userId='+this.getAllLocalStorageData.userId+'&YojanaId='+ this.getAllLocalStorageData.yojanaId+'&NetworkId='+this.getAllLocalStorageData.networkId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.valveDropdownArray = res.responseData;
          // console.log("valveDropdownArray",this.valveDropdownArray);
          
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
            // console.log("sagment",this.sgmentDropdownArray);    
          }
        },  error: (error: any) => {
          this.errorSerivce.handelError(error.status);
        },
      })
  }

  getAllValveTableData(){   
    this.spinner.show();
    this.apiService.setHttp('GET', 'ValveManagement/Valvesegment/GetAllVaveSegments?pageNo='+this.pageNumber+'&pageSize='+this.pagesize+'&yojanaId='+this.getAllLocalStorageData.yojanaId+'&networkId='+this.getAllLocalStorageData.networkId, false, false, false, 'valvemgt');
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
   let segId= this.valveRegForm.value.segmentId    
   let data= this.sgmentDropdownArray.find((res:any)=>{
      if(res.segmentId == segId){
        return res;
      }
    })   
    for(var i=0; i < this.segmentShowArray.length; i++){
      if(this.segmentShowArray[i].segmentId == this.valveRegForm.value.segmentId){
        this.toastrService.success("Dublicate");        
        return
      }
    }
    this.segmentShowArray.push(data) 
  }


  onSubmit(){
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
    console.log("obj",obj);
    
    this.editFlag = true
    this.editObj = obj;
    this.formData();    
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

  }
  clearDropdown(){
    this.f['segmentId'].setValue('');
    // this.segmentShowArray = [];
  }

  onClickPagintion(pageNo: number) {
    this.pageNumber = pageNo;
    this.getAllValveTableData();
   
  }
}
