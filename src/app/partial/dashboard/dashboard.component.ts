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

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  valveSummaryArray: any;
  lat: any = 19.7515;
  lng: any = 75.7139;

  constructor(
    public commonService: CommonService,
    public apiService: ApiService,
    private toastrService: ToastrService,
    private errorSerivce: ErrorsService,
    private spinner: NgxSpinnerService,
    private localStorage: LocalstorageService,
  ) { }

  ngOnInit(): void {
    this.getValveSummary();
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
          case 'totalOn': ele.Category = 'Total On' ;return;
          case 'totalOff': ele.Category = 'Total Off' ;return;
          case 'totalWaitedOn': ele.Category = 'Total Waited On' ;return;
          case 'totalWaitedOff': ele.Category = 'Total Waited Off' ;return;
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

}
