import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { cryptoAPI } from '../lib/api';
import { formatCurrency, formatPercent } from '../lib/utils';
import {
  Shield,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
  Star,
  Users,
  DollarSign
} from 'lucide-react';

export function HomePage() {
  const rates = cryptoAPI.getCurrentRates();

  const features = [
    {
      icon: Shield,
      title: 'Secure Wallets',
      description: 'Your crypto assets are stored in enterprise-grade wallets with military-grade encryption.'
    },
    {
      icon: TrendingUp,
      title: 'High Returns',
      description: 'Earn up to 15% APY on your crypto investments with our proven arbitrage strategies.'
    },
    {
      icon: Clock,
      title: 'Real-time Trading',
      description: 'Execute trades instantly with live market rates and minimal spreads.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process transactions in seconds with our optimized blockchain infrastructure.'
    }
  ];

  const steps = [
    {
      step: '1',
      title: 'Create Account',
      description: 'Sign up in minutes with just your email and start your crypto journey.'
    },
    {
      step: '2',
      title: 'Deposit Crypto',
      description: 'Fund your wallet with Bitcoin, Ethereum, USDT, or USDC.'
    },
    {
      step: '3',
      title: 'Start Earning',
      description: 'Choose from our investment plans and watch your portfolio grow.'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '25,000+', icon: Users },
    { label: 'Total Volume', value: '$2.5B+', icon: DollarSign },
    { label: 'Average APY', value: '12.5%', icon: TrendingUp },
    { label: 'Uptime', value: '99.9%', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/5 dark:to-purple-600/5" />
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Maximize Your Crypto
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Returns</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            Join thousands of investors earning passive income through our professional 
            crypto arbitrage platform. Secure, transparent, and profitable.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth/register">
              <Button size="lg" className="text-lg px-8 py-4 w-full sm:w-auto">
                Open Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/plans">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 w-full sm:w-auto">
                View Plans
              </Button>
            </Link>
          </div>

          {/* Live Rates Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {Object.entries(rates).filter(([key]) => key !== 'lastFetch').map(([symbol, rate]) => (
              <Card key={symbol} variant="glass" className="p-4">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{symbol}</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency((rate as any).price)}
                </div>
                <div className={`text-sm ${(rate as any).change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercent((rate as any).change24h)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose Crypto-Arbitrage?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Built for serious investors who want professional-grade crypto trading with institutional security.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} hover className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl mb-6">
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Begin your crypto investment journey today
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="p-8 text-center relative">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full text-2xl font-bold mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of investors already earning passive income with Crypto-Arbitrage
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 w-full sm:w-auto">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/plans">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
                Explore Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}