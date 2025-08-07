// Wallet integration for Sepolia testnet - July 2025 standards
import { BrowserProvider, Contract, parseEther, formatEther } from 'ethers'
import { toast } from 'sonner'

declare global {
  interface Window {
    ethereum?: any
  }
}

export interface WalletState {
  address: string | null
  isConnected: boolean
  chainId: number | null
  balance: string | null
}

// Sepolia testnet configuration
export const SEPOLIA_CHAIN_ID = 11155111
export const SEPOLIA_RPC_URL = 'https://ethereum-sepolia.publicnode.com'

export class WalletService {
  private provider: BrowserProvider | null = null
  private signer: any = null

  async connectWallet(): Promise<WalletState> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not detected. Please install MetaMask.')
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.')
      }

      // Create provider and signer
      this.provider = new BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()

      const address = accounts[0]
      const network = await this.provider.getNetwork()
      const balance = await this.provider.getBalance(address)

      // Switch to Sepolia if not already
      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        await this.switchToSepolia()
      }

      const walletState: WalletState = {
        address,
        isConnected: true,
        chainId: Number(network.chainId),
        balance: formatEther(balance)
      }

      toast.success(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`)
      return walletState

    } catch (error: any) {
      console.error('Wallet connection error:', error)
      toast.error(`Failed to connect wallet: ${error.message}`)
      throw error
    }
  }

  async switchToSepolia(): Promise<void> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }]
      })
    } catch (switchError: any) {
      // Chain not added, try to add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
              name: 'SepoliaETH',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: [SEPOLIA_RPC_URL],
            blockExplorerUrls: ['https://sepolia.etherscan.io/']
          }]
        })
      } else {
        throw switchError
      }
    }
  }

  async getWalletState(): Promise<WalletState> {
    try {
      if (!window.ethereum || !this.provider) {
        return {
          address: null,
          isConnected: false,
          chainId: null,
          balance: null
        }
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (!accounts || accounts.length === 0) {
        return {
          address: null,
          isConnected: false,
          chainId: null,
          balance: null
        }
      }

      const address = accounts[0]
      const network = await this.provider.getNetwork()
      const balance = await this.provider.getBalance(address)

      return {
        address,
        isConnected: true,
        chainId: Number(network.chainId),
        balance: formatEther(balance)
      }

    } catch (error) {
      console.error('Error getting wallet state:', error)
      return {
        address: null,
        isConnected: false,
        chainId: null,
        balance: null
      }
    }
  }

  async sendTransaction(to: string, value: string): Promise<string> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected')
      }

      const tx = await this.signer.sendTransaction({
        to,
        value: parseEther(value)
      })

      toast.success(`Transaction sent: ${tx.hash}`)
      return tx.hash

    } catch (error: any) {
      console.error('Transaction error:', error)
      toast.error(`Transaction failed: ${error.message}`)
      throw error
    }
  }

  disconnectWallet(): WalletState {
    this.provider = null
    this.signer = null
    toast.success('Wallet disconnected')
    
    return {
      address: null,
      isConnected: false,
      chainId: null,
      balance: null
    }
  }
}

// Create singleton instance
export const walletService = new WalletService()