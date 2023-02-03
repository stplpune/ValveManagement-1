import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { DatePipe } from '@angular/common';

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
  maxDate = new Date();
  dateRange: any;
  defaultCloseBtn: boolean = false;

  constructor(
    private fb: FormBuilder,
    public commonService: CommonService,
    public apiService: ApiService,
    private toastrService: ToastrService,
    private errorSerivce: ErrorsService,
    private spinner: NgxSpinnerService,
    private localStorage: LocalstorageService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.dateRange = [this.maxDate, this.maxDate];
    this.defaultFilterForm();
    this.getYogana();
    this.getAttendenceReport();
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      yojanaId: [''],
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

  getAttendenceReport(){
    this.spinner.show();
    let obj = this.localStorage.userId() +  '&YojanaId=' + (this.filterForm.value.yojanaId || this.getAllLocalStorageData.yojanaId) + '&FromDate=' + this.datePipe.transform(this.filterForm.value.fromTo[0], 'yyyy/MM/dd')
    + '&ToDate=' + this.datePipe.transform(this.filterForm.value.fromTo[1], 'yyyy/MM/dd');
    this.apiService.setHttp('get', 'Attendance/GetAttendenceReport?UserId=' + obj, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.attendanceArray = res.responseData;
        } else {
          this.spinner.hide();
          this.attendanceArray = [];
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
      // this.filterForm.controls['networkId'].setValue('');
    } else if (flag == 'network') {
    }
    this.getAttendenceReport();
  }

}
