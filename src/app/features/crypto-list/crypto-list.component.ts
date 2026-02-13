import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CryptoService } from '../../core/services/crypto.service';
import { CryptoCardComponent } from '../crypto-card/crypto-card.component';
import { HighlightChangeDirective } from '../../shared/directives/highlight-change.directive';

@Component({
  selector: 'app-crypto-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CryptoCardComponent,     // ✅ IMPORTAR TARJETAS
    HighlightChangeDirective
  ],
  templateUrl: './crypto-list.component.html',
  styleUrls: ['./crypto-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CryptoListComponent {
  readonly cryptoAssets = this.cryptoService.cryptoAssets;
  readonly topGainers = this.cryptoService.topGainers;
  readonly topLosers = this.cryptoService.topLosers;
  readonly averagePrice = this.cryptoService.averagePrice;
  readonly alerts = this.cryptoService.alerts;
  readonly alertsCount = this.cryptoService.alertsCount;
  readonly alertsActive = this.cryptoService.alertsActive;

  searchTerm = signal('');
  viewMode = signal<'grid' | 'table'>('table');  // ✅ POR DEFECTO TABLA (COMO ANTES)
  selectedFilter = signal<'all' | 'gainers' | 'losers'>('all');
  showAlertsOnly = signal(false);
  alertCreatedMessage = signal<string | null>(null);

  readonly filteredAssets = computed(() => {
    const assets = this.cryptoAssets();
    const search = this.searchTerm();
    const filter = this.selectedFilter();
    const showOnly = this.showAlertsOnly();
    const alertas = this.alerts();
    
    let filtered = [...assets];
    
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(term) || 
        asset.symbol.toLowerCase().includes(term)
      );
    }

    switch (filter) {
      case 'gainers':
        filtered = filtered.filter(a => a.changePercent > 0);
        break;
      case 'losers':
        filtered = filtered.filter(a => a.changePercent < 0);
        break;
    }

    if (showOnly) {
      const alertedIds = new Set(alertas.map(a => a.id));
      filtered = filtered.filter(asset => alertedIds.has(asset.id));
    }

    return filtered.sort((a, b) => a.rank - b.rank);
  });

  readonly totalAssets = computed(() => this.cryptoAssets().length);

  constructor(private cryptoService: CryptoService) {}

  onSetAlert(event: { id: string; threshold: number }): void {
    let threshold = event.threshold;
    if (event.id === 'cardano' && threshold < 0.30) {
      threshold = 0.30;
    }
    
    this.cryptoService.setAlertThreshold(event.id, threshold);
    this.alertCreatedMessage.set(`✅ Alerta configurada: $${threshold.toLocaleString()}`);
    setTimeout(() => this.alertCreatedMessage.set(null), 2000);
  }

  onRemoveAlert(assetId: string): void {
    this.cryptoService.removeAlertThreshold(assetId);
    this.alertCreatedMessage.set(`❌ Alerta eliminada`);
    setTimeout(() => this.alertCreatedMessage.set(null), 2000);
  }

  getAlertThreshold(assetId: string): number | undefined {
    return this.cryptoService.getAlertThreshold(assetId);
  }

  isAlertActive(assetId: string): boolean {
    return this.cryptoService.isAlertActive(assetId);
  }

  updateSearchTerm(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  setFilter(filter: 'all' | 'gainers' | 'losers'): void {
    this.selectedFilter.set(filter);
  }

  toggleAlertsOnly(): void {
    this.showAlertsOnly.set(!this.showAlertsOnly());
  }

  setViewMode(mode: 'grid' | 'table'): void {
    this.viewMode.set(mode);
  }

  trackByAssetId(index: number, asset: any): string {
    return asset.id;
  }

  protected Math = Math;
}