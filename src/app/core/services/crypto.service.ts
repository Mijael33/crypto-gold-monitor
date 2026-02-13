import { Injectable, signal, WritableSignal, computed } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { CryptoAsset, StatisticsData } from '../../shared/models/crypto.models';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  // ✅ PRECIOS REALES - FEBRERO 2026
  private cryptoDataSignal: WritableSignal<CryptoAsset[]> = signal<CryptoAsset[]>([
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      price: 67050.69,      // Real: $67,050
      previousPrice: 67050.69,
      changePercent: 0.00,
      change24h: -2.34,     // -2.34% en 24h
      volume: 32450000000,
      high24h: 68500.00,
      low24h: 66500.50,
      marketCap: 1320000000000,
      rank: 1,
      sma: 67123.45,
      volatility: 1245.67,
      lastUpdate: new Date()
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      price: 1941.71,       // Real: $1,941
      previousPrice: 1941.71,
      changePercent: 0.00,
      change24h: -1.87,     // -1.87% en 24h
      volume: 18400000000,
      high24h: 1980.15,
      low24h: 1920.80,
      marketCap: 233000000000,
      rank: 2,
      sma: 1945.23,
      volatility: 45.67,
      lastUpdate: new Date()
    },
    {
      id: 'ripple',
      name: 'Ripple',
      symbol: 'XRP',
      price: 1.37,          // Real: $1.37
      previousPrice: 1.37,
      changePercent: 0.00,
      change24h: 0.89,      // +0.89% en 24h
      volume: 5200000000,
      high24h: 1.39,
      low24h: 1.35,
      marketCap: 78000000000,
      rank: 3,
      sma: 1.36,
      volatility: 0.03,
      lastUpdate: new Date()
    },
    {
      id: 'solana',
      name: 'Solana',
      symbol: 'SOL',
      price: 84.23,         // Real: $84.23
      previousPrice: 84.23,
      changePercent: 0.00,
      change24h: -1.23,     // -1.23% en 24h
      volume: 3800000000,
      high24h: 86.30,
      low24h: 83.80,
      marketCap: 36500000000,
      rank: 4,
      sma: 84.56,
      volatility: 2.34,
      lastUpdate: new Date()
    },
    {
      id: 'cardano',
      name: 'Cardano',
      symbol: 'ADA',
      price: 0.27,          // Real: $0.27
      previousPrice: 0.27,
      changePercent: 0.00,
      change24h: 1.45,      // +1.45% en 24h
      volume: 950000000,
      high24h: 0.28,
      low24h: 0.26,
      marketCap: 9500000000,
      rank: 5,
      sma: 0.27,
      volatility: 0.01,
      lastUpdate: new Date()
    }
  ]);

  private worker!: Worker;
  private priceHistory: Map<string, number[]> = new Map();
  private subscription!: Subscription;
  
  readonly cryptoAssets = this.cryptoDataSignal.asReadonly();
  
  readonly topGainers = computed(() => {
    return this.cryptoDataSignal()
      .filter(asset => asset.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent);
  });

  readonly topLosers = computed(() => {
    return this.cryptoDataSignal()
      .filter(asset => asset.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent);
  });

  readonly averagePrice = computed(() => {
    const assets = this.cryptoDataSignal();
    if (assets.length === 0) return 0;
    const sum = assets.reduce((acc, curr) => acc + curr.price, 0);
    return sum / assets.length;
  });

  // ✅ ALERTAS PERSISTENTES
  private alertMap: Map<string, number> = new Map();
  private alertTrigger = signal(0);
  
  readonly alerts = computed(() => {
    this.alertTrigger();
    const assets = this.cryptoDataSignal();
    const activeAlerts: CryptoAsset[] = [];
    const entries = Array.from(this.alertMap.entries());
    
    entries.forEach(([assetId, threshold]) => {
      const asset = assets.find(a => a.id === assetId);
      if (asset) {
        activeAlerts.push(asset);
      }
    });
    
    return activeAlerts;
  });

  readonly alertsCount = computed(() => {
    this.alertTrigger();
    return this.alertMap.size;
  });

  readonly alertsActive = computed(() => {
    const assets = this.cryptoDataSignal();
    const activeAlerts: CryptoAsset[] = [];
    const entries = Array.from(this.alertMap.entries());
    
    entries.forEach(([assetId, threshold]) => {
      const asset = assets.find(a => a.id === assetId);
      if (asset && asset.price >= threshold) {
        activeAlerts.push(asset);
      }
    });
    
    return activeAlerts;
  });

  constructor() {
    this.initWorker();
    this.startPriceFeed();
  }

  private initWorker(): void {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('../workers/crypto-worker.worker', import.meta.url));
      this.worker.onmessage = ({ data }) => {
        if (data.type === 'STATISTICS') {
          this.updateStatistics(data.payload);
        }
      };
    }
  }

  private startPriceFeed(): void {
    this.subscription = interval(200).subscribe(() => {
      this.updatePrices();
    });
  }

  private updatePrices(): void {
    this.cryptoDataSignal.update(assets => {
      return assets.map(asset => {
        const previousPrice = asset.price;
        const variationPercent = (Math.random() * 0.04 - 0.02) / 100;
        let newPrice = asset.price * (1 + variationPercent);
        
        if (asset.id === 'bitcoin' || asset.id === 'ethereum') {
          newPrice = Math.round(newPrice * 100) / 100;
        } else {
          newPrice = Math.round(newPrice * 1000) / 1000;
        }

        if (Math.abs(newPrice - previousPrice) < 0.01) {
          newPrice = previousPrice;
        }

        const changePercent = previousPrice !== newPrice 
          ? ((newPrice - previousPrice) / previousPrice) * 100 
          : asset.changePercent;

        if (newPrice !== previousPrice) {
          if (!this.priceHistory.has(asset.id)) {
            this.priceHistory.set(asset.id, []);
          }
          const history = this.priceHistory.get(asset.id)!;
          history.push(newPrice);
          if (history.length > 20) {
            history.shift();
          }

          if (this.worker) {
            this.worker.postMessage({
              type: 'CALCULATE',
              payload: {
                id: asset.id,
                symbol: asset.symbol,
                prices: this.priceHistory.get(asset.id) || [newPrice]
              }
            });
          }
        }

        return {
          ...asset,
          previousPrice,
          price: newPrice,
          changePercent: Math.round(changePercent * 100) / 100,
          change24h: asset.change24h + (Math.random() * 0.02 - 0.01),
          high24h: Math.max(asset.high24h, newPrice),
          low24h: Math.min(asset.low24h, newPrice),
          lastUpdate: new Date()
        };
      });
    });
  }

  private updateStatistics(stats: StatisticsData): void {
    this.cryptoDataSignal.update(assets => {
      return assets.map(asset => {
        if (asset.id === stats.id) {
          return {
            ...asset,
            sma: stats.sma,
            volatility: stats.volatility
          };
        }
        return asset;
      });
    });
  }

  setAlertThreshold(assetId: string, threshold: number): void {
    console.log('🔔 Alerta configurada:', assetId, threshold);
    this.alertMap.set(assetId, threshold);
    this.alertTrigger.update(v => v + 1);
  }

  removeAlertThreshold(assetId: string): void {
    console.log('❌ Alerta eliminada:', assetId);
    this.alertMap.delete(assetId);
    this.alertTrigger.update(v => v + 1);
  }

  getAlertThreshold(assetId: string): number | undefined {
    return this.alertMap.get(assetId);
  }

  isAlertActive(assetId: string): boolean {
    const threshold = this.alertMap.get(assetId);
    if (!threshold) return false;
    const asset = this.cryptoDataSignal().find(a => a.id === assetId);
    return asset ? asset.price >= threshold : false;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.worker?.terminate();
  }
}