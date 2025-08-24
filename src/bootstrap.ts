/**
 * Bootstrap do Angular Application
 * Este arquivo é carregado dinamicamente pelo main.ts
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { ReactiveRootComponent } from './app/app.component';
import { appReactiveConfig } from './app/app.config';

console.log('Bootstrapping TaskFlow Functional Angular application...');

// Configuração adicional para Zone.js para evitar conflitos
(window as any).Zone = (window as any).Zone || {};

bootstrapApplication(ReactiveRootComponent, appReactiveConfig)
  .then(() => {
    console.log('TaskFlow Reactive Angular application bootstrapped successfully!');

    // Sinalizar que a aplicação está pronta
    window.dispatchEvent(new CustomEvent('taskflow-reactive-ready', {
      detail: { component: 'taskflow-reactive', status: 'ready' }
    }));
  })
  .catch(err => {
    console.error('Error bootstrapping TaskFlow Reactive Angular application:', err);
  });
