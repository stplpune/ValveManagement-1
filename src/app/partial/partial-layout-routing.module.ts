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
    path: 'sim-list', loadChildren: () => import('../partial/sim-list/sim-list.module').then(m => m.SimListModule),
    data: { breadcrumb: [{ title: 'SIM List', active: true }] }
  },
  {
    path: 'user-registration', loadChildren: () => import('../partial/user-registration/user-registration.module').then(m => m.UserRegistrationModule),
    data: { breadcrumb: [{ title: 'User Registration', active: true }] }
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
    path: 'valve-segment-assignment', loadChildren: () => import('../partial/masters/valve-segment-assignment/valve-segment-assignment.module').then(m => m.ValveSegmentAssignmentModule),
    data: { breadcrumb: [{ title: 'Valve/Tank Segment Assignment', active: true }] }
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
  { path: 'access-denied', component: AccessDeniedComponent, data: { title: 'Access Denied' } },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PartialLayoutRoutingModule { }
