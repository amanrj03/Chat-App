import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { wsService } from '@/services/websocket';
import { encryptionService } from '@/lib/encryption';
import DashboardNav from '@/components/DashboardNav';
import ChatList from '@/components/ChatList';
import SearchUsers from '@/components/SearchUsers';
import ChatInterface from '@/components/ChatInterface';
import UserProfile from '@/components/UserProfile';

const Dashboard = () => {
  const { token } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'search'>('chat');
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const initializeEncryption = async () => {
      await encryptionService.initialize();
      
      // Load existing keys (should exist from signup/login)
      const storedPublicKey = localStorage.getItem('publicKey');
      const storedPrivateKey = localStorage.getItem('privateKey');

      if (storedPublicKey && storedPrivateKey) {
        encryptionService.loadKeyPair(storedPublicKey, storedPrivateKey);
        console.log('Encryption keys loaded successfully');
      } else {
        console.error('Encryption keys not found! Please signup again.');
      }
    };

    initializeEncryption();

    if (token) {
      wsService.connect(token);
      console.log('WebSocket connected');
    }

    return () => {
      wsService.disconnect();
    };
  }, [token]);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    // Hide sidebar on mobile when chat is selected
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const handleBackToSidebar = () => {
    setShowSidebar(true);
    setSelectedUserId(null);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className={`${
        showSidebar ? 'flex' : 'hidden'
      } md:flex w-full md:w-96 border-r border-border flex-shrink-0 flex-col`}>
        <DashboardNav activeView={activeView} onViewChange={setActiveView} />
        {activeView === 'chat' ? (
          <ChatList
            selectedUserId={selectedUserId}
            onSelectUser={handleSelectUser}
            onShowProfile={() => setShowProfile(true)}
          />
        ) : (
          <SearchUsers onSelectUser={(userId) => {
            handleSelectUser(userId);
            setActiveView('chat');
          }} />
        )}
      </div>

      {/* Chat Interface */}
      <div className={`${
        showSidebar ? 'hidden' : 'flex'
      } md:flex flex-1 flex-col`}>
        {selectedUserId ? (
          <ChatInterface userId={selectedUserId} onBack={handleBackToSidebar} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center space-y-3">
              <div className="text-6xl">💬</div>
              <h3 className="text-2xl font-semibold text-foreground">
                Welcome to Chat
              </h3>
              <p className="text-muted-foreground">
                Select a conversation to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
    </div>
  );
};

export default Dashboard;
