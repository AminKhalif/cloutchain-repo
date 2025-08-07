import { BlockchainService } from './src/services/blockchainService.js'

async function testBlockchainService() {
    console.log('🧪 Testing Blockchain Service Integration...')
    
    try {
        // Initialize service
        const blockchain = new BlockchainService()
        
        // Test connection
        console.log('\n1️⃣ Testing blockchain connection...')
        const connectionTest = await blockchain.testConnection()
        
        if (connectionTest.success) {
            console.log('✅ Connection successful!')
            console.log('   Contract owner:', connectionTest.contractOwner)
            console.log('   Total campaigns:', connectionTest.totalCampaigns)
            console.log('   Wallet balance:', connectionTest.walletBalance, 'ETH')
        } else {
            console.error('❌ Connection failed:', connectionTest.error)
            return
        }
        
        // Test campaign creation (for your real test scenario)
        console.log('\n2️⃣ Creating test campaign for Blai video...')
        const campaignData = {
            name: "Blai App Review Campaign",
            payoutPerCreator: "0.001",  // 0.001 ETH per creator
            viewsThreshold: 0,          // Not used in demo
            likesThreshold: 4,          // Need 4 likes (your video has 3)
            useLikesForDemo: true,      // Demo mode
            totalFunding: "0.005"       // Fund for 5 creators
        }
        
        console.log('📋 Campaign details:')
        console.log('   Name:', campaignData.name)
        console.log('   Payout per creator:', campaignData.payoutPerCreator, 'ETH')
        console.log('   Likes threshold:', campaignData.likesThreshold, '(current video has 3)')
        console.log('   Total funding:', campaignData.totalFunding, 'ETH')
        
        const createResult = await blockchain.createCampaign(campaignData)
        
        if (createResult.success) {
            console.log('✅ Campaign created successfully!')
            console.log('   Campaign ID:', createResult.campaignId)
            console.log('   Transaction:', createResult.transactionHash)
            console.log('   View on Etherscan: https://sepolia.etherscan.io/tx/' + createResult.transactionHash)
            
            // Get campaign details
            console.log('\n3️⃣ Reading campaign from blockchain...')
            const campaignDetails = await blockchain.getCampaign(createResult.campaignId)
            
            if (campaignDetails.success) {
                console.log('✅ Campaign details retrieved:')
                console.log('   ID:', campaignDetails.campaign.id)
                console.log('   Name:', campaignDetails.campaign.name)
                console.log('   Likes needed:', campaignDetails.campaign.likesThreshold)
                console.log('   Budget remaining:', campaignDetails.campaign.remainingBudget, 'ETH')
                console.log('   Active:', campaignDetails.campaign.active)
                
                console.log('\n🎯 READY FOR DEMO!')
                console.log('📹 Test video: https://www.tiktok.com/@blaiapp/video/7488572886534327598')
                console.log('💡 When video gets 4 likes → payment will be triggered!')
                console.log('🔗 Campaign ID for testing:', createResult.campaignId)
                
            } else {
                console.error('❌ Failed to read campaign:', campaignDetails.error)
            }
            
        } else {
            console.error('❌ Campaign creation failed:', createResult.error)
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message)
    }
}

testBlockchainService()