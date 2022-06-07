import { Routes } from '@angular/router';


export const PartialLayoutRoutes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', loadChildren: () => import('../partial/dashboard/dashboard.module').then(m => m.DashboardModule) },
    { path: 'valve-list', loadChildren: () => import('../partial/valve-list/valve-list.module').then(m => m.ValveListModule) },
];
