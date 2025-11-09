# BaseTask - Decentralized Task-to-Earn Platform

A full-stack decentralized application built on Base Sepolia testnet that enables users to create tasks, complete them, and earn USDC rewards through blockchain-powered payments.

## 🚀 Features

- **Wallet Connection**: Connect via WalletConnect to Base Sepolia testnet
- **Task Management**: Create tasks with custom rewards, deadlines, and proof requirements
- **Decentralized Payments**: USDC payments sent directly on-chain upon task approval
- **User Dashboard**: Track created tasks and completed work
- **Submission System**: Workers submit proof, creators approve and pay automatically

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Wallet Integration**: WalletConnect v2, Web3Modal
- **Blockchain**: Base Sepolia Testnet (Chain ID: 84532)
- **Smart Contracts**: ethers.js for USDC token transfers
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel-ready

## 📋 Prerequisites

Before you begin, ensure you have:

1. A Web3 wallet (MetaMask, Coinbase Wallet, etc.)
2. Base Sepolia testnet configured in your wallet
3. Test ETH for gas fees (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
4. Test USDC tokens on Base Sepolia
5. Supabase account (free tier works)
6. WalletConnect Project ID (from [WalletConnect Cloud](https://cloud.walletconnect.com/))

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
# Navigate to your project directory
cd "New folder"

# No npm dependencies needed - static site!
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Create the following tables:

**users table:**
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
```

**tasks table:**
```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_wallet TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward NUMERIC NOT NULL,
  proof_type TEXT NOT NULL,
  deadline DATE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tasks_creator ON tasks(creator_wallet);
CREATE INDEX idx_tasks_status ON tasks(status);
```

**submissions table:**
```sql
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  worker_wallet TEXT NOT NULL,
  proof TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_submissions_task ON submissions(task_id);
CREATE INDEX idx_submissions_worker ON submissions(worker_wallet);
CREATE INDEX idx_submissions_status ON submissions(status);
```

3. Get your Supabase URL and Anon Key from Project Settings > API

### 3. Get WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your Project ID

### 4. Configure Environment Variables

Edit `js/config.js` and replace the placeholder values:

```javascript
const CONFIG = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key-here',
  WALLETCONNECT_PROJECT_ID: 'your-walletconnect-project-id',
  BASE_SEPOLIA_RPC: 'https://sepolia.base.org',
  BASE_SEPOLIA_CHAIN_ID: 84532,
  USDC_CONTRACT_ADDRESS: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
};
```

**Note**: The USDC contract address is for Base Sepolia testnet. You can deploy your own ERC20 test token or use an existing one.

### 5. Get Test Tokens

**Get Base Sepolia ETH:**
- Visit [Coinbase Base Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- Connect your wallet and claim test ETH

**Get Test USDC:**
- Deploy a test ERC20 token, or
- Use a testnet USDC faucet if available, or
- Mint tokens from an existing test USDC contract

### 6. Add Base Sepolia Network to Wallet

If not already added, configure Base Sepolia in your wallet:

- **Network Name**: Base Sepolia
- **RPC URL**: https://sepolia.base.org
- **Chain ID**: 84532
- **Currency Symbol**: ETH
- **Block Explorer**: https://sepolia.basescan.org

## 🚀 Running Locally

### Option 1: Python HTTP Server

```bash
# From project root
python -m http.server 8000
```

Then visit: `http://localhost:8000/pages/index.html`

### Option 2: Live Server (VS Code)

1. Install "Live Server" extension in VS Code
2. Right-click on `pages/index.html`
3. Select "Open with Live Server"

### Option 3: Node.js HTTP Server

```bash
npx http-server -p 8000
```

## 📦 Deploy to Vercel

### Method 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
```

### Method 2: GitHub + Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will auto-detect the configuration
5. Deploy!

### Environment Variables for Production

When deploying to Vercel, you can keep your config in `js/config.js` or use environment variables:

1. Go to your Vercel project settings
2. Add environment variables (optional - or just update config.js)
3. Redeploy

## 📁 Project Structure

```
BaseTask/
├── pages/
│   ├── index.html           # Landing page
│   ├── dashboard.html       # User dashboard
│   ├── create-task.html     # Task creation form
│   ├── tasks.html           # Browse all tasks
│   └── submissions.html     # Review submissions
├── css/
│   └── style.css           # Electric blue theme with glassmorphism
├── js/
│   ├── config.js           # Configuration & Supabase init
│   ├── wallet.js           # WalletConnect integration
│   └── contract.js         # Blockchain transactions (USDC)
├── .env.example            # Environment template
├── .gitignore
├── vercel.json            # Vercel deployment config
├── package.json
└── README.md
```

## 🎨 Design Features

- **Electric Blue Theme** (#0066ff) inspired by Base
- **Glassmorphism** effects on cards and inputs
- **Glowing Animations** on hover for buttons
- **Pulse Effects** for primary actions
- **Inter Font** for modern, clean typography
- **Fully Responsive** design

## 🔐 Security Notes

⚠️ **This is a testnet application for demonstration purposes.**

- Never store private keys in code
- The anon key in config.js is safe for client-side (public)
- Always verify transactions before signing
- Use Row Level Security (RLS) in Supabase for production

## 🐛 Troubleshooting

### Wallet Won't Connect
- Ensure Base Sepolia is added to your wallet
- Check that you're using a compatible wallet
- Try clearing browser cache

### Transactions Failing
- Check you have sufficient ETH for gas
- Verify USDC balance is sufficient
- Ensure you're on Base Sepolia network

### Database Errors
- Verify Supabase tables are created correctly
- Check API keys in config.js
- Enable RLS policies if needed

### Page Not Loading
- Ensure you're accessing via HTTP server (not file://)
- Check browser console for errors
- Verify all CDN scripts are loading

## 📚 Usage Guide

### For Task Creators:

1. Connect wallet
2. Click "Create Task"
3. Fill in task details and reward amount
4. Submit (ensure you have USDC to pay)
5. Wait for submissions
6. Review and approve/reject from Dashboard → View Submissions
7. Upon approval, USDC is sent automatically

### For Workers:

1. Connect wallet
2. Browse available tasks
3. Click "Submit Work" on a task
4. Provide proof of completion
5. Wait for creator approval
6. Get paid in USDC automatically!

## 🌐 Live Demo

After deployment, your app will be live at:
```
https://your-project.vercel.app
```

## 📝 Base Sepolia Resources

- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **Block Explorer**: https://sepolia.basescan.org
- **RPC URL**: https://sepolia.base.org
- **Chain ID**: 84532

## 🤝 Contributing

This is a demo project. Feel free to fork and customize!

## 📄 License

MIT License - feel free to use this project as you wish.

## ⚡ Built on Base

This dApp is built for Base Sepolia testnet - fast, cheap, and developer-friendly L2 by Coinbase.

---

**Made with ⚡ for the Base ecosystem**
