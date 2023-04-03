import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ValveManagement';

  constructor(private titleService: Title, private router: Router, private activatedRoute: ActivatedRoute){ this.setTitle(); }

  setTitle() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd),  // set title dynamic
    ).subscribe(() => {
      var rt = this.getChild(this.activatedRoute);
      if(rt?.data._value.breadcrumb){
        let titleName = rt?.data._value?.breadcrumb[rt.data?._value?.breadcrumb?.length - 1]?.title;        
        rt.data.subscribe(() => {
          this.titleService.setTitle(titleName);
        })
      }
    });
  }

  getChild(activatedRoute: ActivatedRoute): any {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }
}
