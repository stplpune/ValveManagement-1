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
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

@Component({
  selector: 'app-valve-water-summery',
  templateUrl: './valve-water-summery.component.html',
  styleUrls: ['./valve-water-summery.component.css']
})
export class ValveWaterSummeryComponent implements OnInit {

  filterForm!: FormGroup | any;
  getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
  valveWaterSummaryArray: any;
  maxDate = new Date();
  defaultFromDate = new Date(Date.now() + -15 * 24 * 60 * 60 * 1000);
  dateRange: any;
  yoganaArray: any;
  networkIdArray: any;
  defaultCloseBtn: boolean = false;
  waterTimeSumryChartHide: boolean = false;


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
    this.getYogana();
    this.localStorage.userId() == 1 ? this.getValveWaterSummary() : '';
  }

  filter_Form() {
    this.filterForm = this.fb.group({
      yojanaId: [''],
      networkId: [''],
      fromTo: [this.dateRange],
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
        this.networkIdArray = res.responseData;
        this.networkIdArray?.length == 1 ? (this.filterForm.patchValue({ networkId: this.networkIdArray[0].networkId }), this.getValveWaterSummary()) : '';
        (this.yoganaArray?.length == 1 && this.networkIdArray?.length != 1) ? this.getValveWaterSummary() : '';
      }
      else {
        this.networkIdArray = [];
        this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
      }
    },
      (error: any) => {
        this.errorSerivce.handelError(error.status);
      })
  }

  getValveWaterSummary() {
    let formData = this.filterForm.value;
    let FromDate = this.datePipe.transform(formData.fromTo[0], 'yyyy/MM/dd');
    let ToDate = this.datePipe.transform(formData.fromTo[1], 'yyyy/MM/dd');
    let obj = this.localStorage.userId() + '&NetworkId=' + (formData.networkId || 0) + '&YojanaId=' + (formData.yojanaId || this.getAllLocalStorageData.yojanaId) 
    + '&FromDate=' + FromDate + '&ToDate=' + ToDate;
    this.spinner.show();
    this.apiService.setHttp('GET', 'ValveDetails/GetValveWaterSummary?UserId=' + obj, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.spinner.hide();
        this.valveWaterSummaryArray = res.responseData;
        this.chartData(this.valveWaterSummaryArray);
      }
      else {
        this.valveWaterSummaryArray = [];
        this.spinner.hide();
        this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
      }
    },
      (error: any) => {
        this.spinner.hide();
        this.errorSerivce.handelError(error.status);
      })
  }

  clearFilter(flag: any) {
    if (flag == 'yojana') {
      this.filterForm.controls['networkId'].setValue('');
    } else if (flag == 'date') {
      this.filterForm.controls['fromTo'].setValue([this.defaultFromDate, this.maxDate]);
      this.defaultCloseBtn = false;
    }
    this.waterTimeSumryChartHide = false;
    this.getValveWaterSummary();
  }

  toHoursAndMinutes(totalMinutes: any) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let finalString = hours + 'h:' + minutes + 'm'
    return finalString;
  }

  minutesToSecond(minutes: any) {
    return minutes * 60;
  }

  chartData(MyData: any) {

    MyData.map((ele: any) => {
      ele['inHours_Min'] = this.toHoursAndMinutes(ele?.valveTotalTime || 0);
      ele['valveTotalTime'] = this.minutesToSecond(ele?.valveTotalTime || 0);
    })

    am4core.useTheme(am4themes_animated);
    am4core.addLicense("ch-custom-attribution");
    // Themes end

    // Create chart instance
    let chart = am4core.create("chartdiv", am4charts.XYChart);

    chart.scrollbarX = new am4core.Scrollbar();
    chart.scrollbarX.interactionsEnabled = false;

    chart.data = MyData;

    // Create axes
    let categoryAxis: any = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "valveName";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.renderer.labels.template.horizontalCenter = "right";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.renderer.labels.template.rotation = 270;
    categoryAxis.tooltip.disabled = true;
    categoryAxis.renderer.minHeight = 110;

    var yAxis = chart.yAxes.push(new am4charts.DurationAxis());
    yAxis.baseUnit = "second";
    yAxis.title.text = "valve Total Time";
    yAxis.min = 0;

    // Create series
    let series: any = chart.series.push(new am4charts.ColumnSeries());
    series.sequencedInterpolation = true;
    series.dataFields.valueY = "valveTotalTime";
    series.dataFields.categoryX = "valveName";
    // series.tooltipText = "[{categoryX}: bold]{valueY}[/]";
    series.columns.template.strokeWidth = 0;
    series.tooltip.pointerOrientation = "vertical";

    series.columns.template.column.cornerRadiusTopLeft = 10;
    series.columns.template.column.cornerRadiusTopRight = 10;
    series.columns.template.column.fillOpacity = 0.8;

    series.tooltipHTML = `<center><strong>Total Time : {inHours_Min}</strong></center>
    <div>No. Of Connections : {noOfConnection}</div>
    <div>No. of Consumers : {noOfCustomer}</div>`;

    series.columns.template.events.on("hit", (ev: any) => { //ev.target.dataItem._dataContext
      this.waterTimeSumryChartHide = true;
      setTimeout(() => {
        window.scroll(0, 500);
        this.waterTimeSummariesChart(ev.target.dataItem._dataContext.waterTimeSummaries);
      }, 200);
    });

    // on hover, make corner radiuses bigger
    let hoverState = series.columns.template.column.states.create("hover");
    hoverState.properties.cornerRadiusTopLeft = 0;
    hoverState.properties.cornerRadiusTopRight = 0;
    hoverState.properties.fillOpacity = 1;

    series.columns.template.adapter.add("fill", function (fill: any, target: any) {
      return chart.colors.getIndex(target.dataItem.index);
    });

    // Cursor
    chart.cursor = new am4charts.XYCursor();

    chart.durationFormatter.durationFormat = "hh':'mm";
  }

  waterTimeSummariesChart(ResArray: any) {
  
    ResArray.map((ele: any) => {
      ele['inHours_Min'] = this.toHoursAndMinutes(ele?.totalTime || 0);
      ele['totalTime1'] = this.minutesToSecond(ele?.totalTime || 0);
      //  ele['statusDate'] = ele.statusDate.toString();
    })

    am4core.useTheme(am4themes_animated);
    am4core.addLicense("ch-custom-attribution");
    // Themes end

    // Create chart instance
    let chart = am4core.create("waterTimeSummariesChart", am4charts.XYChart);

    chart.scrollbarX = new am4core.Scrollbar();
    chart.scrollbarX.interactionsEnabled = false;

    chart.data = ResArray;

    chart.events.on("beforedatavalidated", function () {
      for (var i = 0; i < chart.data.length; i++) {
        chart.data[i].statusDate += " (" + i + ")";
      }
    });

    let categoryAxis:any = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "statusDate";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.renderer.labels.template.horizontalCenter = "right";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.renderer.labels.template.rotation = 270;
    categoryAxis.renderer.minHeight = 110;
    categoryAxis.tooltip.disabled = true;
    

    categoryAxis.renderer.labels.template.adapter.add("textOutput", function (text:any) {
      return text.replace(/ \(.*/, "");
    });

    var yAxis = chart.yAxes.push(new am4charts.DurationAxis());
    yAxis.baseUnit = "second";
    yAxis.title.text = "total Time";
    yAxis.min = 0;

    // Create series
    let series: any = chart.series.push(new am4charts.ColumnSeries());
    series.sequencedInterpolation = true;
    series.dataFields.valueY = "totalTime1";
    series.dataFields.categoryX = "statusDate";
    series.columns.template.strokeWidth = 0;
    series.tooltip.pointerOrientation = "vertical";
    series.columns.template.column.cornerRadiusTopLeft = 10;
    series.columns.template.column.cornerRadiusTopRight = 10;
    series.columns.template.column.fillOpacity = 0.8;

    series.tooltipHTML = `<center><strong>Total Time : {inHours_Min}</strong></center>
    <div>Start Time : {startTime}</div>
    <div>End Time : {endTime}</div>`;

    // on hover, make corner radiuses bigger
    let hoverState = series.columns.template.column.states.create("hover");
    hoverState.properties.cornerRadiusTopLeft = 0;
    hoverState.properties.cornerRadiusTopRight = 0;
    hoverState.properties.fillOpacity = 1;

    series.columns.template.adapter.add("fill", function (fill: any, target: any) {
      return chart.colors.getIndex(target.dataItem.index);
    });

    // Cursor
    chart.cursor = new am4charts.XYCursor();
    chart.durationFormatter.durationFormat = "hh':'mm";
  }

}
