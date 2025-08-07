import { ethers } from 'ethers'
import fs from 'fs'
import dotenv from 'dotenv'
import solc from 'solc'

// Load environment variables
dotenv.config({ path: '../.env' })

async function deployContract() {
    console.log('🚀 Starting basic contract deployment...')
    
    // Check if we have required env vars
    const privateKey = process.env.SEPOLIA_PRIVATE_KEY
    const rpcUrl = process.env.SEPOLIA_RPC_URL
    
    if (!privateKey || !rpcUrl) {
        console.error('❌ Missing SEPOLIA_PRIVATE_KEY or SEPOLIA_RPC_URL in .env file')
        return
    }
    
    try {
        // Connect to Sepolia
        const provider = new ethers.JsonRpcProvider(rpcUrl)
        const wallet = new ethers.Wallet(privateKey, provider)
        
        console.log('📍 Deploying from wallet:', wallet.address)
        
        // Check balance
        const balance = await provider.getBalance(wallet.address)
        console.log('💰 Wallet balance:', ethers.formatEther(balance), 'ETH')
        
        if (parseFloat(ethers.formatEther(balance)) < 0.005) {
            console.error('❌ Insufficient balance for deployment')
            return
        }
        
        // Read and compile contract
        const contractSource = fs.readFileSync('./CloutChainPayments.sol', 'utf8')
        console.log('📄 Contract loaded, compiling with Solidity...')
        
        // Compile the contract
        const input = {
            language: 'Solidity',
            sources: {
                'CloutChainPayments.sol': {
                    content: contractSource
                }
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['abi', 'evm.bytecode']
                    }
                }
            }
        }
        
        const compiled = JSON.parse(solc.compile(JSON.stringify(input)))
        
        if (compiled.errors) {
            console.log('⚠️  Compilation warnings/errors:')
            compiled.errors.forEach(error => console.log(error.formattedMessage))
        }
        
        const contract = compiled.contracts['CloutChainPayments.sol']['CloutChainPayments']
        const abi = contract.abi
        const bytecode = contract.evm.bytecode.object
        
        console.log('✅ Contract compiled successfully!')
        console.log('📦 ABI generated')
        console.log('💾 Bytecode ready')
        
        // Ask for confirmation before spending gas
        console.log('\n🚨 DEPLOYMENT WILL COST ~0.003-0.005 ETH (~$10-15)')
        console.log('💡 Press Ctrl+C to cancel, or wait 5 seconds to continue...')
        
        // 5 second countdown
        for (let i = 5; i > 0; i--) {
            process.stdout.write(`⏰ Deploying in ${i}... `)
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
        console.log('\n🚀 Starting deployment!')
        
        // Deploy the contract
        const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet)
        
        console.log('📡 Sending deployment transaction...')
        const deployedContract = await contractFactory.deploy()
        
        console.log('⏳ Waiting for deployment confirmation...')
        console.log('📋 Transaction hash:', deployedContract.deploymentTransaction().hash)
        
        await deployedContract.waitForDeployment()
        const contractAddress = await deployedContract.getAddress()
        
        console.log('✅ CONTRACT DEPLOYED SUCCESSFULLY!')
        console.log('📍 Contract Address:', contractAddress)
        console.log('🔗 View on Etherscan:', `https://sepolia.etherscan.io/address/${contractAddress}`)
        console.log('💳 Transaction:', `https://sepolia.etherscan.io/tx/${deployedContract.deploymentTransaction().hash}`)
        
        // Test the contract
        console.log('\n🧪 Testing deployed contract...')
        const pingResult = await deployedContract.ping()
        console.log('📞 Ping result:', pingResult)
        
        const [owner, totalCampaigns] = await deployedContract.getContractInfo()
        console.log('👤 Owner:', owner)
        console.log('📊 Total campaigns:', totalCampaigns.toString())
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message)
    }
}

deployContract()