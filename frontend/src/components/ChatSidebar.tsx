import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface ChatSidebarProps {
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  onShowProfile: () => void;
}

const ChatSidebar = ({ selectedUserId, onSelectUser, onShowProfile }: ChatSidebarProps) => {
  const { user, logout } = useAuth();
  const [chatList, setChatList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const chats = await api.getChatList();
      setChatList(chats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsSearching(true);
    try {
      const user = await api.searchUserByPhone(searchQuery);
      
      // Check if chat already exists
      const existingChat = chatList.find(
        (chat) => chat.otherUser.id === user.id
      );

      if (existingChat) {
        onSelectUser(user.id);
      } else {
        // Add to chat list temporarily
        setChatList(prev => [{
          otherUser: user,
          lastMessage: null,
        }, ...prev]);
        onSelectUser(user.id);
      }

      setSearchQuery('');
      toast.success('User found!');
    } catch (error) {
      toast.error('User not found');
    } finally {
      setIsSearching(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-full flex flex-col bg-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border bg-gradient-to-r from-primary to-secondary">
        <div className="flex items-center justify-between text-primary-foreground">
          <h1 className="text-xl font-bold">Chats</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-primary-foreground hover:bg-white/20"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 space-y-3 border-b border-sidebar-border">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-primary hover:bg-primary/90"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {chatList.map((chat) => (
            <button
              key={chat.otherUser.id}
              onClick={() => onSelectUser(chat.otherUser.id)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-sidebar-hover transition-colors ${
                selectedUserId === chat.otherUser.id ? 'bg-sidebar-active' : ''
              }`}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={chat.otherUser.profilePicture} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(chat.otherUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left overflow-hidden">
                <h3 className="font-semibold text-foreground">
                  {chat.otherUser.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {chat.lastMessage || 'Start a conversation'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Profile Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={onShowProfile}
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <User className="h-4 w-4" />
          My Profile
        </Button>
      </div>
    </div>
  );
};

export default ChatSidebar;
