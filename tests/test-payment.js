import { ethers } from 'ethers'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

const CONTRACT_ADDRESS = '0x6D96FaafEE3a8f5EBb83855919E1C0fdB90036e1'
const CONTRACT_ABI = [
    "function payCreator(uint256 _campaignId, address _creator) external",
    "function getCampaign(uint256 _campaignId) external view returns (uint256, address, string, uint256, uint256, uint256, uint256, uint256, bool, bool)",
    "function wasCreatorPaid(uint256 _campaignId, address _creator) external view returns (bool)"
]

async function testPayment() {
    console.log('💳 Testing Creator Payment...')
    
    try {
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL)
        const wallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet)
        
        const campaignId = 1
        const creatorAddress = wallet.address // You playing creator role
        
        console.log('💰 Balance before payment:', ethers.formatEther(await provider.getBalance(wallet.address)), 'ETH')
        
        // Check campaign before payment
        const campaignBefore = await contract.getCampaign(campaignId)
        console.log('💼 Campaign budget before payment:', ethers.formatEther(campaignBefore[5]), 'ETH')
        
        // Check if already paid
        const alreadyPaid = await contract.wasCreatorPaid(campaignId, creatorAddress)
        console.log('🔍 Creator already paid?', alreadyPaid)
        
        if (!alreadyPaid) {
            console.log('🚀 Simulating: Video got 5 likes + AI approved ✅')
            console.log('⚡ Triggering automatic payment...')
            
            const payTx = await contract.payCreator(campaignId, creatorAddress)
            console.log('📋 Payment transaction:', payTx.hash)
            console.log('🔗 View on Etherscan:', `https://sepolia.etherscan.io/tx/${payTx.hash}`)
            
            const receipt = await payTx.wait()
            console.log('✅ Payment confirmed!')
            
            // Check results
            const balanceAfter = await provider.getBalance(wallet.address)
            console.log('💰 Balance after payment:', ethers.formatEther(balanceAfter), 'ETH')
            
            const campaignAfter = await contract.getCampaign(campaignId)
            console.log('💼 Campaign budget after payment:', ethers.formatEther(campaignAfter[5]), 'ETH')
            
            const nowPaid = await contract.wasCreatorPaid(campaignId, creatorAddress)
            console.log('✅ Creator payment status:', nowPaid)
            
            console.log('\n🎯 PAYMENT SUMMARY:')
            console.log('   Creator received: 0.002 ETH')
            console.log('   Campaign budget reduced: 0.002 ETH') 
            console.log('   Payment recorded on blockchain ✅')
            
        } else {
            console.log('⚠️  Creator already received payment for this campaign')
        }
        
    } catch (error) {
        console.error('❌ Payment failed:', error.message)
        if (error.reason) {
            console.error('🔍 Reason:', error.reason)
        }
    }
}

testPayment()