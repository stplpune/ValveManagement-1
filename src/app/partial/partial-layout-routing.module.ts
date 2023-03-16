import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessDeniedComponent } from 'src/app/errors/access-denied/access-denied.component';

const routes: Routes = [
  {
    path: 'dashboard', loadChildren: () => import('../partial/dashboard/dashboard.module').then(m => m.DashboardModule),
    data: { breadcrumb: [{ title: 'Dashboard', active: true }] }
  },
  {
    path: 'valve-list', loadChildren: () => import('../partial/valve-list/valve-list.module').then(m => m.ValveListModule),
    data: { breadcrumb: [{ title: 'Valve List', active: true }] }
  },
  { 
    path: 'valve-detail', loadChildren: () => import('../partial/masters/valve-detail/valve-detail.module').then(m => m.ValveDetailModule), 
    data: { breadcrumb: [{ title: 'Valve Detail', active: true }] }
  },
  {
    path: 'sim-list', loadChildren: () => import('../partial/sim-list/sim-list.module').then(m => m.SimListModule),
    data: { breadcrumb: [{ title: 'SIM Master', active: true }] }
  },
  {
    path: 'user-registration', loadChildren: () => import('../partial/user-registration/user-registration.module').then(m => m.UserRegistrationModule),
    data: { breadcrumb: [{ title: 'User Registration', active: true }] }
  },
  {
    path: 'page-right-access', loadChildren: () => import('../partial/page-right-access/page-right-access.module').then(m => m.PageRightAccessModule),
    data: { breadcrumb: [{ title: 'Page Right Access', active: true }] }
  },
  {
    path: 'segment-master', loadChildren: () => import('../partial/masters/segment-master/segment-master.module').then(m => m.SegmentMasterModule),
    data: { breadcrumb: [{ title: 'Segment Master', active: true }] }
  },
  {
    path: 'network-master', loadChildren: () => import('../partial/masters/network-master/network-master.module').then(m => m.NetworkMasterModule),
    data: { breadcrumb: [{ title: 'Network Master', active: true }] }
  },
  {
    path: 'yojana-master', loadChildren: () => import('../partial/masters/yojana-master/yojana-master.module').then(m => m.YojanaMasterModule),
    data: { breadcrumb: [{ title: 'Yojana Master', active: true }] }
  },
  {
    path: 'valve-connection', loadChildren: () => import('../partial/masters/valve-connection/valve-connection.module').then(m => m.ValveConnectionModule),
    data: { breadcrumb: [{ title: 'Valve Connection', active: true }] }
  },
  {
    path: 'valve-segment-assignment', loadChildren: () => import('../partial/masters/valve-segment-assignment/valve-segment-assignment.module').then(m => m.ValveSegmentAssignmentModule),
    data: { breadcrumb: [{ title: 'Valve Segment Assignment', active: true }] }
  },
  { 
    path: 'tank-segment-assignment', loadChildren: () => import('../partial/masters/tank-segment-assignment/tank-segment-assignment.module').then(m => m.TankSegmentAssignmentModule),
    data: { breadcrumb: [{ title: 'Tank Segment Assignment', active: true }] }
  },
  {
    path: 'tank-sensor-device-master', loadChildren: () => import('../partial/masters/tank-sensor-device-master/tank-sensor-device-master.module').then(m => m.TankSensorDeviceMasterModule),
    data: { breadcrumb: [{ title: 'Tank Sensor Device Master', active: true }] }
  },
  {
    path: 'tank-master', loadChildren: () => import('../partial/masters/tank-master/tank-master.module').then(m => m.TankMasterModule),
    data: { breadcrumb: [{ title: 'Tank Master', active: true }] }
  },
  {
    path: 'tank-calibration', loadChildren: () => import('../partial/masters/tank-calibration/tank-calibration.module').then(m => m.TankCalibrationModule),
    data: { breadcrumb: [{ title: 'Tank Calibration', active: true }] }
  },
  { 
    path: 'valve-name-assignment', loadChildren: () => import('../partial/masters/valve-name-assignment/valve-name-assignment.module').then(m => m.ValveNameAssignmentModule), 
    data: { breadcrumb: [{ title: 'Valve Name Assignment', active: true }] }
  },
  { 
    path: 'attendance-report', loadChildren: () => import('../partial/masters/reports/attendance-report/attendance-report.module').then(m => m.AttendanceReportModule),
    data: { breadcrumb: [{ title: 'Attendance Report', active: true }] }
  },
  { 
    path: 'consumer-water-summery', loadChildren: () => import('../partial/masters/reports/consumer-water-summery/consumer-water-summery.module').then(m => m.ConsumerWaterSummeryModule),
    data: { breadcrumb: [{ title: 'Consumer Water Summery', active: true }] }
  },
  {
     path: 'valve-water-summery', loadChildren: () => import('../partial/masters/reports/valve-water-summery/valve-water-summery.module').then(m => m.ValveWaterSummeryModule),
     data: { breadcrumb: [{ title: 'Valve Water Summery', active: true }] } 
    },


 
  { path: 'access-denied', component: AccessDeniedComponent, data: { title: 'Access Denied' } },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PartialLayoutRoutingModule { }
