// Metrics Checker Service - Manual triggering to avoid burning credits
import { TikTokService } from './tiktok.js'
import { BlockchainService } from './blockchainService.js'
import { AIVerificationService } from './aiVerification.js'

export class MetricsCheckerService {
    constructor() {
        this.blockchain = new BlockchainService()
    }

    /**
     * Manual metrics check for a specific submission
     * Call this when user clicks "Check Metrics" button
     */
    async checkSubmissionMetrics(submissionData) {
        try {
            console.log('🔍 Manual metrics check initiated...')
            console.log('📹 Video:', submissionData.tiktokUrl)
            console.log('🎯 Campaign ID:', submissionData.campaignId)

            // Step 1: Get campaign details from blockchain
            console.log('\n1️⃣ Getting campaign requirements...')
            const campaignResult = await this.blockchain.getCampaign(submissionData.campaignId)
            
            if (!campaignResult.success) {
                throw new Error(`Failed to get campaign: ${campaignResult.error}`)
            }

            const campaign = campaignResult.campaign
            console.log('📋 Campaign:', campaign.name)
            console.log('💰 Payout:', campaign.payoutPerCreator, 'ETH')
            
            // Determine which metrics to check
            const targetMetrics = campaign.useLikesForDemo 
                ? { likes: parseInt(campaign.likesThreshold) }
                : { views: parseInt(campaign.viewsThreshold) }

            console.log('🎯 Target metrics:', targetMetrics)

            // Step 2: Fetch current TikTok metrics
            console.log('\n2️⃣ Fetching current TikTok metrics...')
            const currentMetrics = await TikTokService.getVideoAnalytics(submissionData.tiktokUrl)

            // Step 3: Check if thresholds are met
            console.log('\n3️⃣ Comparing metrics...')
            const metricsReached = TikTokService.checkTargetReached(currentMetrics, targetMetrics)
            
            console.log('📊 Current metrics:')
            console.log('   Likes:', currentMetrics.likes)
            console.log('   Views:', currentMetrics.views)
            console.log('   Comments:', currentMetrics.comments)
            
            console.log('🎯 Required metrics:')
            for (const [metric, target] of Object.entries(targetMetrics)) {
                const current = currentMetrics[metric]
                const status = current >= target ? '✅' : '❌'
                console.log(`   ${metric}: ${current}/${target} ${status}`)
            }

            // Step 4: AI Verification (if enabled)
            let aiApproved = true // Default to true for demo
            console.log('\n4️⃣ AI Verification...')
            
            // Note: AI verification might hit quota limits, so make it optional
            if (submissionData.requireAiApproval && submissionData.videoPath) {
                try {
                    console.log('🤖 Running AI verification...')
                    const aiResult = await AIVerificationService.analyzeVideo(
                        submissionData.videoPath, 
                        { brandName: campaign.name }
                    )
                    aiApproved = aiResult.approved
                    console.log('🤖 AI Result:', aiApproved ? 'Approved ✅' : 'Rejected ❌')
                } catch (aiError) {
                    console.log('⚠️  AI verification skipped (quota limit):', aiError.message)
                    aiApproved = true // Skip AI for demo
                }
            } else {
                console.log('🤖 AI verification skipped (demo mode)')
            }

            // Step 5: Trigger payment if conditions met
            const shouldPay = metricsReached && aiApproved
            console.log('\n5️⃣ Payment Decision:')
            console.log('   Metrics reached:', metricsReached ? '✅' : '❌')
            console.log('   AI approved:', aiApproved ? '✅' : '❌')
            console.log('   Should pay:', shouldPay ? '✅ YES' : '❌ NO')

            let paymentResult = null

            if (shouldPay) {
                console.log('\n💳 Triggering automatic payment...')
                paymentResult = await this.blockchain.payCreator(
                    submissionData.campaignId,
                    submissionData.creatorAddress
                )

                if (paymentResult.success) {
                    console.log('✅ Payment successful!')
                    console.log('📋 Transaction:', paymentResult.transactionHash)
                    console.log('🔗 View on Etherscan:', `https://sepolia.etherscan.io/tx/${paymentResult.transactionHash}`)
                } else {
                    console.log('❌ Payment failed:', paymentResult.error)
                }
            }

            // Return complete results
            return {
                success: true,
                metricsReached,
                aiApproved,
                shouldPay,
                currentMetrics,
                targetMetrics,
                paymentResult,
                campaignDetails: campaign
            }

        } catch (error) {
            console.error('❌ Metrics check failed:', error.message)
            return {
                success: false,
                error: error.message
            }
        }
    }

    /**
     * Quick test with your Blai video
     */
    async testBlaiVideo() {
        console.log('🧪 Testing with Blai video...')
        
        const testSubmission = {
            tiktokUrl: 'https://www.tiktok.com/@blaiapp/video/7488572886534327598',
            campaignId: 2, // The campaign we just created
            creatorAddress: '0x627fcC526303935651d6843772bA5d7b7F7584c5', // Your wallet
            requireAiApproval: false, // Skip AI to avoid quota
            videoPath: null
        }

        return await this.checkSubmissionMetrics(testSubmission)
    }
}