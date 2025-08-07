import { ethers } from 'ethers'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '../.env' })

const CONTRACT_ADDRESS = '0x6D96FaafEE3a8f5EBb83855919E1C0fdB90036e1'

// Contract ABI (Application Binary Interface)
const CONTRACT_ABI = [
    "function createCampaign(string memory _name, uint256 _payoutPerCreator, uint256 _viewsThreshold, uint256 _likesThreshold, bool _useLikesForDemo) external payable returns (uint256)",
    "function payCreator(uint256 _campaignId, address _creator) external",
    "function getCampaign(uint256 _campaignId) external view returns (uint256, address, string, uint256, uint256, uint256, uint256, uint256, bool, bool)",
    "function getContractInfo() external view returns (address, uint256)",
    "function wasCreatorPaid(uint256 _campaignId, address _creator) external view returns (bool)",
    "event CampaignCreated(uint256 indexed campaignId, address indexed brand, string name, uint256 payout, uint256 viewsNeeded, uint256 likesNeeded, bool demoMode)",
    "event CreatorPaid(uint256 indexed campaignId, address indexed creator, uint256 amount)"
]

async function testCampaignFlow() {
    console.log('🧪 Testing CloutChain Campaign System...')
    
    try {
        // Connect to Sepolia
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL)
        const wallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider)
        
        console.log('👤 Testing with wallet:', wallet.address)
        console.log('💰 Current balance:', ethers.formatEther(await provider.getBalance(wallet.address)), 'ETH')
        
        // Connect to contract
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet)
        
        console.log('📋 Contract address:', CONTRACT_ADDRESS)
        
        // Check contract info
        const [owner, totalCampaigns] = await contract.getContractInfo()
        console.log('👑 Contract owner:', owner)
        console.log('📊 Total campaigns:', totalCampaigns.toString())
        
        console.log('\n🚀 STEP 1: Creating demo campaign...')
        
        // Create a demo campaign
        // Name: "Test Nike Review"
        // Payout: 0.002 ETH per creator
        // Views: 0 (ignored in demo mode)
        // Likes: 5 (demo threshold)
        // Demo mode: true
        
        const campaignName = "Test Nike Review Campaign"
        const payoutPerCreator = ethers.parseEther("0.002")  // 0.002 ETH in Wei
        const viewsThreshold = 0  // Ignored in demo mode
        const likesThreshold = 5  // Need 5 likes
        const useLikesForDemo = true  // Demo mode
        const campaignFunding = ethers.parseEther("0.01")  // Fund with 0.01 ETH (5 creators max)
        
        console.log('💡 Campaign details:')
        console.log('   Name:', campaignName)
        console.log('   Payout per creator:', ethers.formatEther(payoutPerCreator), 'ETH')
        console.log('   Likes needed:', likesThreshold, '(demo mode)')
        console.log('   Total funding:', ethers.formatEther(campaignFunding), 'ETH')
        
        console.log('\n⏳ Creating campaign (this will cost gas + funding)...')
        
        const createTx = await contract.createCampaign(
            campaignName,
            payoutPerCreator,
            viewsThreshold,
            likesThreshold,
            useLikesForDemo,
            { value: campaignFunding }
        )
        
        console.log('📋 Campaign creation tx:', createTx.hash)
        console.log('⏳ Waiting for confirmation...')
        
        const receipt = await createTx.wait()
        console.log('✅ Campaign created successfully!')
        console.log('⛽ Gas used:', receipt.gasUsed.toString())
        
        // Get campaign ID from events
        const campaignCreatedEvent = receipt.logs.find(log => {
            try {
                const parsed = contract.interface.parseLog(log)
                return parsed.name === 'CampaignCreated'
            } catch {
                return false
            }
        })
        
        if (campaignCreatedEvent) {
            const parsedEvent = contract.interface.parseLog(campaignCreatedEvent)
            const campaignId = parsedEvent.args.campaignId
            
            console.log('🎯 Campaign ID:', campaignId.toString())
            
            console.log('\n🔍 STEP 2: Reading campaign details...')
            
            const campaignData = await contract.getCampaign(campaignId)
            console.log('📋 Campaign details:')
            console.log('   ID:', campaignData[0].toString())
            console.log('   Brand:', campaignData[1])
            console.log('   Name:', campaignData[2])
            console.log('   Payout per creator:', ethers.formatEther(campaignData[3]), 'ETH')
            console.log('   Total escrowed:', ethers.formatEther(campaignData[4]), 'ETH')
            console.log('   Remaining budget:', ethers.formatEther(campaignData[5]), 'ETH')
            console.log('   Likes threshold:', campaignData[7].toString())
            console.log('   Demo mode:', campaignData[8])
            console.log('   Active:', campaignData[9])
            
            console.log('\n💳 STEP 3: Testing payment to creator...')
            console.log('🎭 You are playing both roles: Brand (you) + Creator (also you)')
            
            // Check if already paid
            const alreadyPaid = await contract.wasCreatorPaid(campaignId, wallet.address)
            console.log('💰 Creator already paid?', alreadyPaid)
            
            if (!alreadyPaid) {
                console.log('⏳ Paying creator (simulating successful metrics + AI approval)...')
                
                const payTx = await contract.payCreator(campaignId, wallet.address)
                console.log('📋 Payment tx:', payTx.hash)
                
                const payReceipt = await payTx.wait()
                console.log('✅ Payment successful!')
                console.log('⛽ Gas used:', payReceipt.gasUsed.toString())
                
                // Check updated campaign
                const updatedCampaign = await contract.getCampaign(campaignId)
                console.log('💰 Remaining budget after payment:', ethers.formatEther(updatedCampaign[5]), 'ETH')
                
                const nowPaid = await contract.wasCreatorPaid(campaignId, wallet.address)
                console.log('✅ Creator payment status:', nowPaid)
            } else {
                console.log('⚠️  Creator already paid for this campaign')
            }
        }
        
        console.log('\n🎉 TEST COMPLETE!')
        console.log('💰 Final balance:', ethers.formatEther(await provider.getBalance(wallet.address)), 'ETH')
        
    } catch (error) {
        console.error('❌ Test failed:', error.message)
        if (error.reason) {
            console.error('🔍 Reason:', error.reason)
        }
    }
}

testCampaignFlow()