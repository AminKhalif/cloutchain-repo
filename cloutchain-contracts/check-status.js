import { ethers } from 'ethers'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

const CONTRACT_ADDRESS = '0x6D96FaafEE3a8f5EBb83855919E1C0fdB90036e1'
const CONTRACT_ABI = [
    "function getContractInfo() external view returns (address, uint256)",
    "function getCampaign(uint256 _campaignId) external view returns (uint256, address, string, uint256, uint256, uint256, uint256, uint256, bool, bool)"
]

async function checkStatus() {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL)
        const wallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet)
        
        console.log('💰 Current balance:', ethers.formatEther(await provider.getBalance(wallet.address)), 'ETH')
        
        const [owner, totalCampaigns] = await contract.getContractInfo()
        console.log('📊 Total campaigns:', totalCampaigns.toString())
        
        if (totalCampaigns > 0) {
            console.log('\n📋 Campaign 1 details:')
            const campaign = await contract.getCampaign(1)
            console.log('   Name:', campaign[2])
            console.log('   Total escrowed:', ethers.formatEther(campaign[4]), 'ETH')
            console.log('   Remaining budget:', ethers.formatEther(campaign[5]), 'ETH')
            console.log('   Active:', campaign[9])
        }
        
        // Check transaction
        const txHash = '0x33845debfe2018063dd58585419b3efe6ef89719e6597ad7520d67d05e6acc69'
        const receipt = await provider.getTransactionReceipt(txHash)
        console.log('\n📋 Transaction status:', receipt ? 'Confirmed ✅' : 'Pending ⏳')
        
    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

checkStatus()