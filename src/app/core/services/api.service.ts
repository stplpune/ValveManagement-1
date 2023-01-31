import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TitleCasePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  getBaseurl(url: string) {
    switch (url) {

      // Live Server

      case 'valvemgt': return 'http://valvemgt.erpguru.in/'; break;

      // Demo Server

      // case 'valvemgt': return 'http://demovalvemgtapi.eanifarm.com/'; break;
      default: return ''; break;
    }
  }

  private httpObj: any = {
    type: '',
    url: '',
    options: Object
  };

  clearHttp() {
    this.httpObj.type = '';
    this.httpObj.url = '';
    this.httpObj.options = {};
  }

  constructor(private http: HttpClient, private titleCasePipe: TitleCasePipe) { }

  getHttp(): any {
    !this.httpObj.options.body && (delete this.httpObj.options.body)
    !this.httpObj.options.params && (delete this.httpObj.options.params)
    return this.http.request(this.httpObj.type, this.httpObj.url, this.httpObj.options);
  }

  setHttp(type: string, url: string, isHeader: Boolean, obj: any, params: any, baseUrl: any, passHeaderData?: any) {
    isHeader = true;
    this.clearHttp();
    this.httpObj.type = type;
    this.httpObj.url = this.getBaseurl(baseUrl) + url;
    let checkObjDataType = obj instanceof FormData
    if (isHeader && this.titleCasePipe.transform(type) != 'Get' && checkObjDataType == false) {
      let tempObj: any = {
        // "Authorization": "Bearer " 
        'Content-Type': 'application/json',
        // 'Accept': 'application/json'
      };
      this.httpObj.options.headers = new HttpHeaders(tempObj);
    }

    if (passHeaderData) {
      let tempObj: any = {
        "UserId": "" + 1,
      };
      this.httpObj.options.headers = new HttpHeaders(tempObj);
    }

    if (obj !== false) {
      this.httpObj.options.body = obj;
    }
    else {
      this.httpObj.options.body = false;
    }
    if (params !== false) {
      this.httpObj.options.params = params;
    }
    else {
      this.httpObj.options.params = false;
    }
  }
}
