import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { calculateROI, formatCurrency } from '../../lib/utils';
import {
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  apy: number;
  durationDays: number;
  minAmount: number;
  maxAmount: number | null;
  description: string;
  features: string[];
  isActive: boolean;
}

interface Subscription {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  apy: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  totalEarned: number;
  dailyEarning: number;
}

export function ClientPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isInvesting, setIsInvesting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Données des plans simulées
  const plans: Plan[] = [
    {
      id: '1',
      name: 'Débutant',
      apy: 8.5,
      durationDays: 30,
      minAmount: 100,
      maxAmount: 5000,
      description: 'Parfait pour les débutants qui souhaitent commencer leur parcours d\'investissement crypto',
      features: [
        'Rendements composés quotidiens',
        'Support client 24h/24 7j/7',
        'Retraits instantanés',
        'Accès application mobile'
      ],
      isActive: true
    },
    {
      id: '2',
      name: 'Croissance',
      apy: 12.5,
      durationDays: 90,
      minAmount: 1000,
      maxAmount: 25000,
      description: 'Idéal pour faire croître votre portefeuille crypto avec des rendements plus élevés',
      features: [
        'Rendements composés quotidiens',
        'Support client prioritaire',
        'Analyses avancées',
        'Suivi de portefeuille',
        'Outils de gestion des risques'
      ],
      isActive: true
    },
    {
      id: '3',
      name: 'Premium',
      apy: 15.0,
      durationDays: 180,
      minAmount: 5000,
      maxAmount: 100000,
      description: 'Rendements maximaux pour les investisseurs sérieux avec un engagement plus long',
      features: [
        'Rendements composés quotidiens',
        'Gestionnaire de compte dédié',
        'Stratégies d\'investissement personnalisées',
        'Contrôles de risque avancés',
        'Sécurité de niveau institutionnel',
        'Service haut de gamme'
      ],
      isActive: true
    }
  ];

  // Souscriptions actives simulées
  const activeSubscriptions: Subscription[] = [
    {
      id: '1',
      planId: '2',
      planName: 'Croissance',
      amount: 10000,
      apy: 12.5,
      startDate: '2024-01-01',
      endDate: '2024-04-01',
      status: 'ACTIVE',
      totalEarned: 425.50,
      dailyEarning: 3.42
    },
    {
      id: '2',
      planId: '3',
      planName: 'Premium',
      amount: 25000,
      apy: 15.0,
      startDate: '2023-12-15',
      endDate: '2024-06-15',
      status: 'ACTIVE',
      totalEarned: 1875.25,
      dailyEarning: 10.27
    }
  ];

  const handleInvest = async () => {
    if (!selectedPlan || !investmentAmount) return;

    const amount = parseFloat(investmentAmount);
    if (amount < selectedPlan.minAmount || (selectedPlan.maxAmount && amount > selectedPlan.maxAmount)) {
      setNotification({ 
        type: 'error', 
        message: `Le montant d'investissement doit être entre ${formatCurrency(selectedPlan.minAmount)} et ${selectedPlan.maxAmount ? formatCurrency(selectedPlan.maxAmount) : 'illimité'}` 
      });
      return;
    }

    setIsInvesting(true);

    // Simulation d'appel API
    setTimeout(() => {
      setNotification({
        type: 'success',
        message: `Investissement de ${formatCurrency(amount)} dans le plan ${selectedPlan.name} réussi !`
      });
      setSelectedPlan(null);
      setInvestmentAmount('');
      setIsInvesting(false);
    }, 2000);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Plans d'Investissement
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Choisissez le plan parfait pour maximiser vos rendements
          </p>
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

      {/* Souscriptions actives */}
      {activeSubscriptions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Investissements Actifs
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {activeSubscriptions.map((subscription) => (
              <Card key={subscription.id} className="border-l-4 border-green-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Plan {subscription.planName}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {subscription.apy}% APY
                      </p>
                    </div>
                    <Badge variant="success">Actif</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Investi</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(subscription.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Gagné</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(subscription.totalEarned)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Gain Quotidien</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {formatCurrency(subscription.dailyEarning)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Jours Restants</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {getDaysRemaining(subscription.endDate)} jours
                        </p>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div>
                      <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-1">
                        <span>Progression</span>
                        <span>{getProgress(subscription.startDate, subscription.endDate).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgress(subscription.startDate, subscription.endDate)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Début : {new Date(subscription.startDate).toLocaleDateString('fr-FR')}</span>
                      <span>Fin : {new Date(subscription.endDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Plans disponibles */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Plans Disponibles
        </h2>
        <div className="grid lg:grid-cols-3 gap-6">
          {plans.filter(plan => plan.isActive).map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.name === 'Croissance' ? 'ring-2 ring-blue-500 scale-105' : ''}`}
            >
              {plan.name === 'Croissance' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="info" className="bg-blue-600 text-white px-4 py-1">
                    Plus Populaire
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {plan.apy}%
                  <span className="text-lg text-slate-500 dark:text-slate-400 font-normal"> APY</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Durée</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {plan.durationDays} jours
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Investissement Min</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {formatCurrency(plan.minAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Investissement Max</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {plan.maxAmount ? formatCurrency(plan.maxAmount) : 'Illimité'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300 text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full" 
                  variant={plan.name === 'Croissance' ? 'primary' : 'outline'}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Investir Maintenant
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal d'investissement */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Investir dans le Plan {selectedPlan.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {selectedPlan.apy}% APY pour {selectedPlan.durationDays} jours
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Montant d'Investissement (EUR)"
                type="number"
                placeholder="Entrez le montant"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                min={selectedPlan.minAmount}
                max={selectedPlan.maxAmount || undefined}
              />

              <div className="text-sm text-slate-500 dark:text-slate-400">
                Min : {formatCurrency(selectedPlan.minAmount)} • 
                Max : {selectedPlan.maxAmount ? formatCurrency(selectedPlan.maxAmount) : 'Illimité'}
              </div>

              {investmentAmount && parseFloat(investmentAmount) > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Résumé de l'Investissement :
                  </h4>
                  <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    <div className="flex justify-between">
                      <span>Investissement :</span>
                      <span>{formatCurrency(parseFloat(investmentAmount))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rendement Attendu :</span>
                      <span>{formatCurrency(calculateROI(parseFloat(investmentAmount), selectedPlan.apy, selectedPlan.durationDays))}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total Après {selectedPlan.durationDays} jours :</span>
                      <span>{formatCurrency(parseFloat(investmentAmount) + calculateROI(parseFloat(investmentAmount), selectedPlan.apy, selectedPlan.durationDays))}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedPlan(null);
                    setInvestmentAmount('');
                  }}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleInvest}
                  isLoading={isInvesting}
                  disabled={!investmentAmount || parseFloat(investmentAmount) < selectedPlan.minAmount}
                >
                  Confirmer l'Investissement
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}