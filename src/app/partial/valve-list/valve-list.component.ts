import { Component, ElementRef,NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MapsAPILoader } from '@agm/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { number } from '@amcharts/amcharts4/core';

@Component({
  selector: 'app-valve-list',
  templateUrl: './valve-list.component.html',
  styleUrls: ['./valve-list.component.css'],
})
export class ValveListComponent implements OnInit {
  valveListForm: FormGroup | any;
  submitted = false;
  iseditbtn = false;
  editId: any;
  readioSelected: any;
  btnText = 'Save Changes';
  headingText = 'Add Valve';
  valveStatusArray: any;
  pageNumber: number = 1;
  pagesize: number = 10000000000;
  totalRows: any;
  districtArray: any;
  yojanaArray: any;
  networkArray: any;
  tankArray: any;
  valvelistArray: any;
  @ViewChild('addValveModel') addValveModel: any;
  @ViewChild('addValveModal', { static: false }) addValveModal: any;
  HighlightRow!: number;
  deleteValveId: any;
  simArray: any;
  // lat: any = 19.7515;
  // lng: any = 75.7139;
  addressZoomSize = 6;
  geoCoder: any;
  constructor(
    private mapsAPILoader: MapsAPILoader,
    public commonService: CommonService,
    public apiService: ApiService,
    private toastrService: ToastrService,
    private errorSerivce: ErrorsService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private localStorage: LocalstorageService,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
    this.defaultForm();
    this.getAllValveData();
    this.getAllYojana();
    this.getValveList();
    this.getTankList();
    this.searchAddress();
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder();
    });
    this.ToBindSimNumberList();
  }
  get f() {
    return this.valveListForm.controls;
  }

  precesidingList = [
    { "id": 1, name: 'valve' },
    { "id": 2, name: 'tank' },
  ]

  defaultForm() {
    this.valveListForm = this.fb.group({
      Id: [0],
      valveName: ['', [Validators.required, Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+"\'/\\]\\]{}][a-zA-Z.\\s]+$'),],],
      pipeDiameter: ['', [Validators.required, Validators.pattern('^[0-9.]*$')],],
      noOfConnections: ['', [Validators.required, Validators.pattern('^[0-9]*$')],],
      simNumber: ['0', [Validators.pattern('[^0]+')]],
      address: ['', [Validators.required],],
      valvelist: ['0', [Validators.pattern('[^0]+')],],
      tankist: ['0', [Validators.pattern('[^0]+')],],
      yojana: ['0', [Validators.pattern('[^0]+')],],
      network: ['0', [Validators.pattern('[^0]+')],],
      list: [1],
      valveId: ['', [Validators.required, Validators.pattern('^[^[ ]+|[ ][gm]+$')],],
      companyName: ['', [Validators.required, Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+"\'/\\]\\]{}][a-zA-Z.\\s]+$'),],],
      description: ['', [Validators.required, Validators.pattern('^[^[ ]+|[ ][gm]+$')],],
      latitude: [''],
      longitude: [''],
      // area: ['', Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)],
    });
  }

  getValveList() {
    this.apiService.setHttp('get', 'ValveMaster/GetValveNameList?userId=1&YojanaId=0&NetworkId=0', false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.valvelistArray = res.responseData;
        } else {
          this.spinner.hide();
          this.valvelistArray = [];
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toastrService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  getTankList() {
    this.apiService.setHttp('get', 'api/MasterDropdown/GetAllTank', false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.tankArray = res.responseData;
        } else {
          this.spinner.hide();
          this.tankArray = [];
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toastrService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  getAllYojana() {
    this.apiService.setHttp('get', 'api/MasterDropdown/GetAllYojana?YojanaId=0', false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.yojanaArray = res.responseData;
          // this.iseditbtn==true ? (this.valveListForm.controls['yojana'].setValue(this.editId?.yojanaId),this.getAllNetwork(this.editId?.yojanaId)): '';
        } else {
          this.spinner.hide();
          this.yojanaArray = [];
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toastrService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  getAllNetwork(val: any) {
    this.apiService.setHttp('get', 'api/MasterDropdown/GetAllNetwork?YojanaId=' + val, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.networkArray = res.responseData;
        } else {
          this.spinner.hide();
          this.networkArray = [];
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toastrService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  clearForm() {
    this.submitted = false;
    this.defaultForm();
    this.btnText = 'Save Changes';
    this.headingText = 'Add Valve';
  }

  getAllValveData() {
    this.spinner.show();
    let obj = 'UserId=' + this.pageNumber + '&Search=' + this.pagesize;
    this.apiService.setHttp('get','ValveMaster/GetAllValveStatus?',false,false,false,'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.valveStatusArray = res.responseData;
          // this.valveStatusArray = res.responseData.responseData1;
          // this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;
        } else {
          this.spinner.hide();
          this.valveStatusArray = [];
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toastrService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  // onClickPagintion(pageNo: any) {
  //   this.pageNumber = pageNo;
  //   this.getAllValveData();
  // }

  onSubmit() {
    // this.onRadioChange(1)
    let formData = this.valveListForm.value;
    this.submitted = true;
    if (this.valveListForm.invalid) {
      return;
    } else {
      let obj = {
        "id": formData.Id,
        "valveName": formData.valveName,
        "valveId": formData.valveId,
        "companyName": formData.companyName,
        "description": formData.description,
        "createdBy": this.localStorage.userId(),
        "statusId": 0,
        "valveStatus": "",
        "statusDate": new Date(),
        "valvePipeDiameter": formData.pipeDiameter,
        "noOfConnection": formData.noOfConnections,
        "simid": formData.simNumber,
        "latitude": this.addLatitude,
        "longitude": this.addLongitude,
        "simNo": "",
        "actionDate": new Date(),
        "valveAddress": formData.address,
        "isPrecidingValve": formData.list,
        "valveId_TankId": formData.list == '1' ? formData.valvelist : formData.tankist,
        "yojanaId": Number(formData.yojana),
        "networkId": Number(formData.network)
      }
      this.spinner.show();
      let urlType;
      formData.Id == 0 ? (urlType = 'POST') : (urlType = 'PUT');
      this.apiService.setHttp(urlType,'ValveMaster',false,JSON.stringify(obj),false,'valvemgt');
      this.apiService.getHttp().subscribe(
        (res: any) => {
          if (res.statusCode == '200') {
            this.spinner.hide();
            this.toastrService.success(res.statusMessage);
            this.addValveModel.nativeElement.click();
            this.getAllValveData();
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

  updateValveData(obj: any) {
    // debugger
    console.log(obj);
    this.editId = obj;
    // console.log(this.editId);
    this.iseditbtn = true;
    this.btnText = 'Update Changes';
    this.headingText = 'Update Valve';
    this.HighlightRow = obj.id;
    // console.log(obj.simid);
    this.valveListForm.patchValue({
      Id: obj.id,
      valveName: obj.valveName,
      valveId: obj.valveId,
      companyName: obj.companyName,
      description: obj.description,
      simNumber: Number(obj.simid),
      pipeDiameter: obj.valvePipeDiameter,
      noOfConnections: obj.noOfConnection,
      address: obj.valveAddress,
      valvelist: obj.valveId_TankId,
      tankist: obj.valveId_TankId,
      yojana: obj.yojanaId,
      network: obj.networkId,
      list: obj.isPrecidingValve,
      latitude: obj.latitude,
      longitude: obj.longitude,
    });
    this.getAllNetwork(obj.yojanaId);
  }

  deleteConformation(id: any) {
    this.HighlightRow = id;
    this.deleteValveId = id;
  }

  deleteJobPost() {
    let obj = {
      id: parseInt(this.deleteValveId),
      deletedBy: this.localStorage.userId(),
    };
    this.apiService.setHttp('DELETE','ValveMaster', false,JSON.stringify(obj),false,'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.toastrService.success(res.statusMessage);
          this.getAllValveData();
          this.clearForm();
        } else {
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toastrService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  refreshValveStatus() {
    this.spinner.show();
    this.apiService.setHttp('get','ValveMaster/RefreshValveStatus?UserId=' + this.localStorage.userId(),false, false,false,'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.getAllValveData();
          // this.valveStatusArray = res.responseData;
        } else {
          this.spinner.hide();
          // this.valveStatusArray = [];
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toastrService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status), this.spinner.hide();
      },
    });
  }

  // getAddress(event: any) {
  //   this.lat = event.coords.lat;
  //   this.lng = event.coords.lng;
  //   console.log(this.lat);
  //   console.log(this.lng);
  //   this.geoCoder.geocode(
  //     { location: { lat: this.lat, lng: this.lng } },
  //     (results: any, status: any) => {
  //       console.log(results);
  //       console.log(status);
  //       if (status === 'OK') {
  //         if (results[0]) {
  //           this.addValveModal.nativeElement.click();
  //           this.valveListForm.patchValue({
  //             address: results[0].formatted_address
             
              
  //           })
  //         } else {
  //           console.log('No results found');
  //         }
  //       }
  //     }
  //   );
  // }

  // markerDragEnd($event: any) {
  //   console.log($event);
  //   // this.lat = $event.coords.lat;
  //   // this.lng = $event.coords.lng;
  //   // this.getAddress($event);
  // }


  ToBindSimNumberList() {
    this.spinner.show();
    this.apiService.setHttp('get','SimMaster/GetSimListDropdownList',false,false,false,'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.simArray = res.responseData;
        } else {
          this.spinner.hide();
          this.simArray = [];
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toastrService.error(res.statusMessage);
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  onRadioChange(ele: any) {
    // console.log(ele);
    if (ele == 1) {
      this.valveListForm.controls['valvelist'].setValidators([Validators.required]);
      this.valveListForm.controls['valvelist'].updateValueAndValidity();
      this.valveListForm.controls['tankist'].clearValidators();
      this.valveListForm.controls['tankist'].updateValueAndValidity();
    }
     else {
      this.valveListForm.controls['tankist'].setValidators([Validators.required]);
      this.valveListForm.controls['tankist'].updateValueAndValidity();
      this.valveListForm.controls['valvelist'].clearValidators();
      this.valveListForm.controls['valvelist'].updateValueAndValidity();
    }
  }

  
  //......................................... Address Code Start Here ..................................................//

  geocoder: any;
  addLatitude: any = 19.7515;
  addLongitude: any = 75.7139;
  addPrevious: any;
  addressNameforAddress: any;
  copyAddressNameforAddress: any;
  @ViewChild('searchAddress') public searchElementRefAddress!: ElementRef;
  searchAdd = new FormControl('');
  addressMarkerShow: boolean = true;
  @ViewChild('searchAddressModel') searchAddressModel: any;

  searchAddress() {
    this.mapsAPILoader.load().then(() => {
      this.geocoder = new google.maps.Geocoder();
      let autocomplete = new google.maps.places.Autocomplete(
        this.searchElementRefAddress.nativeElement
      );
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          this.addLatitude = place.geometry.location.lat();
          this.addLongitude = place.geometry.location.lng();
          this.findAddressByCoordinates();
          this.addressMarkerShow = true;
        });
      });
    });
  }

  markerAddressDragEnd($event: any) {
    console.log($event);
    this.addLatitude = $event.coords.lat;
    this.addLongitude = $event.coords.lng;
    // console.log( this.addLatitude);
    // console.log( this.addLongitude);
    this.findAddressByCoordinates();
    this.addressMarkerShow = true;
  }

  findAddressByCoordinates() {
    this.geocoder.geocode({
      'location': {
        lat: this.addLatitude,
        lng: this.addLongitude
      }
    }, (results: any) => {
      console.log(results);
      
      this.findAddress(results[0]);
    });
  }

  findAddress(results: any) {
    if (results) {
      this.addressNameforAddress = results.formatted_address;
      console.log(this.addressNameforAddress);
      this.addressZoomSize = 12;
      this.searchAdd.setValue(this.addressNameforAddress);
    }
  }

  clickedAddressMarker(infowindow: any) {
    if (this.addPrevious) {
      this.addPrevious.close();
    }
    this.addPrevious = infowindow;
  }

  newAddedAddressLat: any;
  newAddedAddressLang: any;

  addAddress() {
    this.valveListForm.controls['address'].setValue(this.addressNameforAddress);
    this.searchAdd.setValue(this.addressNameforAddress);
    this.copyAddressNameforAddress = this.addressNameforAddress;
    this.newAddedAddressLat = this.addLatitude; 
    this.newAddedAddressLang = this.addLongitude;
    this.addValveModal.nativeElement.click();
  }

  clearAddress() {
    this.addressMarkerShow = false;
    this.searchAdd.setValue('');
    this.addressZoomSize = 6;
    this.addressNameforAddress = '';
    this.addLatitude = 19.7515;
    this.addLongitude = 75.7139;
  }

  openAddressModel() {
    this.addressZoomSize = 6;
    this.searchAdd.setValue(this.copyAddressNameforAddress);
    this.addLatitude = this.newAddedAddressLat;
    this.addLongitude = this.newAddedAddressLang;
    this.copyAddressNameforAddress ? this.addressMarkerShow = true : this.addressMarkerShow = false;
    this.addressNameforAddress = this.copyAddressNameforAddress;
  }

  //.........................................Address code End Here ....................................//

}
