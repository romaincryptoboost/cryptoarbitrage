import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { cryptoAPI } from '../../lib/api';
import { formatCurrency, formatCrypto, formatPercent, generateWalletAddress } from '../../lib/utils';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  QrCode,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface WalletBalance {
  asset: 'BTC' | 'ETH' | 'USDT' | 'USDC';
  balance: number;
  usdValue: number;
  change24h: number;
  address: string;
}

export function WalletPage() {
  const { user } = useAuth();
  const [hideBalances, setHideBalances] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'ETH' | 'USDT' | 'USDC'>('BTC');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const rates = cryptoAPI.getCurrentRates();

  // Mock wallet balances
  const walletBalances: WalletBalance[] = [
    { 
      asset: 'BTC', 
      balance: 0.15432, 
      usdValue: 6675.23, 
      change24h: 2.34,
      address: generateWalletAddress('BTC')
    },
    { 
      asset: 'ETH', 
      balance: 2.8765, 
      usdValue: 7623.45, 
      change24h: -0.87,
      address: generateWalletAddress('ETH')
    },
    { 
      asset: 'USDT', 
      balance: 15420.50, 
      usdValue: 15420.50, 
      change24h: 0.01,
      address: generateWalletAddress('USDT')
    },
    { 
      asset: 'USDC', 
      balance: 5000.00, 
      usdValue: 5000.00, 
      change24h: -0.01,
      address: generateWalletAddress('USDC')
    }
  ];

  const selectedWallet = walletBalances.find(w => w.asset === selectedAsset);
  const totalUSDValue = walletBalances.reduce((sum, wallet) => sum + wallet.usdValue, 0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setNotification({ type: 'success', message: 'Address copied to clipboard!' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawAddress || !selectedWallet) return;

    const amount = parseFloat(withdrawAmount);
    if (amount <= 0 || amount > selectedWallet.balance) {
      setNotification({ type: 'error', message: 'Invalid withdrawal amount' });
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setNotification({ 
        type: 'success', 
        message: `Withdrawal of ${formatCrypto(amount, selectedAsset)} initiated successfully!` 
      });
      setWithdrawAmount('');
      setWithdrawAddress('');
      setIsProcessing(false);
    }, 2000);
  };

  const getNetworkFee = (asset: string) => {
    const fees = {
      BTC: { amount: 0.0001, usd: 4.32 },
      ETH: { amount: 0.002, usd: 5.30 },
      USDT: { amount: 1.0, usd: 1.00 },
      USDC: { amount: 1.0, usd: 1.00 }
    };
    return fees[asset as keyof typeof fees] || fees.BTC;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Wallet
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your crypto assets
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHideBalances(!hideBalances)}
            className="flex items-center space-x-2"
          >
            {hideBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span>{hideBalances ? 'Show' : 'Hide'} Balances</span>
          </Button>
          <Button variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
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

      {/* Portfolio Overview */}
      <Card variant="gradient">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Total Portfolio Value
            </h2>
            <p className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {hideBalances ? '••••••••' : formatCurrency(totalUSDValue)}
            </p>
            <div className="flex items-center justify-center text-sm">
              <span className="text-green-600 dark:text-green-400">
                +{formatPercent(5.67)} (24h)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Selection */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Select Asset
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {walletBalances.map((wallet) => (
              <button
                key={wallet.asset}
                onClick={() => setSelectedAsset(wallet.asset)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedAsset === wallet.asset
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold text-slate-900 dark:text-white mb-1">
                    {wallet.asset}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {hideBalances ? '••••••' : formatCrypto(wallet.balance, wallet.asset)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {hideBalances ? '••••••' : formatCurrency(wallet.usdValue)}
                  </div>
                  <div className={`text-xs mt-1 ${wallet.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercent(wallet.change24h)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deposit/Withdraw Tabs */}
      <Card>
        <CardHeader>
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'deposit'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownLeft className="h-4 w-4" />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'withdraw'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>Withdraw</span>
            </button>
          </div>
        </CardHeader>

        <CardContent>
          {activeTab === 'deposit' ? (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Deposit {selectedAsset}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Send {selectedAsset} to the address below. Minimum deposit: {
                    selectedAsset === 'BTC' ? '0.001 BTC' :
                    selectedAsset === 'ETH' ? '0.01 ETH' :
                    '10 USDT/USDC'
                  }
                </p>
              </div>

              {selectedWallet && (
                <div className="space-y-4">
                  {/* QR Code Placeholder */}
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg border-2 border-slate-200">
                      <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                        <QrCode className="h-16 w-16 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {selectedAsset} Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={selectedWallet.address}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedWallet.address)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Network Info */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Important Notes:
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Only send {selectedAsset} to this address</li>
                      <li>• Deposits require 3 network confirmations</li>
                      <li>• Processing time: 10-30 minutes</li>
                      <li>• Network: {selectedAsset === 'BTC' ? 'Bitcoin' : selectedAsset === 'ETH' ? 'Ethereum' : 'Ethereum (ERC-20)'}</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Withdraw {selectedAsset}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Available balance: {selectedWallet ? formatCrypto(selectedWallet.balance, selectedAsset) : '0'}
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Withdrawal Address"
                  placeholder={`Enter ${selectedAsset} address`}
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="font-mono text-sm"
                />

                <Input
                  label="Amount"
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  step="0.00000001"
                />

                {withdrawAmount && selectedWallet && (
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Amount:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatCrypto(parseFloat(withdrawAmount) || 0, selectedAsset)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Network Fee:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatCrypto(getNetworkFee(selectedAsset).amount, selectedAsset)}
                      </span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-slate-900 dark:text-white">You'll receive:</span>
                        <span className="text-slate-900 dark:text-white">
                          {formatCrypto(Math.max(0, (parseFloat(withdrawAmount) || 0) - getNetworkFee(selectedAsset).amount), selectedAsset)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleWithdraw}
                  className="w-full"
                  size="lg"
                  isLoading={isProcessing}
                  disabled={!withdrawAmount || !withdrawAddress || parseFloat(withdrawAmount) <= 0}
                >
                  {isProcessing ? 'Processing...' : 'Withdraw'}
                </Button>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      <p className="font-medium mb-1">Withdrawal Policy:</p>
                      <ul className="space-y-1">
                        <li>• Withdrawals are processed within 24 hours</li>
                        <li>• Minimum withdrawal: {selectedAsset === 'BTC' ? '0.001 BTC' : selectedAsset === 'ETH' ? '0.01 ETH' : '10 USDT/USDC'}</li>
                        <li>• Daily limit: {formatCurrency(50000)}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Recent Wallet Activity
            </h3>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'DEPOSIT', asset: 'BTC', amount: 0.05, status: 'COMPLETED', date: '2024-01-15' },
              { type: 'WITHDRAW', asset: 'ETH', amount: 1.0, status: 'PENDING', date: '2024-01-15' },
              { type: 'DEPOSIT', asset: 'USDT', amount: 5000, status: 'COMPLETED', date: '2024-01-14' }
            ].map((tx, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    tx.type === 'DEPOSIT' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {tx.type === 'DEPOSIT' ? (
                      <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {tx.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatCrypto(tx.amount, tx.asset)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={tx.status === 'COMPLETED' ? 'success' : 'warning'}>
                    {tx.status}
                  </Badge>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(tx.date).toLocaleDateString()}
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