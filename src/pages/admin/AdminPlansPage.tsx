import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/utils';
import {
  Target,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  duration_days: number;
  apy: number;
  min_amount: number;
  max_amount: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    duration_days: '',
    apy: '',
    min_amount: '',
    max_amount: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setNotification({ type: 'error', message: 'Failed to fetch plans' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      duration_days: '',
      apy: '',
      min_amount: '',
      max_amount: '',
      description: '',
      is_active: true
    });
    setEditingPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const planData = {
        name: formData.name,
        duration_days: parseInt(formData.duration_days),
        apy: parseFloat(formData.apy),
        min_amount: parseFloat(formData.min_amount),
        max_amount: formData.max_amount ? parseFloat(formData.max_amount) : null,
        description: formData.description || null,
        is_active: formData.is_active
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;
        setNotification({ type: 'success', message: 'Plan updated successfully!' });
      } else {
        const { error } = await supabase
          .from('plans')
          .insert([planData]);

        if (error) throw error;
        setNotification({ type: 'success', message: 'Plan created successfully!' });
      }

      setShowCreateModal(false);
      resetForm();
      await fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      setNotification({ type: 'error', message: 'Failed to save plan' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      duration_days: plan.duration_days.toString(),
      apy: plan.apy.toString(),
      min_amount: plan.min_amount.toString(),
      max_amount: plan.max_amount?.toString() || '',
      description: plan.description || '',
      is_active: plan.is_active
    });
    setShowCreateModal(true);
  };

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update({ is_active: !currentStatus })
        .eq('id', planId);

      if (error) throw error;
      
      setNotification({ 
        type: 'success', 
        message: `Plan ${!currentStatus ? 'activated' : 'deactivated'} successfully!` 
      });
      await fetchPlans();
    } catch (error) {
      console.error('Error updating plan status:', error);
      setNotification({ type: 'error', message: 'Failed to update plan status' });
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      
      setNotification({ type: 'success', message: 'Plan deleted successfully!' });
      await fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      setNotification({ type: 'error', message: 'Failed to delete plan' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Investment Plans Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Create and manage investment plans for your platform
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
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

      {/* Plans Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Plans
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {plans.length}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Active Plans
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {plans.filter(plan => plan.is_active).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Average APY
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {plans.length > 0 ? (plans.reduce((sum, plan) => sum + plan.apy, 0) / plans.length).toFixed(1) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Investment Plans
          </h3>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading plans...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No plans found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Create your first investment plan to get started.
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className={`${!plan.is_active ? 'opacity-60' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {plan.name}
                      </h4>
                      <Badge variant={plan.is_active ? 'success' : 'error'}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {plan.apy}%
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-normal"> APY</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Duration:</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {plan.duration_days} days
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Min Amount:</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {formatCurrency(plan.min_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Max Amount:</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {plan.max_amount ? formatCurrency(plan.max_amount) : 'Unlimited'}
                        </span>
                      </div>
                      {plan.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                          {plan.description}
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(plan)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePlanStatus(plan.id, plan.is_active)}
                        className="flex-1"
                      >
                        {plan.is_active ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePlan(plan.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Plan Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Duration (days)"
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_days: e.target.value }))}
                    required
                    min="1"
                  />
                  <Input
                    label="APY (%)"
                    type="number"
                    step="0.1"
                    value={formData.apy}
                    onChange={(e) => setFormData(prev => ({ ...prev, apy: e.target.value }))}
                    required
                    min="0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Min Amount"
                    type="number"
                    step="0.01"
                    value={formData.min_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_amount: e.target.value }))}
                    required
                    min="0"
                  />
                  <Input
                    label="Max Amount (optional)"
                    type="number"
                    step="0.01"
                    value={formData.max_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_amount: e.target.value }))}
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                    placeholder="Plan description..."
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="text-sm text-slate-700 dark:text-slate-300">
                    Plan is active
                  </label>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isSubmitting}
                  >
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}