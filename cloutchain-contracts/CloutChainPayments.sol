// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CloutChainPayments {
    address public owner;
    uint256 public totalCampaigns;
    
    // Campaign structure - flexible for demo and production
    struct Campaign {
        uint256 id;
        address brand;              // Who created campaign
        string name;                // "Review Nike Shoes"
        uint256 payoutPerCreator;   // ETH amount per creator (in Wei)
        uint256 totalEscrowed;      // Total ETH locked in contract
        uint256 remainingBudget;    // ETH left for payouts
        uint256 viewsThreshold;     // Production: 10,000 views needed
        uint256 likesThreshold;     // Demo: 5 likes needed
        bool useLikesForDemo;       // true = likes mode, false = views mode
        bool active;
        uint256 createdAt;
    }
    
    // Storage: campaignId => Campaign data
    mapping(uint256 => Campaign) public campaigns;
    
    // Track which creators have been paid per campaign
    mapping(uint256 => mapping(address => bool)) public creatorPaid;
    
    // Events = Blockchain receipts (permanent notifications)
    event ContractDeployed(address owner, uint256 timestamp);
    event CampaignCreated(
        uint256 indexed campaignId, 
        address indexed brand, 
        string name, 
        uint256 payout, 
        uint256 viewsNeeded,
        uint256 likesNeeded,
        bool demoMode
    );
    event CampaignFunded(uint256 indexed campaignId, uint256 amount);
    event CreatorPaid(uint256 indexed campaignId, address indexed creator, uint256 amount);
    
    constructor() {
        owner = msg.sender;
        totalCampaigns = 0;
        emit ContractDeployed(owner, block.timestamp);
    }
    
    // Simple test function to verify contract works
    function ping() external pure returns (string memory) {
        return "CloutChain contract is alive!";
    }
    
    // CAMPAIGN CREATION FUNCTION
    // This is "payable" - means brands can send ETH with the function call
    function createCampaign(
        string memory _name,           // "Review Nike Shoes"
        uint256 _payoutPerCreator,     // 0.002 ETH per creator (in Wei)
        uint256 _viewsThreshold,       // 10000 (production)
        uint256 _likesThreshold,       // 5 (demo)
        bool _useLikesForDemo          // true = demo mode
    ) external payable returns (uint256) {
        
        // VALIDATION CHECKS
        require(msg.value > 0, "Must send ETH to fund campaign");
        require(_payoutPerCreator > 0, "Payout must be greater than 0");
        require(msg.value >= _payoutPerCreator, "Must fund at least one payout");
        
        // If demo mode, require likes threshold
        if (_useLikesForDemo) {
            require(_likesThreshold > 0, "Demo mode needs likes threshold");
        } else {
            require(_viewsThreshold > 0, "Production mode needs views threshold");
        }
        
        // CREATE NEW CAMPAIGN
        totalCampaigns++; // Increment counter
        
        campaigns[totalCampaigns] = Campaign({
            id: totalCampaigns,
            brand: msg.sender,              // Who called this function
            name: _name,
            payoutPerCreator: _payoutPerCreator,
            totalEscrowed: msg.value,       // ETH sent with transaction
            remainingBudget: msg.value,     // All money available initially
            viewsThreshold: _viewsThreshold,
            likesThreshold: _likesThreshold,
            useLikesForDemo: _useLikesForDemo,
            active: true,
            createdAt: block.timestamp      // Current blockchain time
        });
        
        // EMIT EVENT (creates permanent blockchain receipt)
        emit CampaignCreated(
            totalCampaigns,
            msg.sender,
            _name,
            _payoutPerCreator,
            _viewsThreshold,
            _likesThreshold,
            _useLikesForDemo
        );
        
        emit CampaignFunded(totalCampaigns, msg.value);
        
        return totalCampaigns; // Return campaign ID
    }
    
    // PAY CREATOR FUNCTION (called by backend when metrics are hit)
    function payCreator(uint256 _campaignId, address _creator) external {
        require(msg.sender == owner, "Only contract owner can trigger payments");
        
        Campaign storage campaign = campaigns[_campaignId];
        
        // VALIDATION CHECKS
        require(campaign.active, "Campaign not active");
        require(campaign.remainingBudget >= campaign.payoutPerCreator, "Insufficient budget");
        require(!creatorPaid[_campaignId][_creator], "Creator already paid");
        
        // MAKE PAYMENT
        creatorPaid[_campaignId][_creator] = true;
        campaign.remainingBudget -= campaign.payoutPerCreator;
        
        // Transfer ETH to creator
        payable(_creator).transfer(campaign.payoutPerCreator);
        
        // EMIT PAYMENT EVENT
        emit CreatorPaid(_campaignId, _creator, campaign.payoutPerCreator);
    }
    
    // VIEW FUNCTIONS (read-only, no gas cost)
    function getCampaign(uint256 _campaignId) external view returns (
        uint256 id,
        address brand,
        string memory name,
        uint256 payoutPerCreator,
        uint256 totalEscrowed,
        uint256 remainingBudget,
        uint256 viewsThreshold,
        uint256 likesThreshold,
        bool useLikesForDemo,
        bool active
    ) {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.id,
            campaign.brand,
            campaign.name,
            campaign.payoutPerCreator,
            campaign.totalEscrowed,
            campaign.remainingBudget,
            campaign.viewsThreshold,
            campaign.likesThreshold,
            campaign.useLikesForDemo,
            campaign.active
        );
    }
    
    // Get contract basic info
    function getContractInfo() external view returns (address, uint256) {
        return (owner, totalCampaigns);
    }
    
    // Check if creator was paid
    function wasCreatorPaid(uint256 _campaignId, address _creator) external view returns (bool) {
        return creatorPaid[_campaignId][_creator];
    }
}