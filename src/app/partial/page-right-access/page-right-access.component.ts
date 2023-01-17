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
  getLoginData!:number |any;
  userTypeId = new FormControl('');
  constructor(private apiService:ApiService,
    private toastrService:ToastrService,
    private errorSerivce:ErrorsService,
    private localStorage:LocalstorageService) { }

  ngOnInit(): void {
    this.getAllPages();
    this.getUserType();
    this.getLoginData=this.localStorage.getLoggedInLocalstorageData();
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
    this.pageNameArray=[
      {pageName:'Dashboard',pageUrl:'dashboard',access:true},
      {pageName:'Master',pageUrl:'master',access:false},
      {pageName:'Valva',pageUrl:'valva',access:true}
    ]
  }
  addPage(pageData:any,event:any){
    console.log(event.target.checked);
    /* [
      {
        "pageId": 0,
        "pageName": "string",
        "readRights": 0,
        "writeRights": 0,
        "userTypeId": 0
      }
    ] */
  }
}
