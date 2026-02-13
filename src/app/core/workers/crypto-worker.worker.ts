/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  if (data.type === 'CALCULATE') {
    const { id, symbol, prices } = data.payload;
    
    // Calcular SMA (Simple Moving Average) - 20 períodos
    const sma = calculateSMA(prices);
    
    // Calcular volatilidad (desviación estándar)
    const volatility = calculateVolatility(prices);
    
    postMessage({
      type: 'STATISTICS',
      payload: {
        id,
        symbol,
        sma,
        volatility,
        prices
      }
    });
  }
});

function calculateSMA(prices: number[]): number {
  if (prices.length === 0) return 0;
  
  const sum = prices.reduce((acc, price) => acc + price, 0);
  const sma = sum / prices.length;
  
  return Math.round(sma * 100) / 100;
}

function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  // Calcular desviación estándar
  const mean = prices.reduce((acc, price) => acc + price, 0) / prices.length;
  const squaredDiffs = prices.map(price => Math.pow(price - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / prices.length;
  const volatility = Math.sqrt(variance);
  
  return Math.round(volatility * 100) / 100;
}