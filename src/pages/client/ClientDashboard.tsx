import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CryptoChart, generateMockChartData } from '../../components/CryptoChart';
import { cryptoAPI } from '../../lib/api';
import { formatCurrency, formatCrypto, formatPercent } from '../../lib/utils';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Plus,
  ArrowLeftRight,
  Target,
  Bell,
  Eye,
  EyeOff
} from 'lucide-react';

interface WalletBalance {
  asset: 'BTC' | 'ETH' | 'USDT' | 'USDC';
  balance: number;
  usdValue: number;
  change24h: number;
}

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'EXCHANGE' | 'INVEST';
  asset: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  timestamp: string;
}

interface Investment {
  id: string;
  planName: string;
  amount: number;
  apy: number;
  startDate: string;
  endDate: string;
  totalEarned: number;
  status: 'ACTIVE' | 'COMPLETED';
}

export function ClientDashboard() {
  const { user } = useAuth();
  const [hideBalances, setHideBalances] = useState(false);
  const [rates, setRates] = useState(cryptoAPI.getCurrentRates());
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '1y'>('7d');

  // Mock data
  const [walletBalances] = useState<WalletBalance[]>([
    { asset: 'BTC', balance: 0.15432, usdValue: 6675.23, change24h: 2.34 },
    { asset: 'ETH', balance: 2.8765, usdValue: 7623.45, change24h: -0.87 },
    { asset: 'USDT', balance: 15420.50, usdValue: 15420.50, change24h: 0.01 },
    { asset: 'USDC', balance: 5000.00, usdValue: 5000.00, change24h: -0.01 }
  ]);

  const [recentTransactions] = useState<Transaction[]>([
    { id: '1', type: 'DEPOSIT', asset: 'BTC', amount: 0.05, status: 'COMPLETED', timestamp: '2024-01-15T10:30:00Z' },
    { id: '2', type: 'EXCHANGE', asset: 'ETH', amount: 1.0, status: 'COMPLETED', timestamp: '2024-01-15T09:15:00Z' },
    { id: '3', type: 'INVEST', asset: 'USDT', amount: 5000, status: 'PENDING', timestamp: '2024-01-15T08:45:00Z' },
    { id: '4', type: 'WITHDRAW', asset: 'USDC', amount: 1000, status: 'COMPLETED', timestamp: '2024-01-14T16:20:00Z' }
  ]);

  const [activeInvestments] = useState<Investment[]>([
    {
      id: '1',
      planName: 'Growth',
      amount: 10000,
      apy: 12.5,
      startDate: '2024-01-01',
      endDate: '2024-04-01',
      totalEarned: 125.50,
      status: 'ACTIVE'
    },
    {
      id: '2',
      planName: 'Premium',
      amount: 25000,
      apy: 15.0,
      startDate: '2023-12-15',
      endDate: '2024-06-15',
      totalEarned: 875.25,
      status: 'ACTIVE'
    }
  ]);

  const totalUSDValue = walletBalances.reduce((sum, wallet) => sum + wallet.usdValue, 0);
  const totalInvestments = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEarnings = activeInvestments.reduce((sum, inv) => sum + inv.totalEarned, 0);
  const chartData = generateMockChartData(
    selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 365,
    totalUSDValue
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      const newRates = await cryptoAPI.fetchLatestRates();
      setRates(newRates);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'WITHDRAW':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'EXCHANGE':
        return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
      case 'INVEST':
        return <Target className="h-4 w-4 text-purple-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'REJECTED':
        return <Badge variant="error">Rejected</Badge>;
      case 'ACTIVE':
        return <Badge variant="info">Active</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Bon retour, {user?.firstName || 'Investisseur'} !
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Voici un aperçu de votre portefeuille
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setHideBalances(!hideBalances)}
          className="flex items-center space-x-2"
        >
          {hideBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          <span>{hideBalances ? 'Afficher' : 'Masquer'} les Soldes</span>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Portefeuille Total
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {hideBalances ? '••••••' : formatCurrency(totalUSDValue)}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">
                +{formatPercent(8.5)} ce mois
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Investissements Actifs
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {hideBalances ? '••••••' : formatCurrency(totalInvestments)}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {activeInvestments.length} plans actifs
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Gains Totaux
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {hideBalances ? '••••••' : formatCurrency(totalEarnings)}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-600 dark:text-green-400">
                +{formatCurrency(45.75)} aujourd'hui
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Rendement Moyen
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  13,2%
                </p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Sur tous les plans
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Performance du Portefeuille
            </h3>
            <div className="flex items-center space-x-2">
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                {(['7d', '30d', '1y'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      selectedPeriod === period
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CryptoChart data={chartData} height={300} color="#3B82F6" />
        </CardContent>
      </Card>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Actions Rapides
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/client/wallet">
              <Button variant="outline" className="w-full justify-start">
                <ArrowDownLeft className="h-4 w-4 mr-2" />
                Déposer des Cryptos
              </Button>
            </Link>
            <Link to="/client/wallet">
              <Button variant="outline" className="w-full justify-start">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Retirer des Fonds
              </Button>
            </Link>
            <Link to="/client/exchange">
              <Button variant="outline" className="w-full justify-start">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Échanger des Cryptos
              </Button>
            </Link>
            <Link to="/client/plans">
              <Button variant="primary" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Investissement
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Transactions Récentes
              </h3>
              <Link to="/client/history">
                <Button variant="ghost" size="sm">
                  Voir Tout
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(tx.type)}
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {tx.type === 'DEPOSIT' ? 'Dépôt' : 
                         tx.type === 'WITHDRAW' ? 'Retrait' : 
                         tx.type === 'EXCHANGE' ? 'Échange' : 
                         tx.type === 'INVEST' ? 'Investissement' : tx.type}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatCrypto(tx.amount, tx.asset)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(tx.status)}
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(tx.timestamp).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Balances */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Soldes des Portefeuilles
            </h3>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {walletBalances.map((wallet) => (
              <div key={wallet.asset} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {wallet.asset}
                  </span>
                  <span className={`text-sm ${wallet.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercent(wallet.change24h)}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {hideBalances ? '••••••' : formatCrypto(wallet.balance, wallet.asset)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {hideBalances ? '••••••' : formatCurrency(wallet.usdValue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Investments */}
      {activeInvestments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Investissements Actifs
              </h3>
              <Link to="/client/plans">
                <Button variant="ghost" size="sm">
                  Gérer les Plans
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeInvestments.map((investment) => (
                <div key={investment.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {investment.planName} Plan
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {investment.apy}% APY • Started {new Date(investment.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(investment.status)}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Investi</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {hideBalances ? '••••••' : formatCurrency(investment.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Gagné</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {hideBalances ? '••••••' : formatCurrency(investment.totalEarned)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Se termine</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {new Date(investment.endDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}