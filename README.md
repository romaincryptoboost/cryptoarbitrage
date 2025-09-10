# Crypto-Arbitrage Platform

A professional cryptocurrency investment platform built with React, TypeScript, and Supabase.

## Features

- **User Authentication**: Secure login/registration with Supabase Auth
- **Investment Plans**: Multiple investment options with different APY rates
- **Crypto Exchange**: Real-time cryptocurrency exchange functionality
- **Wallet Management**: Multi-asset wallet with deposit/withdrawal capabilities
- **Admin Panel**: Complete administrative interface for platform management
- **Real-time Data**: Live cryptocurrency rates and portfolio tracking

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crypto-arbitrage
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the database migrations:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the migration script from `supabase/migrations/create_initial_schema.sql`

6. Start the development server:
```bash
npm run dev
```

## Database Setup

The application uses Supabase as the backend. The database schema includes:

- **users**: User accounts and profiles
- **wallets**: Cryptocurrency wallet balances
- **transactions**: All financial transactions
- **plans**: Investment plans configuration
- **subscriptions**: User investments
- **notifications**: User notification system
- **rates_cache**: Cached cryptocurrency rates
- **audit_logs**: System audit trail

### Creating the First Admin User

After setting up the database, you'll need to create the first admin user:

1. Register a regular user account through the application
2. In your Supabase dashboard, go to Authentication > Users
3. Find your user and copy the User ID
4. Go to SQL Editor and run:
```sql
UPDATE users SET role = 'ADMIN' WHERE id = 'your-user-id-here';
```

Alternatively, you can use the admin creation interface once you have at least one admin user.

## Admin User Creation

The platform includes a secure admin user creation system:

### Features:
- **Role-based Access**: Only existing admins can create new admin accounts
- **Input Validation**: Email validation and strong password requirements
- **Security**: Proper password hashing and secure session management
- **Database Integration**: Direct integration with Supabase Auth and custom user profiles

### Password Requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number

### Usage:
1. Log in as an existing admin
2. Navigate to Admin > Users
3. Click "Create Admin" button
4. Fill in the required information
5. The new admin will be created with immediate access

## Security Features

- **Row Level Security (RLS)**: All database tables have proper RLS policies
- **Input Validation**: Client and server-side validation for all inputs
- **Secure Authentication**: Supabase Auth with JWT tokens
- **Role-based Access Control**: Separate permissions for clients and admins
- **Audit Logging**: Complete audit trail for administrative actions

## Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, Theme)
├── lib/               # Utilities and API clients
├── pages/             # Page components
│   ├── admin/         # Admin-only pages
│   ├── auth/          # Authentication pages
│   └── client/        # Client dashboard pages
└── data/              # Static data and constants
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting provider

3. Ensure your Supabase project is properly configured with:
   - Database migrations applied
   - RLS policies enabled
   - Auth settings configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.