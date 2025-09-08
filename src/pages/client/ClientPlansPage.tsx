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

  // Mock plans data
  const plans: Plan[] = [
    {
      id: '1',
      name: 'Starter',
      apy: 8.5,
      durationDays: 30,
      minAmount: 100,
      maxAmount: 5000,
      description: 'Perfect for beginners looking to start their crypto investment journey',
      features: [
        'Daily compounding returns',
        '24/7 customer support',
        'Instant withdrawals',
        'Mobile app access'
      ],
      isActive: true
    },
    {
      id: '2',
      name: 'Growth',
      apy: 12.5,
      durationDays: 90,
      minAmount: 1000,
      maxAmount: 25000,
      description: 'Ideal for growing your crypto portfolio with higher returns',
      features: [
        'Daily compounding returns',
        'Priority customer support',
        'Advanced analytics',
        'Portfolio tracking',
        'Risk management tools'
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
      description: 'Maximum returns for serious investors with longer commitment',
      features: [
        'Daily compounding returns',
        'Dedicated account manager',
        'Custom investment strategies',
        'Advanced risk controls',
        'Institutional-grade security',
        'White-glove service'
      ],
      isActive: true
    }
  ];

  // Mock active subscriptions
  const activeSubscriptions: Subscription[] = [
    {
      id: '1',
      planId: '2',
      planName: 'Growth',
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
        message: `Investment amount must be between ${formatCurrency(selectedPlan.minAmount)} and ${selectedPlan.maxAmount ? formatCurrency(selectedPlan.maxAmount) : 'unlimited'}` 
      });
      return;
    }

    setIsInvesting(true);

    // Simulate API call
    setTimeout(() => {
      setNotification({
        type: 'success',
        message: `Successfully invested ${formatCurrency(amount)} in ${selectedPlan.name} plan!`
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Investment Plans
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Choose the perfect plan to maximize your returns
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

      {/* Active Subscriptions */}
      {activeSubscriptions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Active Investments
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {activeSubscriptions.map((subscription) => (
              <Card key={subscription.id} className="border-l-4 border-green-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {subscription.planName} Plan
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {subscription.apy}% APY
                      </p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Invested</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(subscription.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Earned</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(subscription.totalEarned)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Daily Earning</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {formatCurrency(subscription.dailyEarning)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Days Remaining</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {getDaysRemaining(subscription.endDate)} days
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-1">
                        <span>Progress</span>
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
                      <span>Started: {new Date(subscription.startDate).toLocaleDateString()}</span>
                      <span>Ends: {new Date(subscription.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Available Plans
        </h2>
        <div className="grid lg:grid-cols-3 gap-6">
          {plans.filter(plan => plan.isActive).map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.name === 'Growth' ? 'ring-2 ring-blue-500 scale-105' : ''}`}
            >
              {plan.name === 'Growth' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="info" className="bg-blue-600 text-white px-4 py-1">
                    Most Popular
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
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Duration</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {plan.durationDays} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Min Investment</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {formatCurrency(plan.minAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Max Investment</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {plan.maxAmount ? formatCurrency(plan.maxAmount) : 'Unlimited'}
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
                  variant={plan.name === 'Growth' ? 'primary' : 'outline'}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Invest Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Investment Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Invest in {selectedPlan.name} Plan
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {selectedPlan.apy}% APY for {selectedPlan.durationDays} days
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Investment Amount (USD)"
                type="number"
                placeholder="Enter amount"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                min={selectedPlan.minAmount}
                max={selectedPlan.maxAmount || undefined}
              />

              <div className="text-sm text-slate-500 dark:text-slate-400">
                Min: {formatCurrency(selectedPlan.minAmount)} • 
                Max: {selectedPlan.maxAmount ? formatCurrency(selectedPlan.maxAmount) : 'Unlimited'}
              </div>

              {investmentAmount && parseFloat(investmentAmount) > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Investment Summary:
                  </h4>
                  <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    <div className="flex justify-between">
                      <span>Investment:</span>
                      <span>{formatCurrency(parseFloat(investmentAmount))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expected Return:</span>
                      <span>{formatCurrency(calculateROI(parseFloat(investmentAmount), selectedPlan.apy, selectedPlan.durationDays))}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total After {selectedPlan.durationDays} days:</span>
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
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleInvest}
                  isLoading={isInvesting}
                  disabled={!investmentAmount || parseFloat(investmentAmount) < selectedPlan.minAmount}
                >
                  Confirm Investment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}