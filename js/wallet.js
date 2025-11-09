// WalletConnect integration for BaseTask
let web3Modal = null;
let provider = null;
let signer = null;
let userAddress = null;

// Initialize WalletConnect
async function initWalletConnect() {
  try {
    const providerOptions = {
      walletconnect: {
        package: window.WalletConnectProvider.default,
        options: {
          projectId: CONFIG.WALLETCONNECT_PROJECT_ID,
          chains: [CONFIG.BASE_SEPOLIA_CHAIN_ID],
          showQrModal: true,
          rpcMap: {
            [CONFIG.BASE_SEPOLIA_CHAIN_ID]: CONFIG.BASE_SEPOLIA_RPC
          },
          metadata: {
            name: 'BaseTask',
            description: 'Decentralized Task-to-Earn Platform',
            url: window.location.origin,
            icons: ['https://avatars.githubusercontent.com/u/37784886']
          }
        }
      }
    };

    web3Modal = new window.Web3Modal.default({
      network: 'base-sepolia',
      cacheProvider: true,
      providerOptions
    });

    // Auto-connect if previously connected
    if (web3Modal.cachedProvider) {
      await connectWallet();
    }
  } catch (error) {
    console.error('Error initializing WalletConnect:', error);
  }
}

// Connect wallet
async function connectWallet() {
  try {
    const instance = await web3Modal.connect();
    provider = new ethers.providers.Web3Provider(instance);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    // Check if on correct network
    const network = await provider.getNetwork();
    if (network.chainId !== CONFIG.BASE_SEPOLIA_CHAIN_ID) {
      await switchToBaseSepolia();
    }

    // Save user to database
    await saveUser(userAddress);

    // Update UI
    updateWalletUI();

    // Setup event listeners
    setupProviderListeners(instance);

    return userAddress;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    showAlert('Failed to connect wallet', 'error');
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
    if (web3Modal) {
      await web3Modal.clearCachedProvider();
    }
    provider = null;
    signer = null;
    userAddress = null;
    updateWalletUI();
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
  }
}

// Setup provider event listeners
function setupProviderListeners(provider) {
  provider.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      window.location.reload();
    }
  });

  provider.on('chainChanged', () => {
    window.location.reload();
  });

  provider.on('disconnect', () => {
    disconnectWallet();
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
  initWalletConnect();
});
