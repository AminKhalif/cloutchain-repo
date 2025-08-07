import { Link, useLocation } from 'react-router-dom';
import { Building, Users } from 'lucide-react';

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-primary hover:text-primary-glow transition-colors">
              CloutChain
            </Link>
            
            <div className="flex items-center gap-4">
              <Link 
                to="/brand" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-accent ${
                  location.pathname === '/brand' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building size={18} />
                Brand Dashboard
              </Link>
              
              <Link 
                to="/creator" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-accent ${
                  location.pathname === '/creator' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users size={18} />
                Creator Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};