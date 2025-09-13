import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { formatCrypto, formatCurrency, generateWalletAddress } from '../../lib/utils';
import { cryptoAPI } from '../../lib/api';
import {
  Wallet,
  Plus,
  RefreshCw,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  CheckCircle,
  AlertCircle,
  Copy
} from 'lucide-react';

interface WalletData {
  id: string;
  user_id: string | null;
  asset: 'BTC' | 'ETH' | 'USDT' | 'USDC';
  balance: number;
  address: string | null;
  is_master: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export function AdminWalletsPage() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<'ALL' | 'BTC' | 'ETH' | 'USDT' | 'USDC'>('ALL');
  const [walletType, setWalletType] = useState<'ALL' | 'MASTER' | 'USER'>('ALL');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    fromWallet: '',
    toAddress: '',
    amount: '',
    asset: 'BTC' as 'BTC' | 'ETH' | 'USDT' | 'USDC'
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [rates, setRates] = useState(cryptoAPI.getCurrentRates());

  const assets = ['BTC', 'ETH', 'USDT', 'USDC'] as const;

  useEffect(() => {
    fetchWallets();
    fetchRates();
  }, []);

  const fetchWallets = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('wallets')
        .select(`
          *,
          user:users(email, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWallets(data || []);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      setNotification({ type: 'error', message: 'Failed to fetch wallets' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRates = async () => {
    try {
      const newRates = await cryptoAPI.fetchLatestRates();
      setRates(newRates);
    } catch (error) {
      console.error('Error fetching rates:', error);
    }
  };

  const createMasterWallet = async (asset: 'BTC' | 'ETH' | 'USDT' | 'USDC') => {
    try {
      const address = generateWalletAddress(asset);
      const { error } = await supabase
        .from('wallets')
        .insert([{
          asset,
          balance: 0,
          address,
          is_master: true,
          user_id: null
        }]);

      if (error) throw error;
      
      setNotification({ type: 'success', message: `Master ${asset} wallet created successfully!` });
      await fetchWallets();
    } catch (error) {
      console.error('Error creating master wallet:', error);
      setNotification({ type: 'error', message: 'Failed to create master wallet' });
    }
  };

  const updateWalletBalance = async (walletId: string, newBalance: number) => {
    try {
      const { error } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', walletId);

      if (error) throw error;
      
      setNotification({ type: 'success', message: 'Wallet balance updated successfully!' });
      await fetchWallets();
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      setNotification({ type: 'error', message: 'Failed to update wallet balance' });
    }
  };

  const filteredWallets = wallets.filter(wallet => {
    const matchesAsset = selectedAsset === 'ALL' || wallet.asset === selectedAsset;
    const matchesType = walletType === 'ALL' || 
                       (walletType === 'MASTER' && wallet.is_master) ||
                       (walletType === 'USER' && !wallet.is_master);
    return matchesAsset && matchesType;
  });

  const masterWallets = wallets.filter(w => w.is_master);
  const totalValueByAsset = assets.reduce((acc, asset) => {
    const assetWallets = wallets.filter(w => w.asset === asset);
    const totalBalance = assetWallets.reduce((sum, w) => sum + w.balance, 0);
    const rate = rates[asset as keyof typeof rates] as any;
    acc[asset] = {
      balance: totalBalance,
      usdValue: totalBalance * (rate?.price || 0)
    };
    return acc;
  }, {} as Record<string, { balance: number; usdValue: number }>);

  const totalUSDValue = Object.values(totalValueByAsset).reduce((sum, asset) => sum + asset.usdValue, 0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setNotification({ type: 'success', message: 'Address copied to clipboard!' });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Wallet Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Monitor and manage all platform wallets
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchRates}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Rates
          </Button>
          <Button onClick={() => setShowTransferModal(true)}>
            <Send className="h-4 w-4 mr-2" />
            Transfer Funds
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

      {/* Total Value Overview */}
      <Card variant="gradient">
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Total Platform Value
            </h2>
            <p className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {formatCurrency(totalUSDValue)}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {assets.map(asset => (
                <div key={asset} className="text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{asset}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatCrypto(totalValueByAsset[asset]?.balance || 0, asset)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatCurrency(totalValueByAsset[asset]?.usdValue || 0)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Master Wallets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Master Wallets
            </h3>
            <div className="flex space-x-2">
              {assets.map(asset => {
                const hasMasterWallet = masterWallets.some(w => w.asset === asset);
                return !hasMasterWallet ? (
                  <Button
                    key={asset}
                    size="sm"
                    variant="outline"
                    onClick={() => createMasterWallet(asset)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {asset}
                  </Button>
                ) : null;
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {masterWallets.map(wallet => {
              const rate = rates[wallet.asset as keyof typeof rates] as any;
              const usdValue = wallet.balance * (rate?.price || 0);
              
              return (
                <Card key={wallet.id} className="border-l-4 border-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {wallet.asset} Master
                      </span>
                      <Badge variant="info">Master</Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {formatCrypto(wallet.balance, wallet.asset)}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatCurrency(usdValue)}
                        </p>
                      </div>
                      {wallet.address && (
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex-1 truncate">
                            {wallet.address}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(wallet.address!)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <div className="flex space-x-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            const newBalance = prompt('Enter new balance:', wallet.balance.toString());
                            if (newBalance && !isNaN(parseFloat(newBalance))) {
                              updateWalletBalance(wallet.id, parseFloat(newBalance));
                            }
                          }}
                        >
                          Update Balance
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            All Wallets
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Assets</option>
              {assets.map(asset => (
                <option key={asset} value={asset}>{asset}</option>
              ))}
            </select>

            <select
              value={walletType}
              onChange={(e) => setWalletType(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="MASTER">Master Wallets</option>
              <option value="USER">User Wallets</option>
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading wallets...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWallets.map(wallet => {
                const rate = rates[wallet.asset as keyof typeof rates] as any;
                const usdValue = wallet.balance * (rate?.price || 0);
                
                return (
                  <div key={wallet.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                        <Wallet className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-slate-900 dark:text-white">
                            {wallet.asset} Wallet
                          </p>
                          <Badge variant={wallet.is_master ? 'info' : 'default'}>
                            {wallet.is_master ? 'Master' : 'User'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                          <span>Balance: {formatCrypto(wallet.balance, wallet.asset)}</span>
                          <span>USD: {formatCurrency(usdValue)}</span>
                          {wallet.user && (
                            <span>User: {wallet.user.email}</span>
                          )}
                        </div>
                        {wallet.address && (
                          <div className="flex items-center space-x-2 mt-1">
                            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                              {wallet.address.substring(0, 20)}...
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(wallet.address!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newBalance = prompt('Enter new balance:', wallet.balance.toString());
                          if (newBalance && !isNaN(parseFloat(newBalance))) {
                            updateWalletBalance(wallet.id, parseFloat(newBalance));
                          }
                        }}
                      >
                        Update Balance
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Transfer Funds
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  From Wallet
                </label>
                <select
                  value={transferData.fromWallet}
                  onChange={(e) => setTransferData(prev => ({ ...prev, fromWallet: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select wallet</option>
                  {masterWallets.map(wallet => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.asset} Master - {formatCrypto(wallet.balance, wallet.asset)}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="To Address"
                value={transferData.toAddress}
                onChange={(e) => setTransferData(prev => ({ ...prev, toAddress: e.target.value }))}
                placeholder="Enter destination address"
              />

              <Input
                label="Amount"
                type="number"
                step="0.00000001"
                value={transferData.amount}
                onChange={(e) => setTransferData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowTransferModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    // Simulate transfer
                    setNotification({ type: 'success', message: 'Transfer initiated successfully!' });
                    setShowTransferModal(false);
                    setTransferData({ fromWallet: '', toAddress: '', amount: '', asset: 'BTC' });
                  }}
                >
                  Transfer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}