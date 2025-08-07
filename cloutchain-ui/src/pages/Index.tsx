import { Link } from 'react-router-dom';
import { Building, Users, Shield, Zap, Target, DollarSign } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Revolutionize Creator <span className="text-primary">Payments</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            CloutChain uses smart contracts and AI verification to create transparent, 
            automated payment systems between brands and content creators.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/brand" 
              className="action-button bg-primary text-primary-foreground hover:bg-primary-glow"
            >
              <Building size={20} />
              I'm a Brand
            </Link>
            <Link 
              to="/creator" 
              className="action-button bg-secondary text-secondary-foreground hover:bg-accent"
            >
              <Users size={20} />
              I'm a Creator
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="campaign-card text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Content Verification</h3>
            <p className="text-muted-foreground">
              Advanced AI automatically verifies content quality, brand compliance, and authenticity before payment release.
            </p>
          </div>

          <div className="campaign-card text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Contract Automation</h3>
            <p className="text-muted-foreground">
              Blockchain-powered smart contracts automatically release payments when performance metrics are met.
            </p>
          </div>

          <div className="campaign-card text-center animate-fade-in" style={{ animationDelay: '600ms' }}>
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-warning" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Performance Tracking</h3>
            <p className="text-muted-foreground">
              Real-time view tracking and engagement metrics ensure creators meet campaign objectives.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-12">How CloutChain Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Brand Flow */}
            <div className="campaign-card animate-fade-in" style={{ animationDelay: '200ms' }}>
              <Building className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-6">For Brands</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-medium">Create Campaign</h4>
                    <p className="text-sm text-muted-foreground">Set up your campaign with target metrics and content guidelines</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-medium">Lock Funds</h4>
                    <p className="text-sm text-muted-foreground">Deposit payment amount into secure smart contract</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-medium">Monitor & Release</h4>
                    <p className="text-sm text-muted-foreground">Review submissions and automatically release payments when targets are met</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Flow */}
            <div className="campaign-card animate-fade-in" style={{ animationDelay: '400ms' }}>
              <Users className="w-8 h-8 text-success mb-4" />
              <h3 className="text-xl font-semibold mb-6">For Creators</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-medium">Browse Campaigns</h4>
                    <p className="text-sm text-muted-foreground">Find campaigns that match your content style and audience</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-medium">Create Content</h4>
                    <p className="text-sm text-muted-foreground">Produce content following brand guidelines and submit for AI verification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-medium">Get Paid</h4>
                    <p className="text-sm text-muted-foreground">Receive automatic payment when your content meets performance targets</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="campaign-card text-center animate-fade-in">
          <DollarSign className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Join the future of creator economy with transparent, automated payments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/brand" 
              className="action-button bg-primary text-primary-foreground hover:bg-primary-glow"
            >
              Launch a Campaign
            </Link>
            <Link 
              to="/creator" 
              className="action-button bg-secondary text-secondary-foreground hover:bg-accent"
            >
              Start Earning
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
