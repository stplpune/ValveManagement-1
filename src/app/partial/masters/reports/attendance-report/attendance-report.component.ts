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

@Component({
  selector: 'app-attendance-report',
  templateUrl: './attendance-report.component.html',
  styleUrls: ['./attendance-report.component.css']
})
export class AttendanceReportComponent implements OnInit {


  filterForm: FormGroup | any;
  getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
  yoganaArray:any;
  attendanceArray:any;
  attendanceCountArray:any;
  maxDate = new Date();
  dateRange: any;
  defaultCloseBtn: boolean = false;
  dailyAttendanceType = 1;
  employeelistArray:any;

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
    this.dateRange = [this.maxDate, this.maxDate];
    this.defaultFilterForm();
    this.getYogana();
    this.getAttendenceReport();
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      yojanaId: [this.localStorage.userId() == 1 ? '' : this.getAllLocalStorageData.yojanaId],
      employee: [''], 
      singleDate: [this.maxDate],
      fromTo: [this.dateRange],
    })
  }

  // subtractOneMontFromToDate(){
  //   function subtractMonths(numOfMonths: number, date = new Date()) {
  //     date.setMonth(date.getMonth() - numOfMonths);
  //     return date;
  //   }
  //   const date = new Date();
  //  return subtractMonths(1, date);
  // }

  getYogana() {
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getAllLocalStorageData.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.yoganaArray = res.responseData;
        this.yoganaArray?.length == 1 ? (this.filterForm.patchValue({ yojanaId: this.yoganaArray[0].yojanaId })) : '';
     }
      else {
        this.yoganaArray = [];
        this.toastrService.error(res.statusMessage);
      }
    },
      (error: any) => {
        this.errorSerivce.handelError(error.status);
      })
  }

  getEmployeelist() {
    this.apiService.setHttp('GET', 'Attendance/GetEmployeelist?YojanaId=' + this.getAllLocalStorageData.yojanaId + '&UserId=' + this.localStorage.userId(), false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.employeelistArray = res.responseData;
        // this.employeelistArray?.length == 1 ? (this.filterForm.patchValue({ employee: this.employeelistArray[0].userId })) : '';
     }
      else {
        this.employeelistArray = [];
        this.toastrService.error(res.statusMessage);
      }
    },
      (error: any) => {
        this.errorSerivce.handelError(error.status);
      })
  }

  getAttendenceReport(){
    this.spinner.show();
    let formData = this.filterForm.value;  
    let FromDate = this.dailyAttendanceType == 1 ? this.datePipe.transform(formData.singleDate, 'yyyy/MM/dd') : this.datePipe.transform(formData.fromTo[0], 'yyyy/MM/dd');
    let ToDate = this.dailyAttendanceType == 1 ? this.datePipe.transform(formData.singleDate, 'yyyy/MM/dd') : this.datePipe.transform(formData.fromTo[1], 'yyyy/MM/dd');
    let obj = this.localStorage.userId() +  '&YojanaId=' + (formData.yojanaId || this.getAllLocalStorageData.yojanaId) + '&FromDate=' + FromDate
    + '&ToDate=' + ToDate + '&EmpId=' + (this.dailyAttendanceType == 1 ? 0 : formData.employee);
    this.apiService.setHttp('get', 'Attendance/GetDatewiseAttendenceReport?UserId=' + obj, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.attendanceArray = res.responseData.responseData1;
          this.attendanceCountArray = res.responseData?.responseData2;
        } else {
          this.spinner.hide();
          this.attendanceArray = [];
          this.attendanceCountArray = [];
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  clearFilter(flag: any) {
    if (flag == 'yojana') {
      this.filterForm.controls['employee'].setValue(0);
    } 
    this.getAttendenceReport();
  }

}
