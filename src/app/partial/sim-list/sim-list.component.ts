import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { CommonService } from 'src/app/core/services/common.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalstorageService } from 'src/app/core/services/localstorage.service';
@Component({
  selector: 'app-sim-list',
  templateUrl: './sim-list.component.html',
  styleUrls: ['./sim-list.component.css'],
})
export class SimListComponent implements OnInit
{
  //Initialize variable
  simOperatorList: { id: number; operatorName: string; sortOrder: number }[] =
    [];
  simFormData: FormGroup | any;
  submitted: boolean = false;
  opeartorName: string = '';
  pageNumber: number = 1;
  pagesize: number = 10;
  totalRows: any;
  simArray: {
    id: number;
    simNo: string;
    imsiNo: string;
    operatorId: number;
    operatorName: string;
    createdBy: number;
  }[] = [];
  listCount!: number;
  headerText: string = 'Add Sim';
  @ViewChild('addSimData') addSimData: any;
  deleteSimId: number = 0;

  constructor(
    private spinner: NgxSpinnerService,
    public apiService: ApiService,
    public commonService: CommonService,
    private errorSerivce: ErrorsService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private localStorage: LocalstorageService
  ) { }

  ngOnInit(): void
  {
    this.getSimOperator();
    this.defaultForm();
    this.getAllSimData();
  }

  //Get Sim Operator
  getSimOperator()
  {
    this.spinner.show();
    this.apiService.setHttp(
      'get',
      'SimMaster/GetSIMOperatorList',
      false,
      false,
      false,
      'valvemgt'
    );
    this.apiService.getHttp().subscribe({
      next: (res: any) =>
      {
        if (res.statusCode === '200')
        {
          this.spinner.hide();
          this.simOperatorList = res.responseData;
        } else
        {
          this.spinner.hide();
          this.simOperatorList = [];
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toastrService.error(res.statusMessage);
        }
      },
      error: (error: any) =>
      {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  //Form Initialize
  defaultForm()
  {
    this.simFormData = this.fb.group({
      Id: [0],
      SimNo: [
        '',
        [Validators.required, Validators.pattern('^[a-zA-Z0-9]{20}$')],
      ],
      IMSINo: [
        '',
        [Validators.required, Validators.pattern('^[a-zA-Z0-9]{15}$')],
      ],
      OperatorId: ['0', [Validators.pattern('[^0]+')]],
    });
  }

  //Clear Form Data
  clearForm()
  {
    this.headerText = 'Add Sim';
    this.submitted = false;
    this.defaultForm();
  }

  //To Submit the Data
  onSubmit()
  {
    let formData = this.simFormData.value;
    this.submitted = true;
    if (this.simFormData.invalid)
    {
      return;
    } else
    {
      console.log(this.simFormData);
      let obj = {
        id: formData.Id,
        simNo: formData.SimNo,
        imsiNo: formData.IMSINo,
        operatorId: formData.OperatorId,
        operatorName: this.opeartorName,
        createdBy: this.localStorage.userId(),
      };
      this.spinner.show();
      let urlType;
      formData.Id == 0 ? (urlType = 'POST') : (urlType = 'PUT');
      this.apiService.setHttp(
        urlType,
        'SimMaster',
        false,
        JSON.stringify(obj),
        false,
        'valvemgt'
      );
      this.apiService.getHttp().subscribe(
        (res: any) =>
        {
          if (res.statusCode == '200')
          {
            this.spinner.hide();
            this.toastrService.success(res.statusMessage);
            this.addSimData.nativeElement.click();
            this.getAllSimData();
          } else
          {
            this.toastrService.error(res.statusMessage);
            this.spinner.hide();
          }
        },
        (error: any) =>
        {
          this.errorSerivce.handelError(error.status);
          this.spinner.hide();
        }
      );
    }
  }

  //Get Form Data using Validation Purpose
  get f()
  {
    return this.simFormData.controls;
  }

  //Get Operator Name
  getOperatorName(event: any)
  {
    let selectedOptions = event.target['options'];
    let selectedIndex = selectedOptions.selectedIndex;
    let selectElementText = selectedOptions[selectedIndex].text;
    this.opeartorName = selectElementText;
  }

  //Get Sim Details
  getAllSimData()
  {
    this.spinner.show();
    let obj =
      'UserId=1&pageno=' + this.pageNumber + '&pagesize=' + this.pagesize;
    this.apiService.setHttp(
      'get',
      'SimMaster?' + obj,
      false,
      false,
      false,
      'valvemgt'
    );
    this.apiService.getHttp().subscribe({
      next: (res: any) =>
      {
        if (res.statusCode === '200')
        {
          this.spinner.hide();
          this.simArray = res.responseData.responseData1;
          this.listCount = res.responseData.responseData2?.totalCount;
        } else
        {
          this.spinner.hide();
          this.simArray = [];
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toastrService.error(res.statusMessage);
        }
      },
      error: (error: any) =>
      {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  selPagination(pagNo: number)
  {
    this.pageNumber = pagNo;
    this.getAllSimData();
  }

  //Update Sim Data
  updateSimData(simData: any)
  {
    this.headerText = 'Update Sim';
    this.simFormData.patchValue({
      Id: simData.id,
      SimNo: simData.simNo,
      IMSINo: simData.imsiNo,
      OperatorId: simData.operatorId,
    });
  }

  //Bind We need to deleted Id
  deleteConformation(id: any)
  {
    this.deleteSimId = id;
  }

  //Delete Sim Data
  deleteSim()
  {
    let obj = {
      id: this.deleteSimId,
      deletedBy: this.localStorage.userId(),
    };
    this.apiService.setHttp(
      'DELETE',
      'SimMaster',
      false,
      JSON.stringify(obj),
      false,
      'valvemgt'
    );
    this.apiService.getHttp().subscribe({
      next: (res: any) =>
      {
        if (res.statusCode === '200')
        {
          this.toastrService.success(res.statusMessage);
          this.getAllSimData();
          this.clearForm();
        } else
        {
          this.commonService.checkDataType(res.statusMessage) == false
            ? this.errorSerivce.handelError(res.statusCode)
            : this.toastrService.error(res.statusMessage);
        }
      },
      error: (error: any) =>
      {
        this.errorSerivce.handelError(error.status);
      },
    });
  }

  //Refresh the Value
  refreshData()
  {
    this.getAllSimData();
  }
}
