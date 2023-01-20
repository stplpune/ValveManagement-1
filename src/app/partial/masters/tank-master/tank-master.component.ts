import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ValidationService } from 'src/app/core/services/validation.service';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { CommonService } from 'src/app/core/services/common.service';
@Component({
  selector: 'app-tank-master',
  templateUrl: './tank-master.component.html',
  styleUrls: ['./tank-master.component.css']
})
export class TankMasterComponent implements OnInit {
  tankForm: FormGroup | any;
  getData:any;
  yojanaArray = new Array();
  networkArray = new Array();
  editFlag: boolean = false;
  responseArray = new Array();
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  deleteId!: number;
  delData: any;
  filterFrm!: FormGroup;
  pinCode: any;
  editObj: any;
  submitted:boolean =false;
  filterYojanaArray = new Array();
  filterNetworkArray = new Array();
  
  addressZoomSize = 6;
  @ViewChild('closebutton') closebutton: any;

  constructor
    (
      private fb: FormBuilder,
      private service: ApiService,
      private local: LocalstorageService,
      private toastrService: ToastrService,
      private error: ErrorsService,
      private spinner: NgxSpinnerService,
      public validation: ValidationService,
      private mapsAPILoader: MapsAPILoader,
      private ngZone: NgZone,
      private commonService: CommonService
    ) { }

  ngOnInit(): void {
    this.getData = this.local.getLoggedInLocalstorageData();
    this.geFormData();
    this.getFilterFormData();
    this.getTableData();
    this.getYojana()
    this.searchAddress();
  }

  geFormData() {
    this.tankForm = this.fb.group({
      "id": [0],
      "tankName": ['', [Validators.required,Validators.maxLength(100)]],
      "address": ['', [Validators.required, Validators.maxLength(500)]],
      "yojanaId": [this.yojanaArray?.length == 1 ? this.yojanaArray[0].yojanaId : '', [Validators.required]],
      "networkId": ['', Validators.required],
      "latitude": [''],
      "longitude": [''],
    })
  }

  get f() {
    return this.tankForm.controls;
  }

  clearFormDataDropDown(flag?: any) {
    if (flag == 'formYojana') {
      this.tankForm.controls['yojanaId'].setValue(0);
      this.tankForm.controls['networkId'].setValue(0);
    } else if (flag == 'networkId') {
      this.tankForm.controls['yojanaId'].setValue(this.tankForm.value.yojanaId);
      this.tankForm.controls['networkId'].setValue(0);
    }
  }

  getFilterFormData() {
    this.filterFrm = this.fb.group({
      yojanaId: [0],
      networkId: [0]
    })
  }

  clearfilter(flag: any) {
    if (flag == 'yojana') {
      this.filterFrm.controls['networkId'].setValue(0);
    }else if(flag == 'network'){
      this.filterFrm.controls['yojanaId'].setValue(this.filterFrm.value.yojanaId);
    }
    this.getTableData();
  }

  getTableData() {
    // + (this.filterForm.value.yojanaId || this.getAllLocalStorageData.yojanaId)
    this.spinner.show();
    let formData = this.filterFrm.value;
    this.service.setHttp('get', 'DeviceInfo/GetAllTankInformation?UserId=' + this.getData.userId + '&pageno=' + this.pageNumber + '&pagesize=' + this.pagesize + '&YojanaId=' + (this.getData.yojanaId || formData.yojanaId || 0) + '&NetworkId=' + (formData.networkId || 0), false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200') {
          this.spinner.hide();
          this.responseArray = res.responseData.responseData1;
          this.totalRows = res.responseData.responseData2.totalPages * this.pagesize;
        } else {
          this.spinner.hide();
          this.responseArray = [];
        }
      }), error: (error: any) => {
        this.error.handelError(error.status);
      }
    })
  }

  getYojana() {
    this.service.setHttp('get', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getData.yojanaId, false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200') {
          this.yojanaArray = res.responseData;
          this.filterYojanaArray = res.responseData;
          this.editFlag ? (this.tankForm.controls['yojanaId'].setValue(this.editObj.yojanaId), this.getNetwork()) : '';
          this.filterYojanaArray?.length == 1 ? (this.filterFrm.patchValue({ yojanaId: this.filterYojanaArray[0].yojanaId }), this.getNetwork()) : '';
          // this.yoganaIdArray?.length == 1 ? (this.segmentMasterForm.patchValue({ yojanaId: this.yoganaIdArray[0].yojanaId }), this.getNetworkIdAdd()) : '';
        } else {
          this.yojanaArray = [];
          this.filterYojanaArray= [];
        }
      }), error: (error: any) => {
        this.error.handelError(error.status);
      }
    })
  }
  getNetwork(status?: any) {
    let netId: any;
    netId = status == 'net' ? this.filterFrm.value.yojanaId : this.tankForm.value.yojanaId
    if (netId) {
      this.service.setHttp('get', 'api/MasterDropdown/GetAllNetworkbyUserId?UserId=' + this.getData.userId + '&YojanaId=' + netId, false, false, false, 'valvemgt');
      this.service.getHttp().subscribe({
        next: ((res: any) => {
          if (res.statusCode == '200') {
            status == 'net' ? this.filterNetworkArray = res.responseData : this.networkArray = res.responseData
            this.editFlag ? this.tankForm.controls['networkId'].setValue(this.editObj.networkId) : '';
            this.filterNetworkArray?.length == 1 ? (this.filterFrm.patchValue({ networkId: this.filterNetworkArray[0].networkId }),this.getTableData()) : '';

            this.networkArray?.length == 1 ? (this.tankForm.patchValue({ networkId: this.networkArray[0].networkId }), this.getTableData()) : '';
            this.filterNetworkArray?.length > 1  ? (this.tankForm.patchValue({ networkId: this.tankForm.value.networkId }), this.getTableData()) : '';
          } else {
            this.networkArray = [];
            this.filterNetworkArray = [];
          }
        }), error: (error: any) => {
          this.error.handelError(error.status);
        }
      })
    }
  }

  onSubmit() {
    this.submitted=true;
    let formData = this.tankForm.value;
    if (this.tankForm.invalid) {
      return;
    } else {
      formData.latitude=(formData.address == this.addressNameforAddress ? this.addLatitude || '' : '').toString();
      formData.longitude= (formData.address == this.addressNameforAddress ? this.addLongitude || '' : '').toString();
      formData.isDeleted=false;
      formData.createdBy=this.local.userId();
      formData.modifiedBy=this.local.userId();
   
      this.service.setHttp(!this.editFlag ? 'post' : 'put', 'DeviceInfo/' + (!this.editFlag ? 'AddTankDetails' : 'UpdateTankDetails'), false, formData, false, 'valvemgt');
      this.service.getHttp().subscribe({
        next: ((res: any) => {
          if (res.statusCode == '200') {
            this.closebutton.nativeElement.click();
            this.toastrService.success(res.statusMessage);
            this.clearForm();
            this.getTableData();
          }
        }), error: (error: any) => {
          this.error.handelError(error.status);
        }
      })
    }
  }

  onEditData(res?: any) {
    this.editFlag = true;
    this.editObj = res;
    this.tankForm.patchValue({
      id: res.id,
      tankName: res.tankName,
      address: res.address,
      latitude: res.latitude,
      longitude: res.longitude,
    })
    this.getYojana();
    this.commonService.checkDataType(res.latitude) == true ? this.searchAdd.setValue(res.address) : '';
    this.addLatitude = res.latitude;
    this.addLongitude = res.longitude;
    this.newAddedAddressLat = res.latitude;
    this.newAddedAddressLang = res.longitude;
    this.addressNameforAddress = res.address;
    this.copyAddressNameforAddress = res.address;
  }

  getPagenation(pageNo: number) {
    this.pageNumber = pageNo;
    this.getTableData();
  }

  clearForm(formDirective?: any) {
    this.submitted=false;
    this.editFlag = false;
    this.geFormData();
  }

  getDeleteConfirm(getData?: any) {
    this.delData = {
      "id": getData.id,
      "tankName": getData.tankName,
      "address": getData.address,
      "isDeleted": true,
      "createdBy": this.local.userId(),
      "modifiedBy": this.local.userId(),
      "yojanaId": getData.yojanaId,
      "networkId": getData.networkId,
    }
  }

  deleteData() {
    this.service.setHttp('delete', 'DeviceInfo/DeleteTankDetails', false, this.delData, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.toastrService.success(res.statusMessage);
          this.getTableData();
        }
      }, error: (error: any) => {
        this.error.handelError(error.status);
      }
    })
  }

//#region -----------------------------------------Search Address Method Starts Here----------------------------------------------------------
  geocoder: any;
  addLatitude: any = 19.0898177;
  addLongitude: any = 76.5240298;
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

  markerAddressDragEnd($event: MouseEvent) {
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
    this.tankForm.controls['address'].setValue(this.addressNameforAddress);
    this.searchAdd.setValue(this.addressNameforAddress);
    this.copyAddressNameforAddress = this.addressNameforAddress;
    this.newAddedAddressLat = this.addLatitude;
    this.newAddedAddressLang = this.addLongitude;
    this.searchAddressModel.nativeElement.click();
  }

  clearAddress() {
    this.addressMarkerShow = false;
    this.searchAdd.setValue('');
    this.addressZoomSize = 6;
    this.addressNameforAddress = '';
    this.addLatitude = 19.0898177;
    this.addLongitude = 76.5240298;
  }

  openAddressModel() {
    if (this.editFlag) {
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
}
//#endregion-----------------------------------------Search Address Method Ends Here----------------------------------------------------------
