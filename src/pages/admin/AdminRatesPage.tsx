import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { cryptoAPI } from '../../lib/api';
import { formatCurrency, formatPercent } from '../../lib/utils';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface RateData {
  id: string;
  symbol: string;
  price_usd: number;
  change_24h: number;
  last_updated: string;
  created_at: string;
}

export function AdminRatesPage() {
  const [rates, setRates] = useState<RateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ price: string; change: string }>({ price: '', change: '' });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rates_cache')
        .select('*')
        .order('symbol');

      if (error) throw error;
      setRates(data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching rates:', error);
      setNotification({ type: 'error', message: 'Failed to fetch rates' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateAllRates = async () => {
    try {
      setIsUpdating(true);
      
      // Fetch latest rates from API
      const latestRates = await cryptoAPI.fetchLatestRates();
      
      // Update each rate in the database
      const updates = Object.entries(latestRates)
        .filter(([key]) => key !== 'lastFetch')
        .map(([symbol, rateData]) => ({
          symbol,
          price_usd: (rateData as any).price,
          change_24h: (rateData as any).change24h,
          last_updated: new Date().toISOString()
        }));

      for (const update of updates) {
        await supabase
          .from('rates_cache')
          .upsert(update, { onConflict: 'symbol' });
      }

      setNotification({ type: 'success', message: 'All rates updated successfully!' });
      await fetchRates();
    } catch (error) {
      console.error('Error updating rates:', error);
      setNotification({ type: 'error', message: 'Failed to update rates' });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateSingleRate = async (rateId: string, newPrice: number, newChange: number) => {
    try {
      const { error } = await supabase
        .from('rates_cache')
        .update({
          price_usd: newPrice,
          change_24h: newChange,
          last_updated: new Date().toISOString()
        })
        .eq('id', rateId);

      if (error) throw error;
      
      setNotification({ type: 'success', message: 'Rate updated successfully!' });
      setEditingRate(null);
      await fetchRates();
    } catch (error) {
      console.error('Error updating rate:', error);
      setNotification({ type: 'error', message: 'Failed to update rate' });
    }
  };

  const startEditing = (rate: RateData) => {
    setEditingRate(rate.id);
    setEditValues({
      price: rate.price_usd.toString(),
      change: rate.change_24h.toString()
    });
  };

  const cancelEditing = () => {
    setEditingRate(null);
    setEditValues({ price: '', change: '' });
  };

  const saveEdit = (rateId: string) => {
    const price = parseFloat(editValues.price);
    const change = parseFloat(editValues.change);
    
    if (isNaN(price) || isNaN(change)) {
      setNotification({ type: 'error', message: 'Please enter valid numbers' });
      return;
    }
    
    updateSingleRate(rateId, price, change);
  };

  const createMissingRates = async () => {
    const requiredAssets = ['BTC', 'ETH', 'USDT', 'USDC'];
    const existingSymbols = rates.map(r => r.symbol);
    const missingAssets = requiredAssets.filter(asset => !existingSymbols.includes(asset));
    
    if (missingAssets.length === 0) {
      setNotification({ type: 'success', message: 'All required rates already exist' });
      return;
    }

    try {
      const defaultRates = {
        BTC: { price: 43250.75, change: 2.34 },
        ETH: { price: 2650.50, change: -0.87 },
        USDT: { price: 1.0001, change: 0.01 },
        USDC: { price: 0.9999, change: -0.01 }
      };

      const inserts = missingAssets.map(symbol => ({
        symbol,
        price_usd: defaultRates[symbol as keyof typeof defaultRates].price,
        change_24h: defaultRates[symbol as keyof typeof defaultRates].change,
        last_updated: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('rates_cache')
        .insert(inserts);

      if (error) throw error;
      
      setNotification({ type: 'success', message: `Created ${missingAssets.length} missing rates` });
      await fetchRates();
    } catch (error) {
      console.error('Error creating missing rates:', error);
      setNotification({ type: 'error', message: 'Failed to create missing rates' });
    }
  };

  const getAssetName = (symbol: string) => {
    const names = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      USDT: 'Tether',
      USDC: 'USD Coin'
    };
    return names[symbol as keyof typeof names] || symbol;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Rates Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Monitor and manage cryptocurrency exchange rates
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={createMissingRates}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Create Missing Rates
          </Button>
          <Button onClick={updateAllRates} isLoading={isUpdating}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Update All Rates
          </Button>
        </div>
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

      {/* Last Update Info */}
      {lastUpdate && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdate.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rates Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rates.map(rate => (
          <Card key={rate.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {rate.symbol}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {getAssetName(rate.symbol)}
                  </p>
                </div>
                <div className={`flex items-center space-x-1 ${
                  rate.change_24h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {rate.change_24h >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {formatPercent(rate.change_24h)}
                  </span>
                </div>
              </div>

              {editingRate === rate.id ? (
                <div className="space-y-3">
                  <Input
                    label="Price (USD)"
                    type="number"
                    step="0.00000001"
                    value={editValues.price}
                    onChange={(e) => setEditValues(prev => ({ ...prev, price: e.target.value }))}
                  />
                  <Input
                    label="24h Change (%)"
                    type="number"
                    step="0.01"
                    value={editValues.change}
                    onChange={(e) => setEditValues(prev => ({ ...prev, change: e.target.value }))}
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => saveEdit(rate.id)}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditing}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {formatCurrency(rate.price_usd)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Updated: {new Date(rate.last_updated).toLocaleString()}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditing(rate)}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Rate
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rates Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            All Rates
          </h3>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading rates...</p>
            </div>
          ) : rates.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No rates found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Create the initial rates to get started.
              </p>
              <Button onClick={createMissingRates}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Create Initial Rates
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Asset</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Price (USD)</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">24h Change</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Last Updated</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map(rate => (
                    <tr key={rate.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{rate.symbol}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{getAssetName(rate.symbol)}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {formatCurrency(rate.price_usd)}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`flex items-center space-x-1 ${
                          rate.change_24h >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {rate.change_24h >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="font-medium">
                            {formatPercent(rate.change_24h)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(rate.last_updated).toLocaleString()}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(rate)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}