// Configuration for Supabase and environment variables
const CONFIG = {
  // These will be replaced with actual values from .env in production
  SUPABASE_URL: 'https://qdepsrfmaxxoudulbzuf.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZXBzcmZtYXh4b3VkdWxienVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2ODQyNTgsImV4cCI6MjA3ODI2MDI1OH0.5dAFXJ_qQVyviqrJzHzTlXWSmlZ5PG1y9NUfj3hS6SQ',
  WALLETCONNECT_PROJECT_ID: 'YOUR_WALLETCONNECT_PROJECT_ID',
  BASE_SEPOLIA_RPC: 'https://sepolia.base.org',
  BASE_SEPOLIA_CHAIN_ID: 84532,
  USDC_CONTRACT_ADDRESS: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  
  // Platform fee configuration
  PLATFORM_FEE_PERCENTAGE: 5, // 5% platform fee
  PLATFORM_WALLET_ADDRESS: '0xf2f23B0930A4F4D5B35Ae3E0AbC16FF92072A1fE' // Replace with your wallet address
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
