import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./component/dashboard/dashboard').then((m) => m.DashboardComponent),
    title: 'Dashboard — Manager',
  },
  {
    path: 'board',
    loadComponent: () =>
      import('./component/board/board').then((m) => m.BoardComponent),
    title: 'Board — Manager',
  },
  {
    path: 'backlog',
    loadComponent: () =>
      import('./component/backlog/backlog').then((m) => m.BacklogComponent),
    title: 'Backlog — Manager',
  },
  {
    path: 'issues/:id',
    loadComponent: () =>
      import('./component/issue-detail/issue-detail').then((m) => m.IssueDetailComponent),
    title: 'Issue — Manager',
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./component/settings/settings').then((m) => m.SettingsComponent),
    title: 'Settings — Manager',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
