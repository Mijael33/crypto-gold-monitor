export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  previousPrice: number;
  changePercent: number;
  change24h: number;      // Cambio en 24h
  volume: number;
  high24h: number;
  low24h: number;
  marketCap: number;      // Capitalización de mercado
  rank: number;           // Posición por market cap
  sma: number;           // Simple Moving Average (calculado por worker)
  volatility: number;    // Volatilidad (calculada por worker)
  lastUpdate: Date;
}

export interface PriceData {
  id: string;
  price: number;
  timestamp: number;
}

export interface StatisticsData {
  id: string;
  symbol: string;
  sma: number;
  volatility: number;
  prices: number[];
}