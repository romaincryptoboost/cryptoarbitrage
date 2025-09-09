import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatCrypto, getStatusColor } from '../../lib/utils';
import {
  History,
  Filter,
  Download,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Target,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'EXCHANGE' | 'INVEST';
  asset: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  fromAsset?: string;
  toAsset?: string;
  exchangeRate?: number;
  planName?: string;
  notes?: string;
  timestamp: string;
  txHash?: string;
}

export function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<string>('30');

  // Données de transaction simulées
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'DEPOSIT',
      asset: 'BTC',
      amount: 0.05,
      status: 'COMPLETED',
      timestamp: '2024-01-15T10:30:00Z',
      txHash: '1a2b3c4d5e6f7g8h9i0j'
    },
    {
      id: '2',
      type: 'EXCHANGE',
      asset: 'ETH',
      amount: 1.0,
      status: 'COMPLETED',
      fromAsset: 'BTC',
      toAsset: 'ETH',
      exchangeRate: 16.3,
      timestamp: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      type: 'INVEST',
      asset: 'USDT',
      amount: 5000,
      status: 'COMPLETED',
      planName: 'Plan Croissance',
      timestamp: '2024-01-15T08:45:00Z'
    },
    {
      id: '4',
      type: 'WITHDRAW',
      asset: 'USDC',
      amount: 1000,
      status: 'PENDING',
      timestamp: '2024-01-14T16:20:00Z'
    },
    {
      id: '5',
      type: 'DEPOSIT',
      asset: 'ETH',
      amount: 2.5,
      status: 'COMPLETED',
      timestamp: '2024-01-14T14:10:00Z',
      txHash: '9z8y7x6w5v4u3t2s1r0q'
    },
    {
      id: '6',
      type: 'EXCHANGE',
      asset: 'USDT',
      amount: 2000,
      status: 'COMPLETED',
      fromAsset: 'ETH',
      toAsset: 'USDT',
      exchangeRate: 2650,
      timestamp: '2024-01-13T11:30:00Z'
    },
    {
      id: '7',
      type: 'WITHDRAW',
      asset: 'BTC',
      amount: 0.02,
      status: 'REJECTED',
      notes: 'Adresse de retrait invalide',
      timestamp: '2024-01-12T09:45:00Z'
    },
    {
      id: '8',
      type: 'INVEST',
      asset: 'USDC',
      amount: 10000,
      status: 'COMPLETED',
      planName: 'Plan Premium',
      timestamp: '2024-01-10T15:20:00Z'
    }
  ];

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tx.planName && tx.planName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'ALL' || tx.type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || tx.status === selectedStatus;
    
    const txDate = new Date(tx.timestamp);
    const daysAgo = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    const matchesDate = dateRange === 'ALL' || txDate >= cutoffDate;
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
      case 'WITHDRAW':
        return <ArrowUpRight className="h-5 w-5 text-red-500" />;
      case 'EXCHANGE':
        return <ArrowLeftRight className="h-5 w-5 text-blue-500" />;
      case 'INVEST':
        return <Target className="h-5 w-5 text-purple-500" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTransactionDescription = (tx: Transaction) => {
    switch (tx.type) {
      case 'DEPOSIT':
        return `Dépôt ${formatCrypto(tx.amount, tx.asset)}`;
      case 'WITHDRAW':
        return `Retrait ${formatCrypto(tx.amount, tx.asset)}`;
      case 'EXCHANGE':
        return `Échange ${tx.fromAsset} vers ${tx.toAsset}`;
      case 'INVEST':
        return `Investissement dans ${tx.planName}`;
      default:
        return 'Transaction';
    }
  };

  const exportTransactions = () => {
    // Fonctionnalité d'export simulée
    const csvContent = [
      ['Date', 'Type', 'Actif', 'Montant', 'Statut', 'Description'].join(','),
      ...filteredTransactions.map(tx => [
        new Date(tx.timestamp).toLocaleDateString('fr-FR'),
        tx.type,
        tx.asset,
        tx.amount,
        tx.status,
        getTransactionDescription(tx)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historique-transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Historique des Transactions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Consultez et gérez votre historique de transactions
          </p>
        </div>
        <Button onClick={exportTransactions} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Filtres
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher des transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tous les Types</option>
              <option value="DEPOSIT">Dépôts</option>
              <option value="WITHDRAW">Retraits</option>
              <option value="EXCHANGE">Échanges</option>
              <option value="INVEST">Investissements</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tous les Statuts</option>
              <option value="COMPLETED">Terminé</option>
              <option value="PENDING">En attente</option>
              <option value="REJECTED">Rejeté</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
              <option value="365">Dernière année</option>
              <option value="ALL">Tout</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques des transactions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Transactions
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {filteredTransactions.length}
                </p>
              </div>
              <History className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Terminées
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {filteredTransactions.filter(tx => tx.status === 'COMPLETED').length}
                </p>
              </div>
              <ArrowDownLeft className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  En attente
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {filteredTransactions.filter(tx => tx.status === 'PENDING').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Rejetées
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {filteredTransactions.filter(tx => tx.status === 'REJECTED').length}
                </p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des transactions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Transactions ({filteredTransactions.length})
          </h3>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Aucune transaction trouvée
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Essayez d'ajuster vos filtres pour voir plus de résultats.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {getTransactionDescription(tx)}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>ID : {tx.id}</span>
                        <span>{new Date(tx.timestamp).toLocaleString('fr-FR')}</span>
                        {tx.txHash && (
                          <span className="font-mono">Hash : {tx.txHash.substring(0, 8)}...</span>
                        )}
                      </div>
                      {tx.notes && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          Note : {tx.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {tx.type === 'EXCHANGE' && tx.fromAsset && tx.toAsset ? (
                            `${formatCrypto(tx.amount, tx.toAsset)}`
                          ) : (
                            formatCrypto(tx.amount, tx.asset)
                          )}
                        </p>
                        {tx.type === 'EXCHANGE' && tx.exchangeRate && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Taux : {tx.exchangeRate.toFixed(8)}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant={
                          tx.status === 'COMPLETED' ? 'success' :
                          tx.status === 'PENDING' ? 'warning' : 'error'
                        }
                      >
                        {tx.status === 'COMPLETED' ? 'Terminé' :
                         tx.status === 'PENDING' ? 'En attente' : 'Rejeté'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}