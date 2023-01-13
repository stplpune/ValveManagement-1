import { Component, OnInit, Inject, NgZone, ViewChild } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-segment-master',
  templateUrl: './segment-master.component.html',
  styleUrls: ['./segment-master.component.css']
})
export class SegmentMasterComponent implements OnInit {

  segmentMasterArray: any;
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
  deleteSegmentId: any;
  @ViewChild('addSegmentModel') addSegmentModel: any;
  map:any;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    public commonService: CommonService,
    public apiService: ApiService,
    private toastrService: ToastrService,
    private errorSerivce: ErrorsService,
    private spinner: NgxSpinnerService,
    private localStorage: LocalstorageService,
    private ngZone: NgZone,
    private fb: FormBuilder,
  ) { }


  ngOnInit(): void {
    this.getAllSegmentMaster();
  }

  getAllSegmentMaster() {
    this.spinner.show();
    let obj: any = 'YojanaId=' + this.getAllLocalStorageData.yojanaId + '&NetworkId=' + this.getAllLocalStorageData.networkId;
    this.apiService.setHttp('get', 'api/SegmentMaster/GetAll?' + obj, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.segmentMasterArray = res.responseData.responseData1;
          this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;
        } else {
          this.spinner.hide();
          this.segmentMasterArray = [];
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  onClickPagintion(pageNo: number) {
    this.pageNumber = pageNo;
    this.getAllSegmentMaster();
  }

  onSubmit() {
      let obj = {
        "id": 0,
        "segmentName": "string",
        "startPoints": "string",
        "endPoints": "string",
        "midpoints": "string",
        "createdBy": this.localStorage.userId(),
        "createdDate": new Date(),
        "modifiedby": this.localStorage.userId(),
        "modifiedDate": new Date(),
        "isDeleted": false,
        "timestamp": new Date(),
        "yojanaId": this.getAllLocalStorageData.yojanaId,
        "networkId": this.getAllLocalStorageData.networkId
      }

      this.spinner.show();
      
      let id:any;
      let urlType = id == 0 ? 'POST' : 'PUT';
      let UrlName = id == 0 ? 'api/SegmentMaster/Add' : 'api/SegmentMaster/Update';
      this.apiService.setHttp(urlType,UrlName,false,JSON.stringify(obj),false,'valvemgt');
      this.apiService.getHttp().subscribe(
        (res: any) => {
          if (res.statusCode == '200') {
            this.spinner.hide();
            this.toastrService.success(res.statusMessage);
            this.addSegmentModel.nativeElement.click();
            this.getAllSegmentMaster();
          } else {
            this.toastrService.error(res.statusMessage);
            this.spinner.hide();
          }
        },
        (error: any) => {
          this.errorSerivce.handelError(error.status);
          this.spinner.hide();
        }
      );
  }


  deleteConformation(id: any) {
    this.deleteSegmentId = id;
  }

  deleteSegMaster() {
    let obj = {
      id: parseInt(this.deleteSegmentId),
      deletedBy: this.localStorage.userId(),
    };
    this.apiService.setHttp('DELETE', 'api/SegmentMaster', false, JSON.stringify(obj), false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.toastrService.success(res.statusMessage);
          this.getAllSegmentMaster();
          // this.clearForm();
        } else {
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : this.toastrService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

//............................................... Agm Map Code Start Here ..................................//


latLongArray:any;
centerMarker:any;
@ViewChild('search') searchElementRef: any;
centerMarkerLatLng: string = "";
isShapeDrawn: boolean = false;

newRecord: any = {
  dataObj: undefined,
  polyline: undefined,
  polylinetext: '',
};

onMapReady(map:any) {
  this.map = map;
  const options:any = {
    drawingControl: true,
    drawingControlOptions: { drawingModes: ["polyline"]},
    polylineOptions: {
      draggable: true,
      editable: true,
      strokeColor: "#FF0000",
      fillColor: "#FF0000", 
      fillOpacity: 0.35
    },
    drawingMode: google.maps.drawing.OverlayType.POLYLINE,
    map: map
  };

 let drawingManager = new google.maps.drawing.DrawingManager(options);




 this.mapsAPILoader.load().then(() => {
  let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef?.nativeElement);
  autocomplete.addListener("place_changed", () => {
    this.ngZone.run(() => {
      let place: google.maps.places.PlaceResult = autocomplete.getPlace();
      if (place.geometry === undefined || place.geometry === null) {
        return;
      }
      map.setZoom(16);
      map.setCenter({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() })
      if (this.centerMarker == undefined) {
        this.centerMarker = new google.maps.Marker({
          map: map,
          draggable: true
        })
        this.centerMarker.addListener('dragend', (evt: any) => {
          this.centerMarkerLatLng = "Long, Lat:" + evt.latLng.lng().toFixed(6) + ", " + evt.latLng.lat().toFixed(6);
          this.centerMarker.panTo(evt.latLng);
        });
      }
      this.centerMarker.setPosition({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
      this.centerMarkerLatLng = "Long, Lat:" + place.geometry.location.lng().toFixed(6) + ", " + place.geometry.location.lat().toFixed(6);
    });
  });
})

  google.maps.event.addListener(drawingManager,'polylinecomplete',(e:any) => {

    this.setSelection(e);
      this.isShapeDrawn = true;
      var newShape:any = e;
      drawingManager.setDrawingMode(null);
      google.maps.event.addListener(newShape, 'radius_changed', () => {
        this.ngZone.run(() => {
          this.setSelection(newShape);
        })
      });
      google.maps.event.addListener(newShape, 'dragend', (e:any) => {
        this.ngZone.run(() => {
          this.setSelection(newShape);
        })
      });
    }
  );

}

setSelection(shape: any) {
  this.newRecord.polyline = shape;
  this.newRecord.polyline.setMap(this.map);
  this.newRecord.polyline.setEditable(true);
  this.newRecord.centerMarkerLatLng = this.getCenterLanLongFromPolyline(shape);


console.log(this.newRecord.centerMarkerLatLng,'222');


  try {
    var ll = new google.maps.LatLng(+this.centerMarkerLatLng.split(',')[1], +this.centerMarkerLatLng.split(',')[0]);
    this.map.panTo(ll);
  }
  catch (e) { }
}


getCenterLanLongFromPolyline(polyline: any) {
  let bounds = new google.maps.LatLngBounds();
  let paths:any = polyline.getPath();
//   let polylines = paths.getArray();
// console.log((JSON.stringify(polylines)),'aaa');

// console.log(paths,'aaa');
  this.newRecord.polylinetext = "";
  let tempPolylineText: any[] = [];
    let ar = paths.getArray(); 

    console.log(JSON.stringify(ar),'aaa');

    for (var i = 0, l = ar.length; i < l; i++) {
      tempPolylineText[tempPolylineText.length] = ar[i].lng().toFixed(8) + ' ' + ar[i].lat().toFixed(8);
      bounds.extend(ar[i]);
    }
  tempPolylineText[tempPolylineText.length] = tempPolylineText[0];
  this.newRecord.polylinetext = tempPolylineText.join();
  // this.createGeofence.controls['geofenceTypeId'].setValue(1);
  // this.createGeofence.controls['longitude'].setValue(bounds.getCenter().lng().toFixed(8));
  // this.createGeofence.controls['latitude'].setValue(bounds.getCenter().lat().toFixed(8));
  return bounds.getCenter().lng().toFixed(8) + ',' + bounds.getCenter().lat().toFixed(8);
}



clearSelection(isAllClear: any) {
  
  this.newRecord.polyline && (this.newRecord.polyline.setEditable(false), this.newRecord.polyline.setMap(null), this.newRecord.polyline = undefined);

  this.centerMarkerLatLng = "";
  this.newRecord.polylinetext = "";
}

deleteSelectedShape() {
  // this.clearSelection(false);
}


removeShape() {
  this.isShapeDrawn = false;
  this.clearSelection(false);
}
setZoomLevel(radius: number) {
  let zoom = 8;
  if (radius < 500) {
    zoom = 16;
  }
  else if (radius < 1000) {
    zoom = 14;
  }
  else if (radius < 2000) {
    zoom = 14;
  }
  else if (radius < 3000) {
    zoom = 12;
  }
  else if (radius < 5000) {
    zoom = 10;
  }
  else if (radius < 15000) {
    zoom = 10;
  }
  // this.map.setZoom(zoom)
}



}
