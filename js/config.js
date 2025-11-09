// Configuration for Supabase and environment variables
const CONFIG = {
  // These will be replaced with actual values from .env in production
  SUPABASE_URL: 'YOUR_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
  WALLETCONNECT_PROJECT_ID: 'YOUR_WALLETCONNECT_PROJECT_ID',
  BASE_SEPOLIA_RPC: 'https://sepolia.base.org',
  BASE_SEPOLIA_CHAIN_ID: 84532,
  USDC_CONTRACT_ADDRESS: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  
  // Platform fee configuration
  PLATFORM_FEE_PERCENTAGE: 5, // 5% platform fee
  PLATFORM_WALLET_ADDRESS: 'YOUR_WALLET_ADDRESS_HERE' // Replace with your wallet address
};

// Initialize Supabase client
let supabase = null;

function initSupabase() {
  if (typeof supabase === 'undefined' || !window.supabase) {
    console.error('Supabase library not loaded');
    return null;
  }
  
  supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  return supabase;
}

// Get Supabase instance
function getSupabase() {
  if (!supabase) {
    return initSupabase();
  }
  return supabase;
}

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, initSupabase, getSupabase };
}