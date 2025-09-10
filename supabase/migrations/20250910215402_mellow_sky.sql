/*
  # Initial Database Schema for Crypto-Arbitrage Platform

  1. New Tables
    - `users` - User accounts with authentication and profile data
    - `wallets` - Crypto wallet balances for users and master wallets
    - `transactions` - All financial transactions (deposits, withdrawals, exchanges, investments)
    - `plans` - Investment plans with APY and duration settings
    - `subscriptions` - User investments in specific plans
    - `notifications` - User notifications system
    - `rates_cache` - Cached cryptocurrency exchange rates
    - `audit_logs` - System audit trail for security and compliance

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for user data access
    - Ensure admins can manage all data while users can only access their own

  3. Functions
    - Add trigger function for updating timestamps
    - Add function to handle new user creation
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('CLIENT', 'ADMIN');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE crypto_asset AS ENUM ('BTC', 'ETH', 'USDT', 'USDC');
CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'WITHDRAW', 'EXCHANGE', 'INVEST');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'REJECTED');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE notification_type AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');
CREATE TYPE theme_type AS ENUM ('dark', 'light');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(255) UNIQUE NOT NULL,
    role user_role DEFAULT 'CLIENT',
    status user_status DEFAULT 'ACTIVE',
    first_name varchar(100),
    last_name varchar(100),
    theme theme_type DEFAULT 'dark',
    password_changed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    duration_days integer NOT NULL,
    apy numeric(5,2) NOT NULL,
    min_amount numeric(20,2) NOT NULL,
    max_amount numeric(20,2),
    description text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    asset crypto_asset NOT NULL,
    balance numeric(20,8) DEFAULT 0,
    address varchar(255),
    is_master boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for wallets table
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_asset ON wallets(asset);
CREATE INDEX IF NOT EXISTS idx_wallets_is_master ON wallets(is_master);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallets_user_asset ON wallets(user_id, asset) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallets_master_asset ON wallets(asset) WHERE is_master = true;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    asset crypto_asset NOT NULL,
    amount numeric(20,8) NOT NULL,
    status transaction_status DEFAULT 'PENDING',
    from_asset crypto_asset,
    to_asset crypto_asset,
    exchange_rate numeric(20,8),
    plan_id uuid REFERENCES plans(id) ON DELETE SET NULL,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    amount numeric(20,2) NOT NULL,
    start_date timestamptz DEFAULT now(),
    end_date timestamptz NOT NULL,
    status subscription_status DEFAULT 'ACTIVE',
    total_earned numeric(20,8) DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for subscriptions table
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    message text NOT NULL,
    type notification_type DEFAULT 'INFO',
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Create indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Rates cache table
CREATE TABLE IF NOT EXISTS rates_cache (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol varchar(10) UNIQUE NOT NULL,
    price_usd numeric(20,8) NOT NULL,
    change_24h numeric(10,4) NOT NULL,
    last_updated timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Create indexes for rates_cache table
CREATE INDEX IF NOT EXISTS idx_rates_cache_symbol ON rates_cache(symbol);
CREATE INDEX IF NOT EXISTS idx_rates_cache_last_updated ON rates_cache(last_updated);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    action varchar(100) NOT NULL,
    resource varchar(100) NOT NULL,
    resource_id uuid,
    details jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- Create indexes for audit_logs table
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'ADMIN'
    ));

-- Plans policies (publicly readable for active plans)
CREATE POLICY "Plans are publicly readable" ON plans
    FOR SELECT TO public
    USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON plans
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'ADMIN'
    ));

-- Wallets policies
CREATE POLICY "Users can view own wallets" ON wallets
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallets" ON wallets
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets" ON wallets
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'ADMIN'
    ));

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON transactions
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON transactions
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'ADMIN'
    ));

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions" ON subscriptions
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON subscriptions
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'ADMIN'
    ));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Rates cache policies (publicly readable)
CREATE POLICY "Rates cache is publicly readable" ON rates_cache
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Admins can update rates cache" ON rates_cache
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'ADMIN'
    ));

-- Audit logs policies
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'ADMIN'
    ));

CREATE POLICY "System can create audit logs" ON audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Add triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, first_name, last_name, role, status, theme, password_changed)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'CLIENT'),
        'ACTIVE',
        'dark',
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert default investment plans
INSERT INTO plans (name, duration_days, apy, min_amount, max_amount, description, is_active) VALUES
    ('Débutant', 30, 8.5, 100, 5000, 'Parfait pour les débutants qui souhaitent commencer leur parcours d''investissement crypto', true),
    ('Croissance', 90, 12.5, 1000, 25000, 'Idéal pour faire croître votre portefeuille crypto avec des rendements plus élevés', true),
    ('Premium', 180, 15.0, 5000, 100000, 'Rendements maximaux pour les investisseurs sérieux avec un engagement plus long', true)
ON CONFLICT DO NOTHING;

-- Insert initial crypto rates
INSERT INTO rates_cache (symbol, price_usd, change_24h, last_updated) VALUES
    ('BTC', 43250.75, 2.34, now()),
    ('ETH', 2650.50, -0.87, now()),
    ('USDT', 1.0001, 0.01, now()),
    ('USDC', 0.9999, -0.01, now())
ON CONFLICT (symbol) DO UPDATE SET
    price_usd = EXCLUDED.price_usd,
    change_24h = EXCLUDED.change_24h,
    last_updated = EXCLUDED.last_updated;