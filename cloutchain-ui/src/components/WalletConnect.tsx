import { useState, useEffect } from 'react';
import { Wallet, Check, AlertCircle } from 'lucide-react';
import { walletService, type WalletState } from '@/lib/wallet';
import { toast } from 'sonner';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export const WalletConnect = ({ onConnect, onDisconnect }: WalletConnectProps) => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
    balance: null
  });
  const [isConnecting, setIsConnecting] = useState(false);

  // Check wallet state on component mount
  useEffect(() => {
    checkWalletState();
  }, []);

  const checkWalletState = async () => {
    try {
      const state = await walletService.getWalletState();
      setWalletState(state);
      if (state.isConnected && state.address) {
        onConnect?.(state.address);
      }
    } catch (error) {
      console.error('Error checking wallet state:', error);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      const state = await walletService.connectWallet();
      setWalletState(state);
      if (state.address) {
        onConnect?.(state.address);
      }
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    const state = walletService.disconnectWallet();
    setWalletState(state);
    onDisconnect?.();
  };

  // Show wrong network warning
  if (walletState.isConnected && walletState.chainId !== 11155111) {
    return (
      <button 
        onClick={handleConnect}
        className="wallet-button wallet-button-warning animate-fade-in"
      >
        <AlertCircle size={18} />
        Wrong Network (Switch to Sepolia)
      </button>
    );
  }

  // Show connected state
  if (walletState.isConnected && walletState.address) {
    return (
      <div className="flex items-center gap-2">
        <button className="wallet-button wallet-button-connected animate-fade-in">
          <Check size={18} />
          {walletState.address.slice(0, 6)}...{walletState.address.slice(-4)}
          {walletState.balance && (
            <span className="ml-2 text-xs opacity-75">
              {parseFloat(walletState.balance).toFixed(4)} ETH
            </span>
          )}
        </button>
        <button 
          onClick={handleDisconnect}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Show connect button
  return (
    <button 
      onClick={handleConnect}
      disabled={isConnecting}
      className="wallet-button"
    >
      <Wallet size={18} />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};