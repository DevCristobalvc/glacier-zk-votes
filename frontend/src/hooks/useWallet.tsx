import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { toast } from 'sonner';

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  signer: JsonRpcSigner | null;
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnecting: false,
    isConnected: false,
    signer: null,
  });

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('Please install MetaMask to use this application');
      return;
    }

    try {
      setWalletState(prev => ({ ...prev, isConnecting: true }));

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      const address = accounts[0];
      const chainId = Number(network.chainId);

      // Check if on Avalanche Fuji testnet (43113)
      if (chainId !== 43113) {
        toast.warning('Please switch to Avalanche Fuji Testnet', {
          description: 'Click to switch network',
          action: {
            label: 'Switch',
            onClick: () => switchToFuji(),
          },
        });
      }

      setWalletState({
        address,
        chainId,
        isConnecting: false,
        isConnected: true,
        signer,
      });

      toast.success('Wallet connected!');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet', {
        description: error.message || 'Unknown error',
      });
      setWalletState(prev => ({ ...prev, isConnecting: false }));
    }
  }, []);

  const switchToFuji = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xA869' }], // 43113 in hex
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xA869',
                chainName: 'Avalanche Fuji Testnet',
                nativeCurrency: {
                  name: 'AVAX',
                  symbol: 'AVAX',
                  decimals: 18,
                },
                rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                blockExplorerUrls: ['https://testnet.snowtrace.io/'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding Fuji network:', addError);
          toast.error('Failed to add Avalanche Fuji network');
        }
      }
    }
  };

  const disconnectWallet = useCallback(() => {
    setWalletState({
      address: null,
      chainId: null,
      isConnecting: false,
      isConnected: false,
      signer: null,
    });
    toast.info('Wallet disconnected');
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setWalletState(prev => ({
          ...prev,
          address: accounts[0],
        }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      setWalletState(prev => ({
        ...prev,
        chainId: parseInt(chainId, 16),
      }));
      
      // Reload page on chain change (recommended by MetaMask)
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnectWallet]);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum === 'undefined') return;

      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_accounts', []);
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
          setWalletState({
            address: accounts[0],
            chainId: Number(network.chainId),
            isConnecting: false,
            isConnected: true,
            signer,
          });
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkConnection();
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    switchToFuji,
  };
}

// Extend window type for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
