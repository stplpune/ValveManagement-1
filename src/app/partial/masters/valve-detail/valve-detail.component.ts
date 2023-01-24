import { Component, ElementRef, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MapsAPILoader } from '@agm/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { number } from '@amcharts/amcharts4/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ValidationService } from 'src/app/core/services/validation.service';

@Component({
  selector: 'app-valve-detail',
  templateUrl: './valve-detail.component.html',
  styleUrls: ['./valve-detail.component.css']
})
export class ValveDetailComponent implements OnInit {

  valveListForm: FormGroup | any;
  searchForm!: FormGroup;
  submitted = false;
  iseditbtn = false;
  editId: any;
  readioSelected: any;
  btnText = 'Save Changes';
  headingText = 'Add Valve Details'; 
  valveStatusArray: any;
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  districtArray: any;
  yojanaArray: any;
  networkArray: any;
  tankArray: any;
  valvelistArray: any;
  yoganaArrayFilter: any;
  networkArrayfilter: any;
  getAllLocalStorageData: any;
  filterFlag: any = 'filter';
  @ViewChild('addValveModel') addValveModel: any;
  @ViewChild('addValveModal', { static: false }) addValveModal: any;
  HighlightRow!: number;
  deleteValveId: any;
  addressZoomSize = 6;
  subject: Subject<any> = new Subject();
  geoCoder: any;
  getAllMasterValveListArray:any;

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
    public validation: ValidationService,

  ) { }

  ngOnInit() {
    this.Filter();
    this.defaultForm();
    this.getAllLocalStorageData = this.localStorage.getLoggedInLocalstorageData();
    this.getAllValveData();
    this.getAllYojana();
    this.getTankList();
    this.searchAddress();
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder();
    });
    this.searchFilters('false');
  }

  get f() { return this.valveListForm.controls;}

  precesidingList = [ { "id": 1, name: 'valve' },{ "id": 2, name: 'tank' }]

  defaultForm() {
    this.valveListForm = this.fb.group({
      Id: [0],
      valveName: ['', [Validators.required, Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+"\'/\\]\\]{}][a-zA-Z.\\s]+$'),],],
      pipeDiameter: ['', [Validators.required, Validators.pattern('^[0-9.]*$')],],
      address: ['', [Validators.required],],
      valvelist: ['', [Validators.required],],
      tankist: ['', [Validators.required],],
      yojana: ['', [Validators.required],],
      network: ['', [Validators.required],],
      list: [1],
      valveMasterId: ['', [Validators.required, Validators.pattern('^[^[ ]+|[ ][gm]+$')],],
      description: ['', [Validators.required, Validators.pattern('^[^[ ]+|[ ][gm]+$')],],
      latitude: [''],
      longitude: [''],
    });
  }

  Filter() {
    this.searchForm = this.fb.group({
      yojana: [''],
      network: [''],
      searchField: [''],
    })
  }

  getMasterValveList() {
    let obj = (this.valveListForm.value.yojana || 0) + '&NetworkId=' + (this.valveListForm.value.network || 0)
    this.apiService.setHttp('get', 'api/MasterDropdown/GetAllMasterValveList?YojanaId=' + obj, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.getAllMasterValveListArray = res.responseData;
          this.getAllMasterValveListArray?.length == 1 ? (this.valveListForm.patchValue({ valveMasterId: this.getAllMasterValveListArray[0].valveMasterId })) : '';
        } else {
         this.getAllMasterValveListArray = [];
          this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : '';
        }
      },
      error: (error: any) => {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  getValveList(yojana: any, network: any) {
    this.apiService.setHttp('get', 'ValveMaster/GetValveNameList?userId=1&YojanaId=' + yojana + '&NetworkId=' + network, false, false, false, 'valvemgt');
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
    this.apiService.setHttp('get', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getAllLocalStorageData.yojanaId, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.filterFlag == 'filter' ? this.yoganaArrayFilter = res.responseData : this.yojanaArray = res.responseData;
          this.yoganaArrayFilter.length == 1 ? (this.searchForm.controls['yojana'].setValue(this.yoganaArrayFilter[0].yojanaId), this.getAllNetwork(this.yoganaArrayFilter[0].yojanaId)) : '';
          this.yojanaArray.length == 1 ? (this.valveListForm.controls['yojana'].setValue(this.yojanaArray[0].yojanaId), this.getAllNetwork(this.yojanaArray[0].yojanaId)) : '';
         
        } else {
          this.spinner.hide();
          this.filterFlag == 'filter' ? this.yoganaArrayFilter = [] : this.yojanaArray = [];
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
    this.apiService.setHttp('get', 'api/MasterDropdown/GetAllNetworkbyUserId?UserId=' + this.getAllLocalStorageData.userId + '&YojanaId=' + val, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.filterFlag == 'filter' ? this.networkArrayfilter = res.responseData : this.networkArray = res.responseData;
          (this.filterFlag == 'filter' && this.networkArrayfilter?.length == 1) ? (this.searchForm.patchValue({ network: this.networkArrayfilter[0].networkId })) : '';
          this.networkArray?.length == 1 ? (this.valveListForm.patchValue({ network: this.networkArray[0].networkId }),this.getMasterValveList()) : '';
        } else {
          this.spinner.hide();
          this.filterFlag == 'filter' ? this.networkArrayfilter = [] : this.networkArray = [];
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
    this.headingText = 'Add Valve Details';
    this.yojanaArray?.length == 1 ? (this.valveListForm.patchValue({ yojana: this.yojanaArray[0].yojanaId })) : '';
  }

  onKeyUpFilter() {
    this.subject.next(true);
  }

  searchFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchForm.value.searchField == "" || this.searchForm.value.searchField == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchForm.value.searchField;
        this.pageNumber = 1;
        this.getAllValveData();
      });
  }

  getAllValveData() {
    let formdata = this.searchForm.value;
    this.spinner.show();
    let obj = this.localStorage.userId() + '&pageNo=' + this.pageNumber + '&pageSize= '+ 10 +'&Search=' + formdata.searchField
    
    this.apiService.setHttp('get', 'ValveDetails/GetValveDetailsAll?userId=' + obj, false, false, false, 'valvemgt');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === '200') {
          this.spinner.hide();
          this.valveStatusArray = res.responseData.responseData1;
          this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;
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

  onClickPagintion(pageNo: any) {
    this.pageNumber = pageNo;
    this.getAllValveData();
    this.onRadioChange();
  }

  onSubmit() {
    let formData = this.valveListForm.value;
    this.submitted = true;
    if (this.valveListForm.invalid) {
      return;
    } else {
      let obj = {
        "id": formData.Id,
        "valveName": formData.valveName,
        "valveId": "",
        "description": formData.description,
        "createdBy": this.localStorage.userId(),
        "valvePipeDiameter": formData.pipeDiameter,
        "noOfConnection": 0,
        "valveMasterId": formData?.valveMasterId,
        "simid": 0,
        "latitude": this.addLatitude,
        "longitude": this.addLongitude,
        "simNo": "",
        "valveAddress": formData.address,
        "isPrecidingValve": formData.list,
        "valveId_TankId": formData.list == '1' ? formData.valvelist : formData.tankist,
        "yojanaId": Number(formData.yojana),
        "networkId": Number(formData.network)
      }

      this.spinner.show();
      let urlType;
      let urlName;
      formData.Id == 0 ? (urlType = 'POST') : (urlType = 'PUT');  
      formData.Id == 0 ? (urlName = 'ValveDetails/AddValveDetails') : (urlName = 'ValveDetails/UpdateValveDetails');
      this.apiService.setHttp(urlType, urlName, false, JSON.stringify(obj), false, 'valvemgt');
      this.apiService.getHttp().subscribe(
        (res: any) => {
          if (res.statusCode == '200') {
            this.spinner.hide();
            this.toastrService.success(res.statusMessage);
            this.addValveModel.nativeElement.click();
            this.filterFlag = 'filter';
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
    this.editId = obj;
    this.iseditbtn = true;
    this.btnText = 'Update Changes';
    this.headingText = 'Update Valve Details';
    this.HighlightRow = obj.id;
    this.valveListForm.patchValue({
      Id: obj.id,
      valveMasterId:obj.valveMasterId,
      valveName: obj.valveName,
      description: obj.description,
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
    this.getValveList(obj.yojanaId, obj.networkId);

    this.commonService.checkDataType(obj.latitude) == true ? this.searchAdd.setValue(obj.valveAddress) : '';
    this.addLatitude = obj.latitude;
    this.addLongitude = obj.longitude;
    this.newAddedAddressLat = obj.latitude;
    this.newAddedAddressLang = obj.longitude;
    this.addressNameforAddress = obj.valveAddress;
    this.copyAddressNameforAddress = obj.valveAddress;
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
    this.apiService.setHttp('DELETE', 'ValveDetails/DeleteValveDetails', false, JSON.stringify(obj), false, 'valvemgt');
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

  // refreshValveStatus() {
  //   this.spinner.show();
  //   this.apiService.setHttp('get', 'ValveMaster/RefreshValveStatus?UserId=' + this.localStorage.userId(), false, false, false, 'valvemgt');
  //   this.apiService.getHttp().subscribe({
  //     next: (res: any) => {
  //       if (res.statusCode === '200') {
  //         this.spinner.hide();
  //         this.getAllValveData();
  //         // this.valveStatusArray = res.responseData;
  //       } else {
  //         this.spinner.hide();
  //         // this.valveStatusArray = [];
  //         this.commonService.checkDataType(res.statusMessage) == false
  //           ? this.errorSerivce.handelError(res.statusCode)
  //           : this.toastrService.error(res.statusMessage);
  //       }
  //     },
  //     error: (error: any) => {
  //       this.errorSerivce.handelError(error.status), this.spinner.hide();
  //     },
  //   });
  // }

  clearSerach(flag: any) {
    if (flag == 'yojana') {
      this.searchForm.controls['network'].setValue('');
    } else if (flag == 'network') {
      this.searchForm.controls['network'].setValue('');
    } else if (flag == 'search') {
      this.searchForm.controls['searchField'].setValue('');
    }
    this.pageNumber = 1;
    this.getAllValveData();
    this.clearForm();
  }

  clearhighlightrow() {
    this.HighlightRow = 0;
  }

  onRadioChange(ele?: any) {
    if (ele == 1) {
      this.valveListForm.controls['valvelist'].setValidators([Validators.required]);
      this.valveListForm.controls['valvelist'].updateValueAndValidity();
      this.valveListForm.controls['tankist'].clearValidators();
      this.valveListForm.controls['tankist'].updateValueAndValidity();
      this.valveListForm.controls['tankist'].setValue('');
    } else {
      this.valveListForm.controls['tankist'].setValidators([Validators.required]);
      this.valveListForm.controls['tankist'].updateValueAndValidity();
      this.valveListForm.controls['valvelist'].clearValidators();
      this.valveListForm.controls['valvelist'].updateValueAndValidity();
      this.valveListForm.controls['valvelist'].setValue('');
    }
  }

  clearFilter(flag: any) {
    if (flag == 'yojana') {
      this.valveListForm.controls['network'].setValue('');
      this.valveListForm.controls['valvelist'].setValue('');
      this.valveListForm.controls['tankist'].setValue('');
      this.valveListForm.controls['valveMasterId'].setValue('');
    } else if (flag == 'network') {
      this.valveListForm.controls['valvelist'].setValue('');
      this.valveListForm.controls['valveMasterId'].setValue('');
      this.valveListForm.controls['tankist'].setValue('');
    }
  }

  defaultPageNo() {
    this.pageNumber = 1;
    this.getAllValveData()
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
    this.addLatitude = $event.coords.lat;
    this.addLongitude = $event.coords.lng;
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
      this.findAddress(results[0]);
    });
  }

  findAddress(results: any) {
    if (results) {
      this.addressNameforAddress = results.formatted_address;
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
    if (this.iseditbtn) {
      this.addressZoomSize = 6;
      this.searchAdd.setValue(this.copyAddressNameforAddress);
      this.addLatitude = this.newAddedAddressLat;
      this.addLongitude = this.newAddedAddressLang;
      this.addressMarkerShow = this.copyAddressNameforAddress ? true : false;
      this.addressNameforAddress = this.copyAddressNameforAddress;
    } else {
      this.clearAddress();
    }
  }

  //.........................................Address code End Here ....................................//

}
