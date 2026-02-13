import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CryptoListComponent } from './features/crypto-list/crypto-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CryptoListComponent],  // 👈 ESTO ES LO QUE FALTABA
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'CryptoMonitor';
}