import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  constructor( private router: Router,) { }
  ngOnInit(): void {
  }

  refreshUrlTab() {  // RefreshTab 
  this.router.navigate(['segment-master']);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }

