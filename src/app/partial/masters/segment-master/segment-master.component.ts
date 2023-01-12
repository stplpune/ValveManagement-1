import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-segment-master',
  templateUrl: './segment-master.component.html',
  styleUrls: ['./segment-master.component.css']
})
export class SegmentMasterComponent implements OnInit {

  lat: any = 19.7515;
  lng: any = 75.7139;

  constructor() { }

  ngOnInit(): void {
  }

}
