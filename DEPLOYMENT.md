# 🚀 BaseTask Deployment Guide

Quick reference for deploying your BaseTask dApp.

## ✅ Pre-Deployment Checklist

- [ ] Supabase project created
- [ ] Database tables set up (run `supabase-setup.sql`)
- [ ] WalletConnect Project ID obtained
- [ ] Configuration updated in `js/config.js`
- [ ] Test locally first
- [ ] Base Sepolia testnet configured

## 📝 Configuration Steps

### 1. Update js/config.js

```javascript
const CONFIG = {
  SUPABASE_URL: 'https://xxxxx.supabase.co',  // Your Supabase URL
  SUPABASE_ANON_KEY: 'eyJxxx...',              // Your Supabase anon key
  WALLETCONNECT_PROJECT_ID: 'abc123...',       // Your WalletConnect ID
  BASE_SEPOLIA_RPC: 'https://sepolia.base.org',
  BASE_SEPOLIA_CHAIN_ID: 84532,
  USDC_CONTRACT_ADDRESS: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
};
```

### 2. Supabase Setup

1. Go to https://supabase.com
2. Create new project
3. Wait for database to provision
4. Go to SQL Editor
5. Paste contents of `supabase-setup.sql`
6. Run the SQL
7. Get your keys from Settings → API

### 3. WalletConnect Setup

1. Go to https://cloud.walletconnect.com
2. Sign up / Log in
3. Create new project
4. Name it "BaseTask"
5. Copy the Project ID

## 🌐 Deploy to Vercel

### Option A: Via GitHub

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit - BaseTask dApp"
git branch -M main
git remote add origin https://github.com/yourusername/basetask.git
git push -u origin main
```

2. **Import to Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"
   - Done! 🎉

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name? basetask
# - In which directory is your code located? ./
# - Deploy? Y
```

### Production Deployment

```bash
vercel --prod
```

## 🔧 Alternative Hosting Options

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Production
netlify deploy --prod
```

### GitHub Pages

```bash
# Enable GitHub Pages in repository settings
# Set source to main branch
# Your site will be at: https://yourusername.github.io/basetask/
```

### Traditional Web Hosting

Upload these files via FTP:
- `/pages/`
- `/css/`
- `/js/`
- `vercel.json` (optional)

Set `index.html` redirect to `/pages/index.html`

## 🧪 Testing After Deployment

1. Visit your deployed URL
2. Check browser console for errors
3. Test wallet connection
4. Create a test task
5. Submit to your own task from another wallet
6. Approve and verify payment

## 🐛 Common Issues

### Issue: "Supabase client not initialized"
**Fix:** Check `CONFIG.SUPABASE_URL` and `CONFIG.SUPABASE_ANON_KEY` are correct

### Issue: "WalletConnect connection failed"
**Fix:** Verify `CONFIG.WALLETCONNECT_PROJECT_ID` is valid

### Issue: "Wrong network"
**Fix:** Ensure wallet is on Base Sepolia (Chain ID 84532)

### Issue: "Transaction failed"
**Fix:** 
- Check you have ETH for gas
- Check USDC balance
- Verify contract address is correct

### Issue: "CORS errors"
**Fix:** Make sure you're accessing via HTTPS (Vercel does this automatically)

## 🔐 Security for Production

If deploying to mainnet (NOT recommended without audit):

1. **Enable RLS in Supabase:**
   - Uncomment RLS policies in `supabase-setup.sql`
   - Customize policies for your needs

2. **Use Environment Variables:**
   - Never commit real API keys
   - Use Vercel environment variables
   - Or use build-time replacement

3. **Rate Limiting:**
   - Add rate limits to prevent abuse
   - Use Supabase's built-in rate limiting

4. **Smart Contract Audit:**
   - Audit any custom contracts
   - Use established token contracts

## 📊 Monitoring

### Vercel Analytics
- Enable in Vercel dashboard
- Monitor page views and performance

### Supabase Monitoring
- Check Database → Usage
- Monitor API requests
- Set up alerts

## 🎯 Post-Deployment

- [ ] Test all features
- [ ] Share with test users
- [ ] Monitor error logs
- [ ] Set up analytics
- [ ] Create documentation for users

## 🆘 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Base Docs:** https://docs.base.org
- **WalletConnect Docs:** https://docs.walletconnect.com

---

**Your dApp should now be live! 🎉**

Access it at: `https://your-project.vercel.app`
