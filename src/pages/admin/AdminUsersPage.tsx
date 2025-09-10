import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { validateEmail, validatePassword } from '../../lib/utils';
import {
  Users,
  Plus,
  Search,
  Filter,
  UserPlus,
  Shield,
  User,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}

export function AdminUsersPage() {
  const { user: currentUser, createAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CLIENT' | 'ADMIN'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [adminForm, setAdminForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setNotification({ type: 'error', message: 'Failed to fetch users' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateAdmin = async () => {
    // Validate form
    if (!adminForm.firstName.trim() || !adminForm.lastName.trim()) {
      setNotification({ type: 'error', message: 'First name and last name are required' });
      return;
    }

    if (!validateEmail(adminForm.email)) {
      setNotification({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }

    const passwordValidation = validatePassword(adminForm.password);
    if (!passwordValidation.valid) {
      setNotification({ type: 'error', message: passwordValidation.errors[0] });
      return;
    }

    if (adminForm.password !== adminForm.confirmPassword) {
      setNotification({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    setIsCreatingAdmin(true);

    try {
      const result = await createAdmin(
        adminForm.email,
        adminForm.password,
        adminForm.firstName,
        adminForm.lastName
      );

      if (result.error) {
        setNotification({ type: 'error', message: result.error });
      } else {
        setNotification({ type: 'success', message: 'Admin user created successfully!' });
        setShowCreateAdmin(false);
        setAdminForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        await fetchUsers(); // Refresh the users list
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to create admin user' });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: 'ACTIVE' | 'SUSPENDED') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setNotification({ 
        type: 'success', 
        message: `User ${newStatus.toLowerCase()} successfully` 
      });
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      setNotification({ type: 'error', message: 'Failed to update user status' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'SUSPENDED':
        return <Badge variant="error">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="info">Admin</Badge>;
      case 'CLIENT':
        return <Badge variant="default">Client</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            User Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage platform users and create admin accounts
          </p>
        </div>
        <Button onClick={() => setShowCreateAdmin(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Admin
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Filters
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="CLIENT">Clients</option>
              <option value="ADMIN">Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Users ({filteredUsers.length})
          </h3>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No users found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Try adjusting your filters to see more results.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                      {user.role === 'ADMIN' ? (
                        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user.email.split('@')[0]
                        }
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}
                    {user.id !== currentUser?.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateUserStatus(
                          user.id, 
                          user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
                        )}
                      >
                        {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Create Admin User
                </h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={adminForm.firstName}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
                <Input
                  label="Last Name"
                  value={adminForm.lastName}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>

              <Input
                label="Email"
                type="email"
                value={adminForm.email}
                onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                icon={<Mail className="h-5 w-5" />}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={adminForm.password}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                  icon={<Lock className="h-5 w-5" />}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={adminForm.confirmPassword}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  icon={<Lock className="h-5 w-5" />}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Requirements */}
              {adminForm.password && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">Password Requirements:</p>
                  <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                    <li className={validatePassword(adminForm.password).valid ? 'text-green-600 dark:text-green-400' : ''}>
                      • At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(adminForm.password) ? 'text-green-600 dark:text-green-400' : ''}>
                      • Contains uppercase letter
                    </li>
                    <li className={/[a-z]/.test(adminForm.password) ? 'text-green-600 dark:text-green-400' : ''}>
                      • Contains lowercase letter
                    </li>
                    <li className={/\d/.test(adminForm.password) ? 'text-green-600 dark:text-green-400' : ''}>
                      • Contains number
                    </li>
                  </ul>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCreateAdmin(false);
                    setAdminForm({
                      firstName: '',
                      lastName: '',
                      email: '',
                      password: '',
                      confirmPassword: ''
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateAdmin}
                  isLoading={isCreatingAdmin}
                  disabled={
                    !adminForm.firstName || 
                    !adminForm.lastName || 
                    !adminForm.email || 
                    !adminForm.password || 
                    !adminForm.confirmPassword ||
                    !validatePassword(adminForm.password).valid
                  }
                >
                  Create Admin
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}