import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { cryptoAPI } from '../../lib/api';
import { formatCurrency, formatCrypto, formatPercent } from '../../lib/utils';
import {
  ArrowLeftRight,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  spread: number;
}

interface ExchangeHistory {
  id: string;
  fromAsset: string;
  toAsset: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  timestamp: string;
}

export function ExchangePage() {
  const [fromAsset, setFromAsset] = useState<'BTC' | 'ETH' | 'USDT' | 'USDC'>('BTC');
  const [toAsset, setToAsset] = useState<'BTC' | 'ETH' | 'USDT' | 'USDC'>('ETH');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [rates, setRates] = useState(cryptoAPI.getCurrentRates());

  const assets = ['BTC', 'ETH', 'USDT', 'USDC'] as const;

  // Mock wallet balances
  const walletBalances = {
    BTC: 0.15432,
    ETH: 2.8765,
    USDT: 15420.50,
    USDC: 5000.00
  };

  // Mock exchange history
  const exchangeHistory: ExchangeHistory[] = [
    {
      id: '1',
      fromAsset: 'BTC',
      toAsset: 'ETH',
      fromAmount: 0.1,
      toAmount: 1.63,
      rate: 16.3,
      status: 'COMPLETED',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      fromAsset: 'USDT',
      toAsset: 'BTC',
      fromAmount: 2000,
      toAmount: 0.046,
      rate: 0.000023,
      status: 'COMPLETED',
      timestamp: '2024-01-14T15:20:00Z'
    },
    {
      id: '3',
      fromAsset: 'ETH',
      toAsset: 'USDC',
      fromAmount: 2.5,
      toAmount: 6625,
      rate: 2650,
      status: 'PENDING',
      timestamp: '2024-01-14T09:15:00Z'
    }
  ];

  useEffect(() => {
    const interval = setInterval(async () => {
      const newRates = await cryptoAPI.fetchLatestRates();
      setRates(newRates);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (fromAmount && fromAsset !== toAsset) {
      const amount = parseFloat(fromAmount);
      if (amount > 0) {
        const convertedAmount = cryptoAPI.convertCrypto(amount, fromAsset, toAsset);
        setToAmount(convertedAmount.toFixed(8));
      } else {
        setToAmount('');
      }
    }
  }, [fromAmount, fromAsset, toAsset, rates]);

  const swapAssets = () => {
    const tempAsset = fromAsset;
    setFromAsset(toAsset);
    setToAsset(tempAsset);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleExchange = async () => {
    if (!fromAmount || !toAmount) return;

    const amount = parseFloat(fromAmount);
    const balance = walletBalances[fromAsset];

    if (amount <= 0 || amount > balance) {
      setNotification({ type: 'error', message: 'Insufficient balance or invalid amount' });
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setNotification({
        type: 'success',
        message: `Successfully exchanged ${formatCrypto(amount, fromAsset)} to ${formatCrypto(parseFloat(toAmount), toAsset)}`
      });
      setFromAmount('');
      setToAmount('');
      setIsProcessing(false);
    }, 2000);
  };

  const getExchangeRate = () => {
    if (fromAsset === toAsset) return 1;
    return cryptoAPI.convertCrypto(1, fromAsset, toAsset);
  };

  const getSpread = () => {
    // Mock spread calculation (typically 0.1-0.5%)
    return 0.25;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Exchange
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Swap your crypto assets instantly
          </p>
        </div>
        <Button variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Rates
        </Button>
      </div>

      {/* Notification */}
      {notification && (
        <Card className={`border-l-4 ${
          notification.type === 'success' 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
            : 'border-red-500 bg-red-50 dark:bg-red-900/20'
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={`text-sm ${
                notification.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}>
                {notification.message}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exchange Interface */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Instant Exchange
              </h3>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From Asset */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  From
                </label>
                <div className="flex space-x-4">
                  <select
                    value={fromAsset}
                    onChange={(e) => setFromAsset(e.target.value as any)}
                    className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {assets.map(asset => (
                      <option key={asset} value={asset}>{asset}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    step="0.00000001"
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Available: {formatCrypto(walletBalances[fromAsset], fromAsset)}
                </p>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={swapAssets}
                  className="rounded-full p-3"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>

              {/* To Asset */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  To
                </label>
                <div className="flex space-x-4">
                  <select
                    value={toAsset}
                    onChange={(e) => setToAsset(e.target.value as any)}
                    className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {assets.map(asset => (
                      <option key={asset} value={asset}>{asset}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={toAmount}
                    readOnly
                    className="flex-1 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Balance: {formatCrypto(walletBalances[toAsset], toAsset)}
                </p>
              </div>

              {/* Exchange Details */}
              {fromAmount && toAmount && fromAsset !== toAsset && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Exchange Rate:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      1 {fromAsset} = {getExchangeRate().toFixed(8)} {toAsset}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Spread:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {getSpread()}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Processing Time:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      Instant
                    </span>
                  </div>
                </div>
              )}

              {/* Exchange Button */}
              <Button
                onClick={handleExchange}
                className="w-full"
                size="lg"
                isLoading={isProcessing}
                disabled={!fromAmount || !toAmount || fromAsset === toAsset || parseFloat(fromAmount) <= 0}
              >
                {isProcessing ? 'Processing Exchange...' : 'Exchange Now'}
              </Button>

              {/* Disclaimer */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">Exchange Information:</p>
                    <ul className="space-y-1">
                      <li>• Exchanges are processed instantly</li>
                      <li>• Rates are updated every 30 seconds</li>
                      <li>• No additional fees for exchanges</li>
                      <li>• Minimum exchange: $10 equivalent</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Rates */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Live Rates
                </h3>
                <Badge variant="success" className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(rates).filter(([key]) => key !== 'lastFetch').map(([symbol, rate]) => (
                  <div key={symbol} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {symbol}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {(rate as any).name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency((rate as any).price)}
                      </div>
                      <div className={`text-sm flex items-center ${
                        (rate as any).change24h >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {(rate as any).change24h >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {formatPercent((rate as any).change24h)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Exchange History */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Exchange History
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exchangeHistory.map((exchange) => (
              <div key={exchange.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <ArrowLeftRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {formatCrypto(exchange.fromAmount, exchange.fromAsset)} → {formatCrypto(exchange.toAmount, exchange.toAsset)}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Rate: 1 {exchange.fromAsset} = {exchange.rate.toFixed(8)} {exchange.toAsset}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={
                    exchange.status === 'COMPLETED' ? 'success' :
                    exchange.status === 'PENDING' ? 'warning' : 'error'
                  }>
                    {exchange.status}
                  </Badge>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(exchange.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}