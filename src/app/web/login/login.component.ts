import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { ValidationService } from 'src/app/core/services/validation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup | any;
  submitted = false;
  show_button: Boolean = false;
  show_eye: Boolean = false;
  date: any = new Date();

  constructor(
    private commonService: CommonService,
    public apiService: ApiService,
    private toastrService: ToastrService,
    private errorSerivce: ErrorsService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    public validation:ValidationService
  ) { }

  ngOnInit() {
    this.defaultLoginForm();
  }

  get f() { return this.loginForm.controls };
   
  defaultLoginForm() {
    this.loginForm = this.fb.group({
      UserName: ['', Validators.required],
      Password: ['', Validators.required],
    })
  }

  loginFormSubmit() {
    this.submitted = true;
    let formValue = this.loginForm.value;
    if (this.loginForm.invalid) {
      return;
    } else {
      let obj = {
        "userName": formValue.UserName,
        "password": formValue.Password
      }
      this.spinner.show();
      this.apiService.setHttp('POST', "Login/GetLoginWebsite", false, obj, false, 'valvemgt');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode === "200") {
            this.spinner.hide();
            sessionStorage.setItem('loggedIn', 'true');
            let resData = res.responseData;
            localStorage.setItem('user', JSON.stringify(resData));
            this.toastrService.success('login successfully');
            this.submitted = false;
            this.router.navigate(['../dashboard'], { relativeTo: this.route });
          } else {
            this.spinner.hide();
            this.commonService.checkDataType(res.statusMessage) == false ? this.errorSerivce.handelError(res.statusCode) : this.toastrService.error(res.statusMessage);
          }
        },
        error: ((error: any) => { this.errorSerivce.handelError(error.status), this.spinner.hide(); })
      })
    }
  }

  showPassword() {
    this.show_button = !this.show_button;
    this.show_eye = !this.show_eye;
  }

}
