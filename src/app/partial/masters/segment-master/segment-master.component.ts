import { Component, OnInit, Inject, NgZone, ViewChild } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-segment-master',
  templateUrl: './segment-master.component.html',
  styleUrls: ['./segment-master.component.css']
})
export class SegmentMasterComponent implements OnInit {

  segmentMasterForm: FormGroup | any;
  submited: boolean = false;
  textName = 'Submit';
  segmentMasterArray: any;
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
  deleteSegmentId: any;
  @ViewChild('addSegmentModel') addSegmentModel: any;


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
    this.defaultForm();
    this.getAllSegmentMaster();
  }

  defaultForm() {
    this.segmentMasterForm = this.fb.group({
      id: [0],
      segmentName: ['', [Validators.required]],
      startPoints: [''],
      endPoints: [''],
      midpoints: [''],
    })
  }

  get f() { return this.segmentMasterForm.controls }

  getAllSegmentMaster() {
    this.spinner.show();
    let obj: any = 'YojanaId=' + this.getAllLocalStorageData.yojanaId + '&NetworkId=' + this.getAllLocalStorageData.networkId 
    + '&pageno=' + this.pageNumber + '&pagesize=' + this.pagesize;
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
    this.submited = true;
    if (this.segmentMasterForm.invalid) {
      return;
    } else if (this.commonService.checkDataType(this.newRecord.polyline) == false) {
      this.toastrService.error('Please Draw Map Segment Point...');
      return;
    } else {
      let formData = this.segmentMasterForm.value;
      let obj = {
        "id": formData.id,
        "segmentName": formData.segmentName,
        "startPoints": formData.startPoints,
        "endPoints": formData.endPoints,
        "midpoints": formData.midpoints,
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
      let urlType = formData.id == 0 ? 'POST' : 'PUT';
      let UrlName = formData.id == 0 ? 'api/SegmentMaster/Add' : 'api/SegmentMaster/Update';
      this.apiService.setHttp(urlType, UrlName, false, JSON.stringify(obj), false, 'valvemgt');
      this.apiService.getHttp().subscribe(
        (res: any) => {
          if (res.statusCode == '200') {
            this.spinner.hide();
            this.toastrService.success(res.statusMessage);
            this.clearForm();
            this.getAllSegmentMaster();
            this.addSegmentModel.nativeElement.click();
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
  }

  clearForm() {
    this.submited = false;
    this.textName = 'Submit';
    this.defaultForm();
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

  onEditFlag: boolean = false;
  editObjData:any;

  map: any;
  latLongArray: any;
  centerMarker: any;
  @ViewChild('search') searchElementRef: any;
  centerMarkerLatLng:any;
  isShapeDrawn: boolean = false;

  newRecord: any = {
    polyline: undefined,
  };

  onEditMapData(obj:any) {
    this.editObjData = obj;
    this.onEditFlag = true;
    this.textName = 'Update';
    this.onMapReady(this.map);

    this.segmentMasterForm.controls['id'].setValue(obj.id);
    this.segmentMasterForm.controls['segmentName'].setValue(obj.segmentName);
  }

  onMapReady(map: any) {
    this.map = map;
    const options: any = {
      drawingControl: true,
      drawingControlOptions: { drawingModes: ["polyline"] },
      polylineOptions: { draggable: true, editable: true, strokeColor: "#FF0000", fillColor: "#FF0000", fillOpacity: 0.35 },
      drawingMode: google.maps.drawing.OverlayType.POLYLINE,
      map: map,
    };

    let drawingManager = new google.maps.drawing.DrawingManager(options);
    //  drawingManager.setMap(this.map);

    this.mapsAPILoader.load().then(() => { //search Field Code Here
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
              draggable: false
            })
          }
          this.centerMarker.setPosition({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
          this.centerMarkerLatLng = "Long, Lat:" + place.geometry.location.lng().toFixed(6) + ", " + place.geometry.location.lat().toFixed(6);
        });
      });
    })

    //............................   Edit Code Start Here ..................  //

    // drawingManager.setDrawingMode(null);

    if (this.onEditFlag == true) {
      drawingManager.setOptions({ drawingControl: false });

      let finalString = this.editObjData.midpoints ? this.editObjData.startPoints + ',' + this.editObjData.midpoints + ',' + this.editObjData.endPoints :
        this.editObjData.startPoints + ',' + this.editObjData.endPoints;

      let stringtoArray = finalString.split(',');
      let finalLatLngArray = stringtoArray.map((ele: any) => { return ele = { lat: Number(ele.split(' ')[0]), lng: Number(ele.split(' ')[1]) } });

      this.centerMarkerLatLng = finalLatLngArray;

      const editPatchShape = new google.maps.Polyline({
        path: this.centerMarkerLatLng,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });
      this.setSelection(editPatchShape);
    }
    //............................   Edit Code End Here ..................  //


    google.maps.event.addListener(drawingManager, 'polylinecomplete', (newShape: any) => {
      this.setSelection(newShape);
      this.isShapeDrawn = true;
      google.maps.event.addListener(newShape, 'dragend', (e: any) => {
        this.ngZone.run(() => {
          this.setSelection(newShape);
        })
      });
    }
    );

  }

  setSelection(shape: any) {
    if (this.newRecord.polyline) { // new polyline Add then before polyline map data clear 
      this.newRecord.polyline.setMap(null);
    }
    this.newRecord.polyline = shape;
    this.newRecord.polyline.setMap(this.map);
    this.centerMarkerLatLng = this.getAllLatLongFromPolyline(shape);

    let firstObj = this.centerMarkerLatLng.shift(0); // get the first obj in Array but Array Remove This Obj
    let lastObj = this.centerMarkerLatLng.pop(); // get the last obj in Array but Array Remove This Obj
    
    let middleObj = this.centerMarkerLatLng.map((ele: any) => { return ele = ele.lat + ' ' + ele.lng })

    this.segmentMasterForm.controls['startPoints'].setValue(firstObj.lat + ' ' + firstObj.lng);
    this.segmentMasterForm.controls['endPoints'].setValue(lastObj?.lat + ' ' + lastObj?.lng);
    this.segmentMasterForm.controls['midpoints'].setValue(middleObj.toString());
  }

  getAllLatLongFromPolyline(polyline: any) {
    let paths: any = polyline.getPath();
    let latlongArray = JSON.stringify(paths.getArray());
    return JSON.parse(latlongArray);
  }

  clearSelection() {
    this.newRecord.polyline && (this.newRecord.polyline.setMap(null), this.newRecord.polyline = undefined);
    this.centerMarkerLatLng = "";
  }

  removeShape() {
    this.isShapeDrawn = false;
    this.clearSelection();
  }

  mapModelClose() {
    this.removeShape();
    this.clearForm();
  }


}
