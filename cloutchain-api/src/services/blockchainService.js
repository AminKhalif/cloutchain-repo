// Blockchain Service - Connects CloutChain API to Smart Contract
import { ethers } from 'ethers'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
if (!process.env.RAILWAY_ENVIRONMENT) {
  dotenv.config({ path: join(__dirname, '../../../.env') })
}

// Smart Contract Configuration
const CONTRACT_ADDRESS = '0x6D96FaafEE3a8f5EBb83855919E1C0fdB90036e1'
const CONTRACT_ABI = [
    "function createCampaign(string memory _name, uint256 _payoutPerCreator, uint256 _viewsThreshold, uint256 _likesThreshold, bool _useLikesForDemo) external payable returns (uint256)",
    "function payCreator(uint256 _campaignId, address _creator) external",
    "function getCampaign(uint256 _campaignId) external view returns (uint256, address, string, uint256, uint256, uint256, uint256, uint256, bool, bool)",
    "function getContractInfo() external view returns (address, uint256)",
    "function wasCreatorPaid(uint256 _campaignId, address _creator) external view returns (bool)",
    "event CampaignCreated(uint256 indexed campaignId, address indexed brand, string name, uint256 payout, uint256 viewsNeeded, uint256 likesNeeded, bool demoMode)",
    "event CreatorPaid(uint256 indexed campaignId, address indexed creator, uint256 amount)"
]

export class BlockchainService {
    constructor() {
        const rpcUrl = process.env.SEPOLIA_RPC_URL
        const privateKey = process.env.SEPOLIA_PRIVATE_KEY

        if (!rpcUrl || !privateKey) {
            throw new Error('Missing SEPOLIA_RPC_URL or SEPOLIA_PRIVATE_KEY environment variables')
        }

        // Initialize provider and wallet
        this.provider = new ethers.JsonRpcProvider(rpcUrl)
        this.wallet = new ethers.Wallet(privateKey, this.provider)
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet)
        
        console.log('🔗 Blockchain service initialized')
        console.log('📍 Contract address:', CONTRACT_ADDRESS)
        console.log('👤 Wallet address:', this.wallet.address)
    }

    /**
     * Test blockchain connection
     */
    async testConnection() {
        try {
            const [owner, totalCampaigns] = await this.contract.getContractInfo()
            const balance = await this.provider.getBalance(this.wallet.address)
            
            return {
                success: true,
                contractOwner: owner,
                totalCampaigns: totalCampaigns.toString(),
                walletBalance: ethers.formatEther(balance),
                contractAddress: CONTRACT_ADDRESS
            }
        } catch (error) {
            console.error('❌ Blockchain connection failed:', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    /**
     * Create a new campaign on blockchain
     */
    async createCampaign(campaignData) {
        try {
            console.log('🚀 Creating blockchain campaign:', campaignData.name)

            // Convert ETH amounts to Wei
            const payoutPerCreatorWei = ethers.parseEther(campaignData.payoutPerCreator.toString())
            const totalFundingWei = ethers.parseEther(campaignData.totalFunding.toString())

            // Create campaign transaction
            const tx = await this.contract.createCampaign(
                campaignData.name,
                payoutPerCreatorWei,
                campaignData.viewsThreshold || 0,
                campaignData.likesThreshold || 0,
                campaignData.useLikesForDemo || false,
                { value: totalFundingWei }
            )

            console.log('📋 Campaign creation tx:', tx.hash)
            const receipt = await tx.wait()
            console.log('✅ Campaign created on blockchain!')

            // Extract campaign ID from events
            let campaignId = null
            for (const log of receipt.logs) {
                try {
                    const parsed = this.contract.interface.parseLog(log)
                    if (parsed.name === 'CampaignCreated') {
                        campaignId = parsed.args.campaignId.toString()
                        break
                    }
                } catch (e) {
                    // Ignore parsing errors
                }
            }

            return {
                success: true,
                campaignId: campaignId,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString()
            }

        } catch (error) {
            console.error('❌ Campaign creation failed:', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    /**
     * Pay creator when metrics conditions are met
     */
    async payCreator(campaignId, creatorAddress) {
        try {
            console.log(`💳 Paying creator ${creatorAddress} for campaign ${campaignId}`)

            // Check if already paid
            const alreadyPaid = await this.contract.wasCreatorPaid(campaignId, creatorAddress)
            if (alreadyPaid) {
                return {
                    success: false,
                    error: 'Creator already paid for this campaign'
                }
            }

            // Execute payment
            const tx = await this.contract.payCreator(campaignId, creatorAddress)
            const receipt = await tx.wait()
            console.log('✅ Creator paid successfully!')

            return {
                success: true,
                transactionHash: tx.hash
            }

        } catch (error) {
            console.error('❌ Payment failed:', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    /**
     * Get campaign details from blockchain
     */
    async getCampaign(campaignId) {
        try {
            const campaign = await this.contract.getCampaign(campaignId)
            
            return {
                success: true,
                campaign: {
                    id: campaign[0].toString(),
                    brand: campaign[1],
                    name: campaign[2],
                    payoutPerCreator: ethers.formatEther(campaign[3]),
                    totalEscrowed: ethers.formatEther(campaign[4]),
                    remainingBudget: ethers.formatEther(campaign[5]),
                    viewsThreshold: campaign[6].toString(),
                    likesThreshold: campaign[7].toString(),
                    useLikesForDemo: campaign[8],
                    active: campaign[9]
                }
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }
}