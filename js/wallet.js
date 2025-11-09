// Wallet integration using browser injection (MetaMask, Coinbase Wallet, etc.)
let provider = null;
let signer = null;
let userAddress = null;

// Initialize wallet connection
async function initWallet() {
  // Check if wallet is available
  if (typeof window.ethereum !== 'undefined') {
    console.log('Wallet detected!');
  } else {
    console.log('No wallet detected');
  }
}

// Connect wallet via browser injection
async function connectWallet() {
  try {
    // Check if MetaMask/wallet is installed
    if (typeof window.ethereum === 'undefined') {
      showAlert('Please install MetaMask or another Web3 wallet', 'error');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    // Create ethers provider
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    userAddress = accounts[0];

    // Check network
    const network = await provider.getNetwork();
    if (network.chainId !== CONFIG.BASE_SEPOLIA_CHAIN_ID) {
      await switchToBaseSepolia();
    }

    // Save user to database
    await saveUser(userAddress);

    // Update UI
    updateWalletUI();

    // Setup event listeners
    setupProviderListeners();

    console.log('Wallet connected:', userAddress);
    return userAddress;

  } catch (error) {
    console.error('Error connecting wallet:', error);
    if (error.code === 4001) {
      showAlert('Wallet connection rejected', 'error');
    } else {
      showAlert('Failed to connect wallet', 'error');
    }
    throw error;
  }
}

// Switch to Base Sepolia network
async function switchToBaseSepolia() {
  try {
    await provider.send('wallet_switchEthereumChain', [
      { chainId: `0x${CONFIG.BASE_SEPOLIA_CHAIN_ID.toString(16)}` }
    ]);
  } catch (switchError) {
    // Network doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await provider.send('wallet_addEthereumChain', [
          {
            chainId: `0x${CONFIG.BASE_SEPOLIA_CHAIN_ID.toString(16)}`,
            chainName: 'Base Sepolia',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: [CONFIG.BASE_SEPOLIA_RPC],
            blockExplorerUrls: ['https://sepolia.basescan.org']
          }
        ]);
      } catch (addError) {
        console.error('Error adding network:', addError);
        throw addError;
      }
    } else {
      throw switchError;
    }
  }
}

// Disconnect wallet
async function disconnectWallet() {
  try {
    provider = null;
    signer = null;
    userAddress = null;
    updateWalletUI();
    console.log('Wallet disconnected');
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
  }
}

// Setup provider event listeners
function setupProviderListeners() {
  if (typeof window.ethereum === 'undefined') return;

  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      window.location.reload();
    }
  });

  window.ethereum.on('chainChanged', () => {
    window.location.reload();
  });
}

// Update wallet UI
function updateWalletUI() {
  const connectBtn = document.getElementById('connectWalletBtn');
  const walletInfo = document.getElementById('walletInfo');
  const walletAddress = document.getElementById('walletAddress');

  if (userAddress) {
    if (connectBtn) connectBtn.style.display = 'none';
    if (walletInfo) walletInfo.style.display = 'flex';
    if (walletAddress) walletAddress.textContent = formatAddress(userAddress);
  } else {
    if (connectBtn) connectBtn.style.display = 'block';
    if (walletInfo) walletInfo.style.display = 'none';
  }
}

// Format wallet address
function formatAddress(address) {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Save user to Supabase
async function saveUser(walletAddress) {
  try {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('users')
      .upsert([
        { 
          wallet_address: walletAddress.toLowerCase(),
          joined_at: new Date().toISOString()
        }
      ], { 
        onConflict: 'wallet_address',
        ignoreDuplicates: true 
      });

    if (error) throw error;
    
    console.log('User saved to database');
  } catch (error) {
    console.error('Error saving user:', error);
  }
}

// Check if wallet is connected
function isWalletConnected() {
  return userAddress !== null;
}

// Get current user address
function getCurrentUserAddress() {
  return userAddress;
}

// Get provider and signer
function getProvider() {
  return provider;
}

function getSigner() {
  return signer;
}

// Utility function to show alerts
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  
  const container = document.querySelector('.container') || document.body;
  container.insertBefore(alertDiv, container.firstChild);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  initWallet();
  
  // Auto-connect if previously connected
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.request({ method: 'eth_accounts' })
      .then(accounts => {
        if (accounts.length > 0) {
          connectWallet();
        }
      });
  }
});
