import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; background-color: #f0f0f0; border: 2px solid #333; margin: 20px;">
      <h1 style="color: #333;">Debug Component</h1>
      <p>Se você está vendo esta mensagem, a renderização de componentes está funcionando!</p>
      
      <div style="margin-top: 20px; padding: 10px; background-color: #e0e0e0;">
        <h2>Informações de Debug:</h2>
        <ul>
          <li>Data/Hora: {{ currentDateTime }}</li>
          <li>Browser: {{ userAgent }}</li>
        </ul>
      </div>
      
      <div style="margin-top: 20px; display: flex; gap: 10px;">
        <button (click)="testClick()" 
                style="padding: 10px 20px; background-color: blue; color: white; border: none; cursor: pointer;">
          Testar Clique
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class DebugComponent {
  currentDateTime = new Date().toLocaleString();
  userAgent = navigator.userAgent;
  
  testClick() {
    alert('O componente está respondendo a eventos!');
  }
}
