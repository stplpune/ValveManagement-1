import { Routes } from '@angular/router';


//admin is user Role is 1, 2 for consultant , 3 for Bidder & 4 is bidder subscription

export const PartialLayoutRoutes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', loadChildren: () => import('../partial/dashboard/dashboard.module').then(m => m.DashboardModule) },

];
