import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from 'src/app/core/services/validation.service';

@Component({
  selector: 'app-segment-master',
  templateUrl: './segment-master.component.html',
  styleUrls: ['./segment-master.component.css']
})
export class SegmentMasterComponent implements OnInit{

  filterForm: FormGroup | any;

  segmentMasterForm: FormGroup | any;
  submited: boolean = false;
  textName = 'Submit';
  segmentMasterArray: any;
  valveSegmentList: any;
  pageNumber: number = 1; 
  pagesize: number = 10;
  totalRows: any;
  getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
  deleteSegmentId: any;
  @ViewChild('addSegmentModel') addSegmentModel: any;
  yoganaIdArray: any;
  networkIdArray: any;
  networkIdAddArray: any;
  heighLightRow:any;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    public commonService: CommonService,
    public apiService: ApiService,
    public validation: ValidationService,
    private toastrService: ToastrService,
    private errorSerivce: ErrorsService,
    private spinner: NgxSpinnerService,
    private localStorage: LocalstorageService,
    private ngZone: NgZone,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.defaultForm();
    this.defaultFilterForm();
    this.getYoganaId();
    this.localStorage.userId() == 1 ? this.getAllSegmentMaster() : '';
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      yojanaId: [''],
      networkId: [''],
      searchText: ['']
    })
  }

  defaultForm() {
    this.segmentMasterForm = this.fb.group({
      id: [0],
      segmentName: ['', [Validators.required]],  
      startPoints: [''],
      endPoints: [''],
      midpoints: [''],
      yojanaId: ['', [Validators.required]],
      networkId: ['', [Validators.required]],
    })
  }

  get f() { return this.segmentMasterForm.controls }

  getYoganaId() {
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getAllLocalStorageData.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.yoganaIdArray = res.responseData;
        this.yoganaIdArray?.length == 1 ? (this.filterForm.patchValue({ yojanaId: this.yoganaIdArray[0].yojanaId }), this.getNetworkId()) : '';
        this.yoganaIdArray?.length == 1 ? (this.segmentMasterForm.patchValue({ yojanaId: this.yoganaIdArray[0].yojanaId }), this.getNetworkIdAdd()) : '';
      }
      else {
        this.yoganaIdArray = [];
        this.toastrService.error(res.statusMessage);
      }
    },(error: any) => {this.errorSerivce.handelError(error.status);})
  }

  getNetworkId() {
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllNetworkbyUserId?YojanaId=' + this.filterForm.value.yojanaId + '&UserId=' + this.localStorage.userId(), false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.networkIdArray = res.responseData;
        (this.yoganaIdArray?.length == 1 && this.networkIdArray?.length > 1) ?  this.getAllSegmentMaster() : '';
        this.networkIdArray?.length == 1 ? (this.filterForm.patchValue({ networkId: this.networkIdArray[0].networkId }),this.getAllSegmentMaster()) : '';
      }
      else {
        this.networkIdArray = [];
        this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
      }
    },(error: any) => {this.errorSerivce.handelError(error.status)})
  }

  getNetworkIdAdd(flag?:any) { // For Filter
    this.apiService.setHttp('GET', 'api/MasterDropdown/GetAllNetworkbyUserId?YojanaId=' + this.segmentMasterForm.value.yojanaId + '&UserId=' + this.localStorage.userId(), false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.networkIdAddArray = res.responseData;
        this.networkIdAddArray?.length == 1 ? (this.segmentMasterForm.patchValue({ networkId: this.networkIdAddArray[0].networkId }), this.getValveSegmentList()) : '';
        this.networkIdAddArray?.length > 1 && flag == 'bind' ? (this.segmentMasterForm.patchValue({ networkId: this.segmentMasterForm.value.networkId }), this.getValveSegmentList()) : '';
      }
      else {
        this.networkIdAddArray = [];
        this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
      }
    },(error: any) => {this.errorSerivce.handelError(error.status)})
  }

  clearFilter(flag: any) {
    if (flag == 'yojana') {
      this.filterForm.controls['networkId'].setValue('');
    } else if (flag == 'network') {
    } else if (flag == 'search') {
      this.filterForm.controls['searchText'].setValue('');
    }
    this.pageNumber = 1;
    this.getAllSegmentMaster();
  }

  getAllSegmentMaster() {
    this.spinner.show();
    let obj: any = 'YojanaId=' + (this.filterForm.value.yojanaId || this.getAllLocalStorageData.yojanaId) + '&NetworkId=' + (this.filterForm.value.networkId || 0)
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
      },error: (error: any) => {this.errorSerivce.handelError(error.status)}});
  }

  getValveSegmentList() { //All Segment 
    this.spinner.show();
    let obj: any = 'YojanaId=' + (this.segmentMasterForm.value.yojanaId || 0) + '&NetworkId=' + (this.segmentMasterForm.value.networkId || 0)
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
      },error: (error: any) => {this.errorSerivce.handelError(error.status)}});
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
        "yojanaId": formData.yojanaId,
        "networkId": formData.networkId
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
        },(error: any) => {this.errorSerivce.handelError(error.status);this.spinner.hide()});
    }
  }

  clearForm() {
    this.submited = false;
    this.textName = 'Submit';
    this.defaultForm();
    this.yoganaIdArray?.length == 1 ?  this.segmentMasterForm.controls['yojanaId'].setValue(this.yoganaIdArray[0].yojanaId) : '';
    (this.networkIdAddArray?.length == 1 && this.segmentMasterForm.value.yojanaId) ? this.segmentMasterForm.controls['networkId'].setValue(this.networkIdAddArray[0].networkId) : '';
    // this.getYoganaId();
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
      },error: (error: any) => {this.errorSerivce.handelError(error.status)},});
  }

  //............................................... Agm Map Code Start Here ..................................//

  editObj: any;
  zoom = 6;
  latitude:number = 19.0898177;
  logitude:number = 76.5240298;
  editPatchShape: undefined | any;
  onEditFlag!: boolean;
  splitedEditObjData: any;
  insertNewLineFlag: boolean = false;

  tank_ValveArray: any;
  getAllSegmentArray: any[] = [];

  map: any;
  latLongArray: any;
  centerMarker: any;
  @ViewChild('search') searchElementRef: any;
  centerMarkerLatLng: any;
  isShapeDrawn: boolean = false;
  patchShapeEditedObj:any;

  newRecord: any = {polyline: undefined};
  markerArray: any;
  markerUrlNull = "../../../../assets/images/dot.png";
  Polyline:any[]= [];


  patchSegmentTable(obj: any) {
    this.heighLightRow = obj?.id;
    this.onEditFlag = true;
    this.textName = 'Update';
    this.editObj = JSON.parse(JSON.stringify(obj));
    
    this.segmentMasterForm.controls['id'].setValue(this.editObj.id);
    this.segmentMasterForm.controls['segmentName'].setValue(this.editObj.segmentName);
    this.segmentMasterForm.controls['yojanaId'].setValue(this.editObj.yojanaId);
    this.segmentMasterForm.controls['networkId'].setValue(this.editObj.networkId);
    this.getNetworkIdAdd('bind');
  }

  valveSegPatchData(mainArray: any) {
    if (this.onEditFlag == false) {
      this.add_editCommonData(mainArray);
    } else {
      let index: any = mainArray.segmenDetailsModels.findIndex((ele: any) => ele?.segmentId == this.editObj?.id)
      mainArray.segmenDetailsModels.splice(index, 1);

      this.add_editCommonData(mainArray);

      //.........................................  get Edit Object code Start Here.................................//

      let stringtoArray = this.editObj?.midpoints.split(',');
      let finalLatLngArray = stringtoArray.map((ele: any) => { return ele = { lat: Number(ele.split(' ')[0]), lng: Number(ele.split(' ')[1]) } });
      
      this.splitedEditObjData = finalLatLngArray;

      //.........................................  get Edit Object Segment code End Here.................................//
    }
    this.onMapReady(this.map);
  }

  add_editCommonData(mainArray: any) {

    this.markerArray = mainArray.segmenDetailsModels.map((ele: any) => { //Marker show Code
      return ele = { latitude: ele.startPoints.split(' ')[0], longitude: ele.startPoints.split(' ')[1], label: ele.segmentName };
    })

    mainArray.tankDetailsModels.map((ele: any) => { // Insert Tank Img 
      ele['iconUrl'] = "../../../../assets/images/tank2.png"; return ele
    })

    mainArray.valveDetailModels.map((ele: any) => { // Insert valve Img
      ele['iconUrl'] = "../../../../assets/images/valve2.png"; return ele
    })

    this.tank_ValveArray = mainArray.tankDetailsModels.concat(mainArray.valveDetailModels);

    //.........................................  get Edit All Other Segment Array code Start Here.................................//


    let getOtherAllSegment = mainArray.segmenDetailsModels.map((ele: any) => {
      let stringtoArray = ele.midpoints.split(',');
      let finalLatLngArray = stringtoArray.map((ele: any) => { return ele = { lat: Number(ele.split(' ')[0]), lng: Number(ele.split(' ')[1]) } });
      return ele = finalLatLngArray;
    })

    // this.getAllSegmentArray = getOtherAllSegment.flat();
    this.getAllSegmentArray = getOtherAllSegment;

    //.........................................  get Edit All Other Segment Array code End Here.................................//
  }

  onMapReady(map: any) {
    map.setOptions({mapTypeControlOptions: {position: google.maps.ControlPosition.TOP_RIGHT},streetViewControl: false}); // add satellite view btn
    this.map = map;
    const options: any = {
      drawingControl: true,
      drawingControlOptions: { drawingModes: ["polyline"] },
      polylineOptions: { draggable: true, editable: true, strokeColor: "#8000FF", fillColor: "#8000FF", fillOpacity: 0.35 },
      drawingMode: google.maps.drawing.OverlayType.POLYLINE,
      map: map,
    };
    let drawingManager = new google.maps.drawing.DrawingManager(options);

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
          // this.centerMarker.setPosition({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
          this.centerMarkerLatLng = "Long, Lat:" + place.geometry.location.lng().toFixed(6) + ", " + place.geometry.location.lat().toFixed(6);
        });
      });
    })

    //............................   Edit Code Start Here ..................  //

    this.getAllSegmentArray.map((ele: any) => {
      // map.setZoom(10);map.setCenter({ lat: this.getAllSegmentArray[0][0]?.lat, lng: this.getAllSegmentArray[this.getAllSegmentArray?.length - 1][this.getAllSegmentArray?.length - 1]?.lng }) 
      this.editPatchShape = new google.maps.Polyline({
        path: ele,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        icons: [{ icon: this.commonService.lineSymbol, offset: '25px', repeat: '100px' }]
      });

      if (this.onEditFlag == false) {
      const bounds = new google.maps.LatLngBounds();
      ele.forEach((marker:any) => {bounds.extend(new google.maps.LatLng(marker.lat, marker.lng))});
      this.map.fitBounds(bounds);
      }

      this.editPatchShape.setMap(this.map);
      this.Polyline.push(this.editPatchShape);
    })
   
    if (this.onEditFlag == true) {
      // map.setZoom(12);map.setCenter({ lat: this.splitedEditObjData[0].lat, lng: this.splitedEditObjData[this.splitedEditObjData?.length - 1].lng })
      drawingManager.setOptions({ drawingControl: false });
      this.centerMarkerLatLng = this.splitedEditObjData;
      this.patchShapeEditedObj = new google.maps.Polyline({
        path: this.centerMarkerLatLng,
        geodesic: true,
        strokeColor: '#8000FF',
        strokeOpacity: 1.0,
        strokeWeight: 4,
        icons: [{ icon: this.commonService.lineSymbol, offset: '25px', repeat: '100px' }]
      });

      this.setSelection(this.patchShapeEditedObj,'editFlag');

      setTimeout(() => {
        let bounds:any = new google.maps.LatLngBounds();
        this.centerMarkerLatLng.forEach((marker:any) => {
            bounds.extend(new google.maps.LatLng(marker.lat, marker.lng))
        })
        this.map.fitBounds(bounds)
      }, 150);
 
    } else if (this.onEditFlag == false) { 
      drawingManager.setOptions({ drawingControl: false })
     }

    //............................   Edit Code End Here ..................  //

    google.maps.event.addListener(drawingManager, 'polylinecomplete', (newShape: any) => {
      this.setSelection(newShape);
      this.isShapeDrawn = true;
      google.maps.event.addListener(newShape, 'dragend', (e: any) => {
        this.ngZone.run(() => { this.setSelection(newShape) })
      })
    });
  }

  setSelection(shape: any,flag?:any) {
    if (this.newRecord.polyline) { // new polyline Add then before polyline map data clear 
      this.newRecord.polyline.setMap(null);
    }
    this.newRecord.polyline = shape;
    this.newRecord.polyline.setMap(this.map);

    this.centerMarkerLatLng = this.getAllLatLongFromPolyline(shape);

    let middleObj = this.centerMarkerLatLng.map((ele: any) => { return ele = ele.lat + ' ' + ele.lng })
    this.segmentMasterForm.controls['midpoints'].setValue(middleObj.toString());

    let firstObj = this.centerMarkerLatLng.shift(0); // get the first obj in Array but Array Remove This Obj
    let lastObj = this.centerMarkerLatLng.pop(); // get the last obj in Array but Array Remove This Obj

    this.segmentMasterForm.controls['startPoints'].setValue(firstObj?.lat + ' ' + firstObj?.lng);
    this.segmentMasterForm.controls['endPoints'].setValue(lastObj?.lat + ' ' + lastObj?.lng);
  }

  getAllLatLongFromPolyline(polyline: any) {
    let paths: any = polyline.getPath();
    let latlongArray = JSON.stringify(paths.getArray());
    return JSON.parse(latlongArray);
  }

  clearSelection() {
    this.newRecord.polyline && (this.newRecord?.polyline.setMap(null), this.newRecord.polyline = undefined);
    this.centerMarkerLatLng = "";
  }

  removeShape() {
    this.isShapeDrawn = false;
    this.clearSelection();
  }

  mapModelClose() {
    this.editPatchShape && (this.editPatchShape.setMap(null), this.editPatchShape = undefined);
    this.tank_ValveArray = [];
    this.markerArray = [];
    this.removeShape();
    this.clearForm();
    this.searchElementRef.nativeElement.value = '';
  }

  clearMapData() {
    this.editPatchShape && (this.editPatchShape = undefined);
    this.editObj ? this.editObj.midpoints = '' : '';this.patchShapeEditedObj && (this.patchShapeEditedObj.setMap(null), this.patchShapeEditedObj = undefined);
    this.tank_ValveArray = [];
    this.markerArray = [];
    this.removeShape();
    for (let i = 0; i < this.Polyline.length; i++) {
      this.Polyline[i].setMap(null);
    }
    this.map.setZoom(6);this.map.setCenter({ lat: this.latitude, lng: this.logitude })
  }

}
