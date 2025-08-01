import { bootstrapApplication } from '@angular/platform-browser';
import { appRectiveConfig } from './app/app.config';
import { ReactiveRootComponent } from './app/app.component';

bootstrapApplication(ReactiveRootComponent, appRectiveConfig)
  .catch(err => console.error(err));
