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
    this.getValveSegmentList();
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
        this.networkIdArray?.length == 1 ? (this.filterForm.patchValue({ networkId: this.networkIdArray[0].networkId }), this.getValveSegmentList()) : '';
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
          let valveSummaryArray = JSON.parse(JSON.stringify(this.valveSummaryArray))
          this.piechartData(valveSummaryArray);
        } else {
          this.spinner.hide();
          this.valveSummaryArray = [];
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : this.toastrService.error(res.statusMessage);
        }
      },
      error: ((error: any) => { this.errorSerivce.handelError(error.status), this.spinner.hide(); })
    });
  }

  piechartData(chartArray: any) {
    let valveChart: any[] = [];
    delete chartArray['totalValve']
    Object.keys(chartArray).forEach(key => {
      valveChart.push({ 'Category': key, 'categoryCount': chartArray[key] })
    })

    valveChart.map((ele:any)=>{
      switch(ele.Category){
          case 'totalOn': ele.Category = 'On' ;return;
          case 'totalOff': ele.Category = 'Off' ;return;
          case 'totalWaitedOn': ele.Category = 'Waited On' ;return;
          case 'totalWaitedOff': ele.Category = 'Waited Off' ;return;
      }
    })

    am4core.useTheme(am4themes_animated);

    // Create chart instance
    let chart = am4core.create("valvePiChart", am4charts.PieChart);
    // Add and configure Series
    let pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.colors.list = [
      am4core.color("#80DEEA"),
      am4core.color("#FF8A65"),
      am4core.color("#E57373"),
      am4core.color("rgb(205, 130, 184)"),
      am4core.color("#4DB6AC"),
    ];

    pieSeries.dataFields.value = "categoryCount";
    pieSeries.dataFields.category = "Category";

    // Put a thick white border around each Slice
    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.slices.template.strokeWidth = 2;
    pieSeries.slices.template.strokeOpacity = 1;
    pieSeries.slices.template
      .cursorOverStyle = [
        {
          "property": "cursor",
          "value": "pointer"
        }
      ];

    // Create a base filter effect (as if it's not there) for the hover to return to
    let shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
    shadow.opacity = 0;

    // Create hover state
    let hoverState: any = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists

    // Slightly shift the shadow and make it more prominent on hover
    let hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
    hoverShadow.opacity = 0.7;
    hoverShadow.blur = 5;
    chart.radius = am4core.percent(90);
    // Add a legend
    chart.legend = new am4charts.Legend();
    chart.legend.maxWidth = 100;
    chart.legend.fontSize = 14;
    chart.legend.scrollable = true;
    chart.legend.position = "bottom";
    chart.legend.contentAlign = "right";

    let markerTemplate = chart.legend.markers.template;
    markerTemplate.width = 15;
    markerTemplate.height = 15;
    pieSeries.labels.template.disabled = true;
    chart.data = valveChart;
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
    this.getAllSegmentArray.map((ele: any) => {
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
