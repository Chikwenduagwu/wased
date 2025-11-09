// USDC ERC20 ABI (minimal for transfer)
const USDC_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

// Get USDC contract instance
function getUSDCContract() {
  if (!signer) {
    throw new Error('Wallet not connected');
  }
  return new ethers.Contract(CONFIG.USDC_CONTRACT_ADDRESS, USDC_ABI, signer);
}

// Get USDC balance
async function getUSDCBalance(address) {
  try {
    const contract = new ethers.Contract(
      CONFIG.USDC_CONTRACT_ADDRESS,
      USDC_ABI,
      provider
    );
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    return ethers.utils.formatUnits(balance, decimals);
  } catch (error) {
    console.error('Error getting USDC balance:', error);
    return '0';
  }
}

// Calculate platform fee and worker payment
function calculatePaymentSplit(totalReward) {
  const platformFee = (totalReward * CONFIG.PLATFORM_FEE_PERCENTAGE) / 100;
  const workerPayment = totalReward - platformFee;
  
  return {
    platformFee: platformFee,
    workerPayment: workerPayment,
    totalReward: totalReward
  };
}

// Send USDC payment
async function sendUSDCPayment(recipientAddress, amount) {
  try {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    const contract = getUSDCContract();
    const decimals = await contract.decimals();
    
    // Convert amount to proper decimals
    const amountInWei = ethers.utils.parseUnits(amount.toString(), decimals);

    // Check balance
    const balance = await contract.balanceOf(userAddress);
    if (balance.lt(amountInWei)) {
      throw new Error('Insufficient USDC balance');
    }

    // Send transaction
    const tx = await contract.transfer(recipientAddress, amountInWei);
    
    console.log('Transaction submitted:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    console.log('Transaction confirmed:', receipt.transactionHash);
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('Error sending USDC payment:', error);
    throw error;
  }
}

// Approve task submission and send payment with platform fee
async function approveAndPay(submissionId, taskId, workerAddress, rewardAmount) {
  try {
    const supabase = getSupabase();

    // Calculate payment split
    const paymentSplit = calculatePaymentSplit(rewardAmount);
    
    console.log('Payment breakdown:', {
      total: paymentSplit.totalReward,
      platformFee: paymentSplit.platformFee,
      workerPayment: paymentSplit.workerPayment
    });

    showAlert(`Processing payment: ${paymentSplit.workerPayment.toFixed(2)} USDC to worker + ${paymentSplit.platformFee.toFixed(2)} USDC platform fee...`, 'info');

    // Send platform fee first
    const platformTxResult = await sendUSDCPayment(
      CONFIG.PLATFORM_WALLET_ADDRESS, 
      paymentSplit.platformFee
    );

    if (!platformTxResult.success) {
      throw new Error('Platform fee payment failed');
    }

    console.log('Platform fee sent:', platformTxResult.transactionHash);

    // Send worker payment
    const workerTxResult = await sendUSDCPayment(
      workerAddress, 
      paymentSplit.workerPayment
    );

    if (!workerTxResult.success) {
      throw new Error('Worker payment failed');
    }

    console.log('Worker payment sent:', workerTxResult.transactionHash);

    // Update submission status with both transaction hashes
    const { error: submissionError } = await supabase
      .from('submissions')
      .update({ 
        status: 'approved',
        transaction_hash: workerTxResult.transactionHash,
        platform_fee_tx: platformTxResult.transactionHash,
        platform_fee: paymentSplit.platformFee,
        worker_payment: paymentSplit.workerPayment,
        approved_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    if (submissionError) throw submissionError;

    // Update task status to completed
    const { error: taskError } = await supabase
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', taskId);

    if (taskError) throw taskError;

    showAlert(`Payment sent successfully! Worker received ${paymentSplit.workerPayment.toFixed(2)} USDC (${CONFIG.PLATFORM_FEE_PERCENTAGE}% platform fee applied)`, 'success');
    
    return {
      workerTx: workerTxResult,
      platformTx: platformTxResult,
      paymentSplit: paymentSplit
    };
  } catch (error) {
    console.error('Error approving and paying:', error);
    showAlert(`Error: ${error.message}`, 'error');
    throw error;
  }
}

// Reject submission
async function rejectSubmission(submissionId) {
  try {
    const supabase = getSupabase();

    const { error } = await supabase
      .from('submissions')
      .update({ 
        status: 'rejected',
        rejected_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    if (error) throw error;

    showAlert('Submission rejected', 'info');
  } catch (error) {
    console.error('Error rejecting submission:', error);
    showAlert('Error rejecting submission', 'error');
    throw error;
  }
}

// Get transaction details
async function getTransactionDetails(txHash) {
  try {
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);
    
    return {
      transaction: tx,
      receipt: receipt,
      confirmed: receipt !== null,
      confirmations: receipt ? receipt.confirmations : 0
    };
  } catch (error) {
    console.error('Error getting transaction details:', error);
    return null;
  }
}

// Format USDC amount for display
function formatUSDC(amount) {
  return `${parseFloat(amount).toFixed(2)} USDC`;
}

// Estimate gas for transaction
async function estimateGas(to, amount) {
  try {
    const contract = getUSDCContract();
    const decimals = await contract.decimals();
    const amountInWei = ethers.utils.parseUnits(amount.toString(), decimals);
    
    const gasEstimate = await contract.estimateGas.transfer(to, amountInWei);
    const gasPrice = await provider.getGasPrice();
    
    const totalGas = gasEstimate.mul(gasPrice);
    
    return {
      gasLimit: gasEstimate.toString(),
      gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
      totalCost: ethers.utils.formatEther(totalGas)
    };
  } catch (error) {
    console.error('Error estimating gas:', error);
    return null;
  }
}