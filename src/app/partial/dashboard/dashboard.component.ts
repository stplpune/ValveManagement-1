import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
declare var google: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  valveSummaryArray: any;
  getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
  filterForm: FormGroup | any;
  yoganaIdArray: any;
  networkIdArray: any;
  DeviceCurrentSensorArray:any;
  tankFilterDrop = new FormControl('');
  chartObj:any;

  constructor(
    public commonService: CommonService,
    public apiService: ApiService,
    private toastrService: ToastrService,
    private errorSerivce: ErrorsService,
    private spinner: NgxSpinnerService,
    private localStorage: LocalstorageService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.defaultFilterForm();
    this.getYogana();
    this.getValveSummary();
    // this.getValveSegmentList();
    // this.getDeviceCurrentSensorValue();
    this.waterTankChartData();
    this.localStorage.userId() == 1 ? (this.getValveSegmentList(),this.getDeviceCurrentSensorValue()) : '';
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      yojanaId: [''],
      networkId: [''],
      searchText: ['']
    })
  }

  clearFilter(flag: any) {
    if (flag == 'yojana') {
      this.filterForm.controls['networkId'].setValue('');
    } else if (flag == 'network') {
    } 
    this.tankFilterDrop.setValue('');
    this.getDeviceCurrentSensorValue();
    // this.editPatchShape.setMap(null);
    this.editPatchShape = undefined
    // this.getValveSegmentList();
  }
  getYogana() {
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getAllLocalStorageData.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.yoganaIdArray = res.responseData;
        this.yoganaIdArray?.length == 1 ? (this.filterForm.patchValue({ yojanaId: this.yoganaIdArray[0].yojanaId }), this.getNetwork()) : '';
      }
      else {
        this.yoganaIdArray = [];
        this.toastrService.error(res.statusMessage);
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
        this.networkIdArray?.length == 1 ? (this.filterForm.patchValue({ networkId: this.networkIdArray[0].networkId }), this.getValveSegmentList(),this.getDeviceCurrentSensorValue()) : '';
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


  getValveSummary() {
    this.spinner.show();
    this.apiService.setHttp('get', "ValveMaster/GetValveSummary?UserId=" + this.localStorage.userId(), false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.spinner.hide();
          this.valveSummaryArray = res.responseData;
        } else {
          this.spinner.hide();
          this.valveSummaryArray = [];
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : this.toastrService.error(res.statusMessage);
        }
      },
      error: ((error: any) => { this.errorSerivce.handelError(error.status), this.spinner.hide(); })
    });
  }

  getDeviceCurrentSensorValue() {
    this.apiService.setHttp('get', "DeviceInfo/GetDeviceCurrentSensorValue?YojanaId=" + (this.filterForm.value.yojanaId || 0) + '&NetworkId=' + (this.filterForm.value.networkId || 0), false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.DeviceCurrentSensorArray = res.responseData;
        } else {
          this.DeviceCurrentSensorArray = [];
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : this.toastrService.error(res.statusMessage);
        }
      },
      error: ((error: any) => { this.errorSerivce.handelError(error.status) })
    });
  }

  filterTankData(obj:any){ // percentage   tankName
    this.waterTankChartData(obj[0]?.data);
  }

  waterTankChartData(data?: any) {
    this.chartObj = data;
    let chartData = data ? [{"category": data.tankName,"value1": data.percentage,"value2": 100}] :  [{"category": "","value1": 0,"value2": 100}];

    am4core.useTheme(am4themes_animated);
    am4core.addLicense("ch-custom-attribution");

    // Create chart instance
    let chart = am4core.create("valveCylenderChart", am4charts.XYChart3D);
    chart.titles.create().text = "Water reserves";
    chart.data = chartData;

    // Create axes
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.grid.template.strokeOpacity = 0;
    
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.grid.template.strokeOpacity = 0;
    valueAxis.min = -10;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.renderer.baseGrid.disabled = true;
    valueAxis.renderer.labels.template.adapter.add("text", function(text:any) {
      if ((text > 100) || (text < 0)) { return "";}
      else { return text + "%";}
    })
    
    // Create series
    let series1 = chart.series.push(new am4charts.ConeSeries());
    series1.dataFields.valueY = "value1";
    series1.dataFields.categoryX = "category";
    series1.columns.template.width = am4core.percent(80);
    series1.columns.template.fillOpacity = 0.9;
    series1.columns.template.strokeOpacity = 1;
    series1.columns.template.strokeWidth = 2;
    
    let series2 = chart.series.push(new am4charts.ConeSeries());
    series2.dataFields.valueY = "value2";
    series2.dataFields.categoryX = "category";
    series2.stacked = true;
    series2.columns.template.width = am4core.percent(80);
    series2.columns.template.fill = am4core.color("#000");
    series2.columns.template.fillOpacity = 0.1;
    series2.columns.template.stroke = am4core.color("#000");
    series2.columns.template.strokeOpacity = 0.2;
    series2.columns.template.strokeWidth = 2;
    
  }

  //..................................................... new Code StartHere ..................... ...............//

  valveSegmentList:any;
  zoom = 6;
  editPatchShape: undefined | any;
  tank_ValveArray: any;
  getAllSegmentArray: any[] = [];
  map: any;

  markerArray: any;

  getValveSegmentList() { //All Segment 
    this.spinner.show();
    let obj: any = 'YojanaId=' + (this.filterForm.value.yojanaId || 0) + '&NetworkId=' + (this.filterForm.value.networkId || 0)
      + '&userId=' + this.localStorage.userId();
    this.apiService.setHttp('get', 'api/SegmentMaster/GetValveSegmentList?' + obj, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.valveSegmentList = res.responseData[0];
          this.valveSegPatchData(this.valveSegmentList);
        } else {
          this.spinner.hide();
          this.valveSegmentList = [];
          this.valveSegmentList = '';
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }


  valveSegPatchData(mainArray: any) {
    this.markerArray = mainArray.segmenDetailsModels.map((ele: any) => { //Marker show Code
      return ele = { latitude: ele.startPoints.split(' ')[0], longitude: ele.startPoints.split(' ')[1], label: ele.segmentName };
    })

    mainArray.tankDetailsModels.map((ele: any) => { // Insert Tank Img
      ele['iconUrl'] = "../../../../assets/images/waterTank2.png"; return ele
    })

    mainArray.valveDetailModels.map((ele: any) => { // Insert valve Img
      ele['iconUrl'] = "../../../../assets/images/valve.png"; return ele
    })

    this.tank_ValveArray = mainArray.tankDetailsModels.concat(mainArray.valveDetailModels);

    this.getAllSegmentArray = mainArray.segmenDetailsModels.map((ele: any) => {
      let stringtoArray = ele.midpoints.split(',');
      let finalLatLngArray = stringtoArray.map((ele: any) => { return ele = { lat: Number(ele.split(' ')[0]), lng: Number(ele.split(' ')[1]) } });
      return ele = finalLatLngArray;
    })

    this.onMapReady(this.map);
  }

  onMapReady(map: any) {
    this.map = map;
    this.getAllSegmentArray?.map((ele: any) => {
      this.editPatchShape = new google.maps.Polyline({
        path: ele,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        icons: [{ icon: this.commonService.lineSymbol, offset: '25px', repeat: '100px' }]
      });
      this.editPatchShape.setMap(this.map);
    })
    let latLng = this.commonService.FN_CN_poly2latLang(this.editPatchShape);
    this.map.setCenter(latLng);
  }


}
