import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';

@Component({
  selector: 'app-page-right-access',
  templateUrl: './page-right-access.component.html',
  styleUrls: ['./page-right-access.component.css']
})
export class PageRightAccessComponent implements OnInit {
  pageNameArray=new Array();
  userTypeArray=new Array();
  getLoginData:any;
  pageNumber:number=1;
  pageSize:number=10;
  totalCount!:number;
  userTypeId = new FormControl('');
  constructor(private apiService:ApiService,
    private toastrService:ToastrService,
    private errorSerivce:ErrorsService,
    private localStorage:LocalstorageService) { }

  ngOnInit(): void {
    this.getLoginData=this.localStorage.getLoggedInLocalstorageData();
    this.getAllPages();
    this.getUserType();
  }
  getUserType(){
    this.apiService.setHttp('GET', 'UserRegistration/GetUserTypeList?UserId='+this.getLoginData.userId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res:any)=>{
      if(res.statusCode=="200"){
        this.userTypeArray=res.responseData;
      }
      else{
        this.userTypeArray=[];
        this.toastrService.error(res.statusMessage);
      }
    },
    (error: any) => {
      this.errorSerivce.handelError(error.status);
    })
  }

  getAllPages(){
  this.apiService.setHttp('GET', 'UserRegistration/GetPageDetails?pageNo='+this.pageNumber+'&pageSize='+this.pageSize+'&userTypeId='+(this.userTypeId.value?this.userTypeId.value:0), false, false, false, 'valvemgt');
  this.apiService.getHttp().subscribe((res:any)=>{
    if(res.statusCode=="200"){
      this.pageNameArray=res.responseData.responseData1;
      this.totalCount=res.responseData.responseData2.pageCount;
    }
    else{
      this.toastrService.error(res.statusMessage);
    }
  },
  (error: any) => {
    this.errorSerivce.handelError(error.status);
  })
  }

  addPage(pageData:any,event:any){
    let obj={
      "pageId": pageData.pageId,
      "readWriteAccess": event.target.checked==true ? 1: 0,
      "userTypeId":this.userTypeId.value?this.userTypeId.value:0,
      "userId": this.getLoginData.userId
    }
    this.apiService.setHttp('POST', 'UserRegistration/SaveUserRights', false, obj, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res:any)=>{
      if(res.statusCode=="200"){
        this.toastrService.success(res.statusMessage);
        this.getAllPages();
      }
      else{
        this.toastrService.error(res.statusMessage);
      }
    },
    (error: any) => {
      this.errorSerivce.handelError(error.status);
    })
  }

  pagination(event:any){
    this.pageNumber=event;
    this.getAllPages();
  }
}
