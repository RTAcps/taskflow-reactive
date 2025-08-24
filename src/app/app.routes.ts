import { Routes } from '@angular/router';
import { RealtimeCollaborationComponent } from './features/realtime-collaboration/realtime-collaboration.component';

export const routes: Routes = [
  {
    path: '',
    component: RealtimeCollaborationComponent
  },
  {
    path: 'collaboration',
    component: RealtimeCollaborationComponent
  }
];
