import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { log } from 'console';
import { filter } from 'rxjs';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit{

  pageListArray = new Array();
  loginPages = new Array();
  selectedIndex:any;
  currentPageUrl:any;

  constructor( 
    private router: Router,
    private localstorage:LocalstorageService
  ){ 
    this.currentPageUrl = this.router.url?.split('/')[1];
    let data: any = this.localstorage.getAllPageName();
    this.sideBarMenu(data);
  }

  ngOnInit(): void{
    this.breadCrumbOnNavigationEnd();
  }

  sideBarMenu(data: any){
    this.loginPages = [];
    let items: any = data?.filter((ele: any) =>{
      if(ele.isSideBarMenu == true){
        return ele;
      }
    })
    items?.forEach((item: any) => {
      let existing: any = this.loginPages.filter((v: any) => { return v.module == item.module });

      if(existing.length){
        let existingIndex: any = this.loginPages.indexOf(existing[0]);
        this.loginPages[existingIndex].pageURL = this.loginPages[existingIndex].pageURL.concat(item.pageURL);
        this.loginPages[existingIndex].pageName = this.loginPages[existingIndex].pageName.concat(item.pageName);
      } else{
        if(typeof item.pageName == 'string')
          item.pageURL = [item.pageURL];
        item.pageName = [item.pageName];
        this.loginPages.push(item);
      }
    });

    this.defaultSelIndex();
  }

  defaultSelIndex(){
    this.loginPages?.map((ele:any , i:any)=>{ ele.pageURL?.map((res:any)=> {  // for default open selected menu
      (res == this.currentPageUrl) ? this.selectedIndex = i : '';
     }) })
  }

  breadCrumbOnNavigationEnd() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.currentPageUrl = this.router.url?.split('/')[1];
      this.defaultSelIndex();
    });
  }

  }

