import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { DatePipe } from '@angular/common';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { debounceTime, Subject } from 'rxjs';


@Component({
  selector: 'app-consumer-water-summery',
  templateUrl: './consumer-water-summery.component.html',
  styleUrls: ['./consumer-water-summery.component.css']
})
export class ConsumerWaterSummeryComponent implements OnInit {

  filterForm!: FormGroup | any;
  getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
  getConsumerListArray: any;
  yoganaArray: any;
  networkArray: any;
  pageNumber: number = 1; 
  pagesize: number = 10;
  totalRows: any;
  valveDetailsId:any;
  heighLightRow:any;

  maxDate = new Date();
  defaultFromDate = new Date(Date.now() + -15 * 24 * 60 * 60 * 1000);
  dateRange: any;
  defaultCloseBtn: boolean = false;
  subject: Subject<any> = new Subject();

  isHaveTapArray = [{'id':2,'name':'All'},{'id':1,'name':'Yes'},{'id':0,'name':'No'}];
  isHaveMotarArray = [{'id':2,'name':'All'},{'id':1,'name':'Yes'},{'id':0,'name':'No'}];

  summeryFilterForm!: FormGroup | any;
  consumerWaterSummaryArray:any;

  constructor(
    private fb: FormBuilder,
    public commonService: CommonService,
    public apiService: ApiService,
    private toastrService: ToastrService,
    private errorSerivce: ErrorsService,
    private spinner: NgxSpinnerService,
    public localStorage: LocalstorageService,
    private datePipe: DatePipe,
    public dateTimeAdapter: DateTimeAdapter<any>,
  ) { dateTimeAdapter.setLocale('en-IN'); }

  ngOnInit(): void {
    this.dateRange = [this.defaultFromDate, this.maxDate];
    this.filter_Form();
    this.summery_FilterForm();
    this.getYogana();
    this.localStorage.userId() == 1 ? this.getConsumerList() : '';
    this.searchFilters();
  }

  filter_Form() {
    this.filterForm = this.fb.group({
      yojanaId: [''],
      networkId: [''],
      IsHaveTap: [''],
      IsHaveMotar: [''],
      Search: [''],
    })
  }

  getYogana() {
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getAllLocalStorageData.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.yoganaArray = res.responseData;
        this.yoganaArray?.length == 1 ? (this.filterForm.patchValue({ yojanaId: this.yoganaArray[0].yojanaId }), this.getNetwork()) : '';
      }
      else {
        this.yoganaArray = [];
        this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
      }
    },
      (error: any) => {
        this.errorSerivce.handelError(error.status);
      })
  }

  getNetwork() {
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllNetworkbyUserId?YojanaId=' + this.filterForm.value.yojanaId + '&UserId=' + this.localStorage.userId(), false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.networkArray = res.responseData;
        this.networkArray?.length == 1 ? (this.filterForm.patchValue({ networkId: this.networkArray[0].networkId }), this.getConsumerList()) : '';
        (this.yoganaArray?.length == 1 && this.networkArray?.length != 1) ? this.getConsumerList() : '';
      }
      else {
        this.networkArray = [];
        this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
      }
    },
      (error: any) => {
        this.errorSerivce.handelError(error.status);
      })
  }

  getConsumerList() {
    let formData = this.filterForm.value;
    let obj = this.localStorage.userId() + '&NetworkId=' + (formData.networkId || 0) + '&YojanaId=' + (formData.yojanaId || this.getAllLocalStorageData.yojanaId)
    + '&pageno=' + this.pageNumber + '&pagesize=' + this.pagesize + '&ValveDetailsId=' + 0 + '&IsHaveTap=' + (formData.IsHaveTap || 2) + '&IsHaveMotar=' + (formData.IsHaveMotar || 2) + '&Search=' + formData.Search?.trim();
    this.spinner.show();
    this.apiService.setHttp('GET', 'ValveConnection/GetConsumerList?UserId=' + obj, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.spinner.hide();
        this.getConsumerListArray = res.responseData.responseData1;
        this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;
      }
      else {
        this.getConsumerListArray = [];
        this.spinner.hide();
        this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
      }
    },
      (error: any) => {
        this.spinner.hide();
        this.errorSerivce.handelError(error.status);
      })
  }

  onClickPagintion(pageNo: number) {
    this.pageNumber = pageNo;
    this.getConsumerList();
  }

  onKeyUpFilter() {
    this.subject.next(true);
  }

  searchFilters() {
    this.subject.pipe(debounceTime(700))
      .subscribe(() => {
        this.filterForm.value.Search;
        this.pageNumber = 1;
        this.getConsumerList();
      });
  }

  clearFilter(flag: any) {
    if (flag == 'yojana') {
      this.filterForm.controls['networkId'].setValue('');
    } else if (flag == 'network') {

    } else if (flag == 'search') {
      this.filterForm.controls['Search'].setValue('');
    }
    this.getConsumerList();
  }

  ////////////////////////....................................Model Code Start Here..................................//////////////////////////


  summery_FilterForm() {
    this.summeryFilterForm = this.fb.group({
      fromTo: [this.dateRange],
    })
  }

  getConsumerWaterSummary(valveDetailsId?:any) {
    this.valveDetailsId = valveDetailsId;
    let formData = this.filterForm.value;
    let summeryFormData = this.summeryFilterForm.value;
    let FromDate = this.datePipe.transform(summeryFormData.fromTo[0], 'yyyy/MM/dd');
    let ToDate = this.datePipe.transform(summeryFormData.fromTo[1], 'yyyy/MM/dd');
    let obj = this.localStorage.userId() + '&NetworkId=' + (formData.networkId || 0) + '&YojanaId=' + (formData.yojanaId || this.getAllLocalStorageData.yojanaId)
    + '&ValveDetailsId=' + (this.valveDetailsId || 0) + '&FromDate=' + FromDate + '&ToDate=' + ToDate;
    this.spinner.show();
    this.apiService.setHttp('GET', 'ValveConnection/GetConsumerWaterSummary?UserId=' + obj, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.spinner.hide();
        this.consumerWaterSummaryArray = res.responseData;
      }
      else {
        this.consumerWaterSummaryArray = [];
        this.spinner.hide();
        this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
      }
    },
      (error: any) => {
        this.spinner.hide();
        this.errorSerivce.handelError(error.status);
      })
  }

  closeModelSummery(){
    this.summeryFilterForm.controls['fromTo'].setValue([this.defaultFromDate, this.maxDate]);
  }

  // clearDate(){
  //   this.filterForm.controls['fromTo'].setValue([this.maxDate, this.maxDate]);
  //   this.defaultCloseBtn = false;
  //   this.getConsumerWaterSummary();
  // }


}
