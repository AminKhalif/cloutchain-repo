import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { WalletConnect } from '@/components/WalletConnect';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import type { Campaign } from '@/lib/supabase';
import { toast } from 'sonner';

export default function BrandDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    campaignId: string;
    campaignName: string;
  }>({ isOpen: false, campaignId: '', campaignName: '' });
  
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    brand_name: '',
    target_likes: '',
    target_views: '',
    reward_amount: '',
    description: '',
    requirements: '',
    hashtags: ''
  });
  const [brandImage, setBrandImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load campaigns when wallet connects
  useEffect(() => {
    if (walletAddress) {
      loadCampaigns();
    }
  }, [walletAddress]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const campaigns = await apiClient.campaigns.getAll({
        brand_address: walletAddress || undefined
      });
      setCampaigns(campaigns);
    } catch (error: any) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.brand_name || !formData.reward_amount) {
      toast.error('Please fill in brand name and reward amount');
      return;
    }

    // Allow 0 values - just need at least one field filled
    const hasTargets = formData.target_likes || formData.target_views;
    if (!hasTargets) {
      toast.error('Please set target likes or views');
      return;
    }

    setIsCreating(true);

    try {
      // First create on blockchain (this handles the real escrow)
      const blockchainData = {
        name: formData.brand_name,
        payoutPerCreator: formData.reward_amount,
        viewsThreshold: parseInt(formData.target_views) || 0,
        likesThreshold: parseInt(formData.target_likes) || 0,
        useLikesForDemo: !!formData.target_likes, // Use likes if specified
        totalFunding: (parseFloat(formData.reward_amount) * 5).toString() // Fund for 5 creators
      };

      toast.success('Creating campaign on blockchain...');
      const blockchainResult = await apiClient.blockchain.createCampaign(blockchainData);

      if (!blockchainResult.success) {
        throw new Error(blockchainResult.error || 'Blockchain campaign creation failed');
      }

      // Then create in database for UI with image
      const targetMetrics: any = {};
      if (formData.target_likes !== '') targetMetrics.likes = parseInt(formData.target_likes) || 0;
      if (formData.target_views !== '') targetMetrics.views = parseInt(formData.target_views) || 0;

      // Create FormData for file upload
      const campaignFormData = new FormData();
      campaignFormData.append('brand_address', walletAddress);
      campaignFormData.append('campaign_name', formData.brand_name);
      campaignFormData.append('target_metrics', JSON.stringify(targetMetrics));
      campaignFormData.append('reward_amount', formData.reward_amount);
      campaignFormData.append('description', formData.description);
      campaignFormData.append('requirements', formData.requirements);
      campaignFormData.append('tags', JSON.stringify(formData.hashtags ? formData.hashtags.split(',').map(tag => tag.trim()) : []));
      
      if (brandImage) {
        campaignFormData.append('brandImage', brandImage);
      }

      const campaign = await apiClient.campaigns.createWithImage(campaignFormData);

      // Add blockchain info to campaign
      campaign.blockchain_campaign_id = blockchainResult.campaignId;
      campaign.blockchain_tx = blockchainResult.transactionHash;
      
      // Update the campaign in database with funding transaction hash and blockchain campaign ID
      try {
        await apiClient.campaigns.updateFunding(
          campaign.id, 
          blockchainResult.transactionHash, 
          blockchainResult.campaignId
        );
      } catch (error) {
        console.error('Failed to update funding info:', error);
      }

      // Add to local state
      setCampaigns(prev => [campaign, ...prev]);
      
      // Reset form
      setFormData({
        brand_name: '',
        target_likes: '',
        target_views: '',
        reward_amount: '',
        description: '',
        requirements: '',
        hashtags: ''
      });
      setBrandImage(null);
      setImagePreview(null);

      toast.success(`Campaign created! Blockchain ID: ${blockchainResult.campaignId}`);
      if (blockchainResult.transactionHash) {
        toast.success(`View on Etherscan: https://sepolia.etherscan.io/tx/${blockchainResult.transactionHash}`);
      }
      
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error(`Failed to create campaign: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    setDeletingCampaign(campaignId);

    try {
      await apiClient.campaigns.delete(campaignId);
      
      // Remove from local state
      setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
      
      toast.success('Campaign deleted successfully');
      
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      toast.error(`Failed to delete campaign: ${error.message}`);
    } finally {
      setDeletingCampaign(null);
      setConfirmModal({ isOpen: false, campaignId: '', campaignName: '' });
    }
  };

  const openDeleteModal = (campaignId: string, campaignName: string) => {
    setConfirmModal({ isOpen: true, campaignId, campaignName });
  };

  const closeDeleteModal = () => {
    setConfirmModal({ isOpen: false, campaignId: '', campaignName: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      <LoadingOverlay 
        message="Creating campaign and locking funds on blockchain..."
        isVisible={isCreating}
      />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="page-header">Brand Dashboard</h1>
            <p className="text-muted-foreground">Create campaigns and manage creator submissions</p>
          </div>
          <WalletConnect 
            onConnect={(address) => setWalletAddress(address)}
            onDisconnect={() => setWalletAddress(null)}
          />
        </div>

        {/* Wallet Connection Required */}
        {!walletAddress && (
          <div className="campaign-card mb-8 animate-fade-in text-center">
            <h2 className="section-title">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Please connect your MetaMask wallet to create campaigns and manage payments.
            </p>
          </div>
        )}

        {/* Create Campaign Form */}
        {walletAddress && (
          <div className="campaign-card mb-8 animate-fade-in">
            <h2 className="section-title">Create New Campaign</h2>
          
          <form onSubmit={handleCreateCampaign} className="space-y-6">
            {/* Brand Image - Moved to Top */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Brand Image <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setBrandImage(file);
                      const reader = new FileReader();
                      reader.onload = (e) => setImagePreview(e.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {imagePreview && (
                  <div className="relative w-32 h-32">
                    <img src={imagePreview} alt="Brand preview" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => {
                        setBrandImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={formData.brand_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand_name: e.target.value }))}
                  className="form-input"
                  placeholder="Blai App"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Target Likes
                </label>
                <input
                  type="number"
                  value={formData.target_likes}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_likes: e.target.value }))}
                  className="form-input"
                  placeholder="100"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Target Views
                </label>
                <input
                  type="number"
                  value={formData.target_views}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_views: e.target.value }))}
                  className="form-input"
                  placeholder="10000"
                  min="1"
                />
              </div>

              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reward Amount (ETH) *
                </label>
                <input
                  type="number"
                  step="0.00001"
                  min="0.00001"
                  value={formData.reward_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, reward_amount: e.target.value }))}
                  className="form-input"
                  placeholder="0.001"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum: 0.00001 ETH
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Campaign Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="form-textarea min-h-[180px] resize-y text-base"
                rows={8}
                placeholder="Showcase our AI-powered crypto trading app with authentic, engaging content that highlights key features and benefits..."
                style={{ fontSize: '16px', lineHeight: '1.6' }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Content Requirements
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                className="form-textarea min-h-[180px] resize-y text-base"
                rows={8}
                placeholder="Show AI features, demonstrate crypto functionality, authentic review style, mention key benefits, minimum 15 seconds duration..."
                style={{ fontSize: '16px', lineHeight: '1.6' }}
              />
              <p className="text-xs text-muted-foreground mt-2">
                💡 Our AI will analyze submissions to ensure they meet these requirements
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Required Hashtags <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.hashtags}
                onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
                className="form-input"
                placeholder="#crypto, #AI, #trading"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate hashtags with commas
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">💡 How it works:</h4>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Create your campaign with requirements</li>
                <li>2. Creators will accept and create TikTok videos</li>
                <li>3. AI verifies content meets your requirements</li>
                <li>4. Payment automatically releases when targets are hit</li>
              </ol>
            </div>
            
            <button
              type="submit"
              disabled={isCreating}
              className="action-button"
            >
              <Plus size={18} />
              Create Campaign & Deposit Funds
            </button>
          </form>
        </div>
        )}

        {/* Active Campaigns */}
        {walletAddress && (
        <div className="animate-fade-in">
          <h2 className="section-title">Your Active Campaigns</h2>
          
          <div className="space-y-4">
            {campaigns.map((campaign, index) => (
              <div key={campaign.id} className="campaign-card animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{campaign.campaign_name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Platform:</span>
                        <p className="font-medium">TikTok</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target Views:</span>
                        <p className="font-medium">{campaign.target_metrics?.views || 'Any'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target Likes:</span>
                        <p className="font-medium">{campaign.target_metrics?.likes || 'Any'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reward:</span>
                        <p className="font-medium">{campaign.reward_amount} ETH</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-muted-foreground text-sm">Status:</span>
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-6 flex gap-3">
                    <Link 
                      to={`/campaign/${campaign.id}`}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <ExternalLink size={16} />
                      View Submissions
                    </Link>
                    
                    <button
                      onClick={() => openDeleteModal(campaign.id, campaign.campaign_name)}
                      disabled={deletingCampaign === campaign.id}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300 disabled:opacity-50 flex items-center gap-2 shadow-sm hover:shadow-md"
                      title="Delete campaign"
                    >
                      {deletingCampaign === campaign.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteCampaign(confirmModal.campaignId)}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${confirmModal.campaignName}"? This will also delete all associated submissions and cannot be undone.`}
        confirmText="Delete Campaign"
        type="danger"
        isLoading={deletingCampaign === confirmModal.campaignId}
      />
    </div>
  );
}