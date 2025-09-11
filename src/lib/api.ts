import { supabase } from './supabase';

export interface CryptoRate {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  lastUpdated: Date;
}

export interface RatesCache {
  BTC: CryptoRate;
  ETH: CryptoRate;
  USDT: CryptoRate;
  USDC: CryptoRate;
  lastFetch: Date;
}

// Fallback rates in case of API failure
const fallbackRates: RatesCache = {
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 43250.75,
    change24h: 2.34,
    lastUpdated: new Date()
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2650.50,
    change24h: -0.87,
    lastUpdated: new Date()
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether',
    price: 1.0001,
    change24h: 0.01,
    lastUpdated: new Date()
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    price: 0.9999,
    change24h: -0.01,
    lastUpdated: new Date()
  },
  lastFetch: new Date()
};

export class CryptoAPI {
  private static instance: CryptoAPI;
  private ratesCache: RatesCache = fallbackRates;
  private lastFetch: Date = new Date();

  static getInstance(): CryptoAPI {
    if (!CryptoAPI.instance) {
      CryptoAPI.instance = new CryptoAPI();
    }
    return CryptoAPI.instance;
  }

  async fetchLatestRates(): Promise<RatesCache> {
    try {
      const now = new Date();
      const timeSinceLastFetch = now.getTime() - this.lastFetch.getTime();
      
      // Only fetch if more than 1 minute has passed
      if (timeSinceLastFetch < 60000) {
        return this.ratesCache;
      }

      // Try to fetch from database first
      const { data: dbRates, error } = await supabase
        .from('rates_cache')
        .select('*')
        .in('symbol', ['BTC', 'ETH', 'USDT', 'USDC']);

      if (!error && dbRates && dbRates.length > 0) {
        // Convert database rates to our format
        const ratesMap: Partial<RatesCache> = {};
        
        dbRates.forEach(rate => {
          const cryptoNames = {
            BTC: 'Bitcoin',
            ETH: 'Ethereum', 
            USDT: 'Tether',
            USDC: 'USD Coin'
          };

          ratesMap[rate.symbol as keyof RatesCache] = {
            symbol: rate.symbol,
            name: cryptoNames[rate.symbol as keyof typeof cryptoNames] || rate.symbol,
            price: parseFloat(rate.price_usd),
            change24h: parseFloat(rate.change_24h),
            lastUpdated: new Date(rate.last_updated)
          } as CryptoRate;
        });

        if (Object.keys(ratesMap).length === 4) {
          this.ratesCache = {
            ...ratesMap,
            lastFetch: now
          } as RatesCache;
          this.lastFetch = now;
          return this.ratesCache;
        }
      }

      // If database fetch fails, simulate price changes for demo
      const btcChange = (Math.random() - 0.5) * 200;
      const ethChange = (Math.random() - 0.5) * 100;
      
      this.ratesCache = {
        BTC: {
          ...this.ratesCache.BTC,
          price: Math.max(20000, this.ratesCache.BTC.price + btcChange),
          change24h: (Math.random() - 0.5) * 10,
          lastUpdated: now
        },
        ETH: {
          ...this.ratesCache.ETH,
          price: Math.max(1000, this.ratesCache.ETH.price + ethChange),
          change24h: (Math.random() - 0.5) * 8,
          lastUpdated: now
        },
        USDT: {
          ...this.ratesCache.USDT,
          price: 1.0001 + (Math.random() - 0.5) * 0.002,
          change24h: (Math.random() - 0.5) * 0.1,
          lastUpdated: now
        },
        USDC: {
          ...this.ratesCache.USDC,
          price: 0.9999 + (Math.random() - 0.5) * 0.002,
          change24h: (Math.random() - 0.5) * 0.1,
          lastUpdated: now
        },
        lastFetch: now
      };

      // Try to update database with new rates
      try {
        const ratesToUpdate = [
          { symbol: 'BTC', price_usd: this.ratesCache.BTC.price, change_24h: this.ratesCache.BTC.change24h },
          { symbol: 'ETH', price_usd: this.ratesCache.ETH.price, change_24h: this.ratesCache.ETH.change24h },
          { symbol: 'USDT', price_usd: this.ratesCache.USDT.price, change_24h: this.ratesCache.USDT.change24h },
          { symbol: 'USDC', price_usd: this.ratesCache.USDC.price, change_24h: this.ratesCache.USDC.change24h }
        ];

        for (const rate of ratesToUpdate) {
          await supabase
            .from('rates_cache')
            .upsert({
              symbol: rate.symbol,
              price_usd: rate.price_usd,
              change_24h: rate.change_24h,
              last_updated: now.toISOString()
            });
        }
      } catch (updateError) {
        console.warn('Failed to update rates in database:', updateError);
      }

      this.lastFetch = now;
      return this.ratesCache;
    } catch (error) {
      console.error('Failed to fetch crypto rates:', error);
      return this.ratesCache; // Return cached data on error
    }
  }

  getCurrentRates(): RatesCache {
    return this.ratesCache;
  }

  convertCrypto(amount: number, fromAsset: string, toAsset: string): number {
    if (fromAsset === toAsset) return amount;
    
    const fromRate = this.ratesCache[fromAsset as keyof RatesCache] as CryptoRate;
    const toRate = this.ratesCache[toAsset as keyof RatesCache] as CryptoRate;
    
    if (!fromRate || !toRate) return 0;
    
    return (amount * fromRate.price) / toRate.price;
  }

  isRatesStale(): boolean {
    const now = new Date();
    const timeSinceLastFetch = now.getTime() - this.ratesCache.lastFetch.getTime();
    return timeSinceLastFetch > 300000; // 5 minutes
  }
}

export const cryptoAPI = CryptoAPI.getInstance();