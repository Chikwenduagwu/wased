# ⚡ Quick Start Guide - BaseTask

Get your BaseTask dApp running in 5 minutes!

## 🎯 5-Minute Setup

### Step 1: Get Your Keys (2 minutes)

**Supabase:**
1. Go to [supabase.com](https://supabase.com) → New Project
2. Settings → API → Copy `URL` and `anon public` key

**WalletConnect:**
1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. New Project → Copy `Project ID`

### Step 2: Configure (1 minute)

Open `js/config.js` and update:

```javascript
const CONFIG = {
  SUPABASE_URL: 'YOUR_SUPABASE_URL_HERE',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_KEY_HERE',
  WALLETCONNECT_PROJECT_ID: 'YOUR_WALLETCONNECT_ID_HERE',
  // ... rest stays the same
};
```

### Step 3: Setup Database (1 minute)

1. Supabase → SQL Editor
2. Copy/paste everything from `supabase-setup.sql`
3. Click Run

### Step 4: Run Locally (30 seconds)

```bash
python -m http.server 8000
```

Open: `http://localhost:8000/pages/index.html`

### Step 5: Test (30 seconds)

1. Click "Connect Wallet"
2. Switch to Base Sepolia
3. Done! 🎉

## 🪙 Get Test Tokens

**ETH for Gas:**
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

**Test USDC:**
- Use the provided test contract: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- Or deploy your own ERC20 token

## 🚀 Deploy (Optional)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Done!
```

## ✅ Checklist

- [ ] Supabase project created
- [ ] Database tables created (ran SQL file)
- [ ] Config.js updated with your keys
- [ ] Wallet has Base Sepolia ETH
- [ ] Wallet has test USDC
- [ ] App running locally
- [ ] Wallet connected successfully

## 🆘 Troubleshooting

**Can't connect wallet?**
→ Add Base Sepolia network to your wallet (Chain ID: 84532)

**Database errors?**
→ Run `supabase-setup.sql` in Supabase SQL Editor

**No test tokens?**
→ Visit Base Sepolia faucet for free test ETH

## 📖 Next Steps

1. Create your first task
2. Test with a second wallet
3. Submit and approve
4. Deploy to Vercel
5. Share with friends!

## 🎨 Customization Ideas

- Change colors in `css/style.css` (search for `--primary-blue`)
- Add your logo to navigation
- Customize task categories
- Add file upload for proof
- Integrate IPFS for decentralized storage

---

**Questions?** Check the full README.md for detailed documentation!
