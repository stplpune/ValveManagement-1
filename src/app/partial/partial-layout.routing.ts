import { Routes } from '@angular/router';


export const PartialLayoutRoutes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', loadChildren: () => import('../partial/dashboard/dashboard.module').then(m => m.DashboardModule) },

];
