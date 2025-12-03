import { Button } from '@/components/ui/button';
import { MessageSquare, Search, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardNavProps {
  activeView: 'chat' | 'search';
  onViewChange: (view: 'chat' | 'search') => void;
}

const DashboardNav = ({ activeView, onViewChange }: DashboardNavProps) => {
  const { logout } = useAuth();

  return (
    <div className="h-16 border-b border-border bg-gradient-to-r from-primary to-secondary flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Button
          variant={activeView === 'chat' ? 'secondary' : 'ghost'}
          onClick={() => onViewChange('chat')}
          className="text-primary-foreground hover:bg-white/20"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          Chats
        </Button>
        <Button
          variant={activeView === 'search' ? 'secondary' : 'ghost'}
          onClick={() => onViewChange('search')}
          className="text-primary-foreground hover:bg-white/20"
        >
          <Search className="h-5 w-5 mr-2" />
          Search
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={logout}
        className="text-primary-foreground hover:bg-white/20"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default DashboardNav;
