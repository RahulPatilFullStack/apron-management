import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'flight-plans', pathMatch: 'full' },
  {
    path: 'flight-plans',
    loadComponent: () =>
      import('./features/flight-plans/flight-plan-list/flight-plan-list').then(
        (m) => m.FlightPlanList,
      ),
  },
  {
    path: 'flight-plans/:id',
    loadComponent: () =>
      import('./features/flight-plans/flight-plan-detail/flight-plan-detail').then(
        (m) => m.FlightPlanDetail,
      ),
  },
  {
    path: 'stands',
    loadComponent: () =>
      import('./features/stand-assignments/stand-assignment-view/stand-assignment-view').then(
        (m) => m.StandAssignmentView,
      ),
  },
  { path: '**', redirectTo: 'flight-plans' },
];
