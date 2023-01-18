import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ValidationService } from 'src/app/core/services/validation.service';
import { MapsAPILoader,MouseEvent} from '@agm/core';
import { CommonService } from 'src/app/core/services/common.service';
@Component({
  selector: 'app-tank-master',
  templateUrl: './tank-master.component.html',
  styleUrls: ['./tank-master.component.css']
})
export class TankMasterComponent implements OnInit {
  tankForm!: FormGroup;
  yojanaArray = new Array();
  networkArray = new Array();
  getData = this.local.getLoggedInLocalstorageData();
  editFlag: boolean = false;
  responseArray = new Array();
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  deleteId!: number;
  delData: any;
  filterFrm!: FormGroup;
  pinCode: any;
 

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
      public validation:ValidationService,
      private mapsAPILoader: MapsAPILoader,
      private ngZone: NgZone,
      private commonService:CommonService
    ) { }

  ngOnInit(): void {
    this.geFormData();
    this.getFilterFormData();
    this.getYojana()
    this.getTableData();
    this.searchAddress();
  }

  geFormData() {
    this.tankForm = this.fb.group({
      "id": [0],
      "tankName": ['', [Validators.required]],
      "address": ['', [Validators.required, Validators.maxLength(500)]],
      "yojanaId": [this.getData.yojanaId, [Validators.required]],
      "networkId": [0, Validators.required],
      "latitude":[''],
      "longitude":[''],
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
      this.filterFrm.controls['yojanaId'].setValue(0);
      this.filterFrm.controls['networkId'].setValue(0);
      this.getTableData();
    } else if (flag == 'network') {
      this.filterFrm.controls['yojanaId'].setValue(this.filterFrm.value.yojanaId);
      this.filterFrm.controls['networkId'].setValue(0);
      this.getTableData();
    }
  }

  getTableData() {
    this.spinner.show();
    let formData = this.filterFrm.value;
    this.service.setHttp('get', 'DeviceInfo/GetAllTankInformation?UserId=' + this.getData.userId + '&pageno=' + this.pageNumber + '&pagesize=' + this.pagesize + '&YojanaId=' + this.getData.yojanaId + '&NetworkId=' + formData.networkId, false, false, false, 'valvemgt');
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
    let formData = this.tankForm.value.yojanaId;
    this.service.setHttp('get', 'api/MasterDropdown/GetAllYojana?YojanaId=' + this.getData.yojanaId, false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200') {
          this.yojanaArray = res.responseData;
          this.editFlag ? (this.tankForm.controls['yojanaId'].setValue(formData), this.getNetwork()) : '';
        } else {
          this.yojanaArray = [];
        }
      }), error: (error: any) => {
        this.error.handelError(error.status);
      }
    })
  }

  getNetwork(status?: any) {
    let netId: any;
    netId = status == 'net' ? this.filterFrm.value.yojanaId : this.tankForm.value.yojanaId
    console.log('netId',netId)
   if(netId){
    this.service.setHttp('get', 'api/MasterDropdown/GetAllNetwork?YojanaId=' + netId, false, false, false, 'valvemgt');
    this.service.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200') {
          this.networkArray = res.responseData;
          this.editFlag ? this.tankForm.controls['yojanaId'].setValue(netId): '';
        } else {
          this.networkArray = [];
        }
      }), error: (error: any) => {
        this.error.handelError(error.status);
      }
    })
   }
  }

  onSubmit() {
    let formData = this.tankForm.value;
    if (this.tankForm.invalid) {
      return;
    } else {
      let obj = {
        ...formData,
         "latitude":(formData.address == this.addressNameforAddress ? this.addLatitude || '' : '').toString() ,
         "longitude":(formData.address == this.addressNameforAddress ? this.addLongitude || '' : '' ).toString(),
        "isDeleted": false,
        "createdBy": this.local.userId(),
        "modifiedBy": this.local.userId(),
      }
      console.log('formData', obj);
      this.service.setHttp(!this.editFlag ? 'post' : 'put', 'DeviceInfo/' + (!this.editFlag ? 'AddTankDetails' : 'UpdateTankDetails'), false, obj, false, 'valvemgt');
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
    this.tankForm.patchValue({
      id: res.id,
      tankName: res.tankName,
      address: res.address,
      yojanaId: res.yojanaId,
      networkId: res.networkId,
      latitude:res.latitude,
      longitude:res.longitude,
    })
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
    formDirective?.resetForm();
    this.editFlag = false;
    this.geFormData();
    // this.tankForm.controls['yojanaId'].setValue(0);this.tankForm.controls['networkId'].setValue(0)
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
 
  markerAddressDragEnd($event:MouseEvent) {
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
     console.log('add',this.addressNameforAddress);
      this.addressZoomSize = 12;
      this.searchAdd.setValue(this.addressNameforAddress);
    }
    console.log('hi', this.addLatitude,this.addLongitude );
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
    if(this.editFlag){
    this.addressZoomSize = 6;
    this.searchAdd.setValue(this.copyAddressNameforAddress);
    this.addLatitude = this.newAddedAddressLat;
    this.addLongitude = this.newAddedAddressLang;
    this.addressMarkerShow = this.copyAddressNameforAddress ? true : false;
    this.addressNameforAddress = this.copyAddressNameforAddress;  
    } else{
      this.clearAddress();
    }    
  }
 
}
