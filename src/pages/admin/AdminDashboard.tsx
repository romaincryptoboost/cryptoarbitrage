import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CryptoChart, generateMockChartData } from '../../components/CryptoChart';
import { formatCurrency, formatCrypto, formatPercent } from '../../lib/utils';
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Activity,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Eye
} from 'lucide-react';

interface KPI {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<any>;
}

interface RecentActivity {
  id: string;
  type: 'USER_REGISTRATION' | 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT' | 'SYSTEM';
  description: string;
  amount?: number;
  asset?: string;
  timestamp: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('7d');

  // Mock KPIs
  const kpis: KPI[] = [
    {
      label: 'Total Users',
      value: '2,547',
      change: '+12.5%',
      trend: 'up',
      icon: Users
    },
    {
      label: 'Total Volume (24h)',
      value: '$1,234,567',
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign
    },
    {
      label: 'Active Investments',
      value: '$5,678,901',
      change: '+15.7%',
      trend: 'up',
      icon: TrendingUp
    },
    {
      label: 'Pending Actions',
      value: '23',
      change: '-5.1%',
      trend: 'down',
      icon: AlertTriangle
    }
  ];

  // Mock master wallet balances
  const masterWallets = [
    { asset: 'BTC', balance: 125.45678, usdValue: 5423876.32, change24h: 2.34 },
    { asset: 'ETH', balance: 2847.8765, usdValue: 7548923.45, change24h: -0.87 },
    { asset: 'USDT', balance: 1542050.50, usdValue: 1542050.50, change24h: 0.01 },
    { asset: 'USDC', balance: 987654.32, usdValue: 987654.32, change24h: -0.01 }
  ];

  // Mock recent activity
  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'USER_REGISTRATION',
      description: 'New user registered: john.doe@example.com',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'SUCCESS'
    },
    {
      id: '2',
      type: 'DEPOSIT',
      description: 'Large deposit received',
      amount: 50000,
      asset: 'USDT',
      timestamp: '2024-01-15T09:15:00Z',
      status: 'SUCCESS'
    },
    {
      id: '3',
      type: 'WITHDRAWAL',
      description: 'Withdrawal request pending approval',
      amount: 2.5,
      asset: 'BTC',
      timestamp: '2024-01-15T08:45:00Z',
      status: 'PENDING'
    },
    {
      id: '4',
      type: 'INVESTMENT',
      description: 'New investment in Premium plan',
      amount: 25000,
      asset: 'USDC',
      timestamp: '2024-01-14T16:20:00Z',
      status: 'SUCCESS'
    },
    {
      id: '5',
      type: 'SYSTEM',
      description: 'Daily accrual process completed',
      timestamp: '2024-01-14T00:00:00Z',
      status: 'SUCCESS'
    }
  ];

  const totalMasterValue = masterWallets.reduce((sum, wallet) => sum + wallet.usdValue, 0);
  const chartData = generateMockChartData(
    selectedPeriod === '24h' ? 24 : selectedPeriod === '7d' ? 7 : 30,
    totalMasterValue
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'USER_REGISTRATION':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'DEPOSIT':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'INVESTMENT':
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case 'SYSTEM':
        return <Activity className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="success">Success</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'FAILED':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Platform overview and key metrics
          </p>
        </div>
        <Button variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {kpi.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {kpi.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${
                    kpi.label === 'Pending Actions' 
                      ? 'bg-orange-100 dark:bg-orange-900/30' 
                      : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      kpi.label === 'Pending Actions'
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <span className={`${
                    kpi.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {kpi.change} from last period
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Platform Volume Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Platform Volume
            </h3>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {(['24h', '7d', '30d'] as const).map((period) => (
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
        </CardHeader>
        <CardContent>
          <CryptoChart data={chartData} height={300} color="#3B82F6" />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Master Wallets */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Master Wallets
                </h3>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Total Master Wallet Value
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(totalMasterValue)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {masterWallets.map((wallet) => (
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
                        {formatCrypto(wallet.balance, wallet.asset)}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatCurrency(wallet.usdValue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Recent Activity
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {activity.description}
                    </p>
                    {activity.amount && activity.asset && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatCrypto(activity.amount, activity.asset)}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Quick Actions
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span>Manage Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <DollarSign className="h-6 w-6 mb-2" />
              <span>Review Transactions</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Wallet className="h-6 w-6 mb-2" />
              <span>Wallet Operations</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span>Update Rates</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}