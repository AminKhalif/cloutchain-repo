import { MetricsCheckerService } from './src/services/metricsChecker.js'

async function testManualMetricsCheck() {
    console.log('🧪 Manual Metrics Check Test')
    console.log('📹 Video: https://www.tiktok.com/@blaiapp/video/7488572886534327598')
    console.log('🎯 Campaign: Need 4 likes to trigger payment')
    console.log('💰 Payout: 0.001 ETH when conditions met')
    console.log('\n' + '='.repeat(50))
    
    try {
        const metricsChecker = new MetricsCheckerService()
        
        console.log('🔄 Checking metrics now...\n')
        const result = await metricsChecker.testBlaiVideo()
        
        if (result.success) {
            console.log('\n' + '🎉 METRICS CHECK COMPLETE!'.padStart(35))
            console.log('='.repeat(50))
            
            console.log('\n📊 CURRENT STATUS:')
            console.log('   Video likes:', result.currentMetrics.likes)
            console.log('   Video views:', result.currentMetrics.views)
            console.log('   Likes needed:', result.targetMetrics.likes)
            console.log('   Metrics reached:', result.metricsReached ? '✅ YES' : '❌ NO')
            
            if (result.shouldPay && result.paymentResult?.success) {
                console.log('\n💳 PAYMENT TRIGGERED!')
                console.log('   Status: ✅ SUCCESS')
                console.log('   Amount: 0.001 ETH')
                console.log('   Transaction:', result.paymentResult.transactionHash)
                console.log('   🔗 View: https://sepolia.etherscan.io/tx/' + result.paymentResult.transactionHash)
            } else if (result.shouldPay && result.paymentResult?.error) {
                console.log('\n💳 PAYMENT ATTEMPTED BUT FAILED:')
                console.log('   Error:', result.paymentResult.error)
            } else {
                console.log('\n⏳ PAYMENT NOT TRIGGERED:')
                console.log('   Need', result.targetMetrics.likes - result.currentMetrics.likes, 'more likes')
                console.log('   💡 Like the video and run this script again!')
            }
            
            console.log('\n🔄 To check again: node test-metrics-manual.js')
            
        } else {
            console.error('❌ Metrics check failed:', result.error)
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message)
    }
}

testManualMetricsCheck()