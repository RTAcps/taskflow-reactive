import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RealtimeCollaborationComponent } from './features/realtime-collaboration/realtime-collaboration.component';
import { DebugComponent } from './features/debug.component';

@Component({
  selector: 'app-root',
  template: `
    <div class="debug-mode" *ngIf="debugMode">
      <app-debug></app-debug>
    </div>
    
    <div class="main-content" [class.debug-active]="debugMode">
      <app-realtime-collaboration *ngIf="isStandalone; else routerOutlet"></app-realtime-collaboration>
      <ng-template #routerOutlet>
        <router-outlet></router-outlet>
      </ng-template>
    </div>
    
    <div class="debug-toggle" (click)="toggleDebug()">Debug</div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100%;
      overflow: auto;
      background-color: var(--surface-ground, #f8f9fa);
    }
    
    .debug-toggle {
      position: fixed;
      bottom: 10px;
      right: 10px;
      padding: 5px 10px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      cursor: pointer;
      border-radius: 4px;
      z-index: 1000;
    }
    
    .debug-mode {
      margin-bottom: 20px;
    }
    
    .main-content.debug-active {
      opacity: 0.7;
    }
  `],
  imports: [RouterOutlet, CommonModule, RealtimeCollaborationComponent, DebugComponent],
  standalone: true
})
export class ReactiveRootComponent {
  title = 'taskflow-reactive';
  isStandalone = true;
  debugMode = true; // Começamos com o modo de debug ativado para diagnóstico
  
  toggleDebug() {
    this.debugMode = !this.debugMode;
    console.log('Debug mode:', this.debugMode ? 'ON' : 'OFF');
  }
}
