import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Router } from '@angular/router';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  breadcrumbs: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.addBreadcrumbs();
  }

  ngOnInit(): void { }

  addBreadcrumbs() {
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).pipe(map(() => this.activatedRoute))
      .pipe(map((route: any) => {
        while (route.firstChild) { route = route.firstChild; }
        return route;
      }))
      .pipe(filter((route: any) => route.outlet === PRIMARY_OUTLET))
      .subscribe((route: any) => {

        let snapshot = this.router.routerState.snapshot;
        this.breadcrumbs = [];
        let url = snapshot.url;
        let routeData = route.snapshot.data;
        let label = routeData['breadcrumb'];
        let params = snapshot.root.params;

        this.breadcrumbs.push({
          url: url,
          label: label,
          params: params
        });
      });
  }

  onToggleMenu() {
    let sideBar: any = document.getElementById("sidebar");
    let content: any = document.getElementById("content");
    if (sideBar.classList.contains('d-none')) {
      setTimeout(() => {
        sideBar.classList.remove("d-none");
      }, 75);
      content.classList.remove("active");
    }
    else {
      sideBar.classList.add("d-none");
      content.classList.add("active");
    }
  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['../login'], { relativeTo: this.route });
  }
}