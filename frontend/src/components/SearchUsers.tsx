import { useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

interface SearchUsersProps {
  onSelectUser: (userId: string) => void;
}

const SearchUsers = ({ onSelectUser }: SearchUsersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsSearching(true);
    try {
      const user = await api.searchUserByPhone(searchQuery);
      setSearchResults([user]);
      toast.success('User found!');
    } catch (error) {
      toast.error('User not found');
      setSearchResults([]);
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
      <div className="p-4 space-y-3 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold">Search Users</h2>
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

      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {searchResults.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user.id)}
              className="w-full p-4 flex items-center gap-3 hover:bg-sidebar-hover transition-colors"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left overflow-hidden">
                <h3 className="font-semibold text-foreground">{user.name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {user.phoneNumber}
                </p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SearchUsers;
