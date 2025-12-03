import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { wsService } from '@/services/websocket';
import { encryptionService } from '@/lib/encryption';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChatListProps {
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  onShowProfile: () => void;
}

const ChatList = ({ selectedUserId, onSelectUser, onShowProfile }: ChatListProps) => {
  const { user } = useAuth();
  const [chatList, setChatList] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadChats();

    // Listen for new messages to update chat list
    const unsubscribe = wsService.onMessage((data) => {
      if (data.type === 'new_message' || data.type === 'message_sent') {
        const message = data.message;
        const otherUserId = message.senderId === user?.id ? message.receiverId : message.senderId;
        
        setChatList(prev => {
          const existingChatIndex = prev.findIndex(
            chat => chat.otherUser.id === otherUserId
          );

          if (existingChatIndex !== -1) {
            // Update existing chat with decrypted message
            const updated = [...prev];
            // For crypto_box: if I sent it, use recipient's key; otherwise use sender's key
            const decryptionKey = message.senderId === user?.id 
              ? updated[existingChatIndex].otherUser.publicKey  // I sent it - use recipient's key
              : updated[existingChatIndex].otherUser.publicKey; // They sent it - use sender's key
            const decryptedContent = decryptionKey 
              ? decryptMessage(message.content, decryptionKey)
              : 'Encrypted message';
            updated[existingChatIndex] = {
              ...updated[existingChatIndex],
              lastMessage: decryptedContent,
              lastMessageSenderId: message.senderId,
            };
            // Move to top
            const [updatedChat] = updated.splice(existingChatIndex, 1);
            return [updatedChat, ...updated];
          } else {
            // New chat - reload list
            loadChats();
            return prev;
          }
        });
      }
    });

    return unsubscribe;
  }, [user?.id]);

  const decryptMessage = (encryptedContent: string, senderPublicKey: string): string => {
    try {
      return encryptionService.decrypt(encryptedContent, senderPublicKey);
    } catch (error) {
      console.error('Failed to decrypt message:', error);
      return 'Unable to decrypt';
    }
  };

  const loadChats = async () => {
    try {
      const chats = await api.getChatList();
      
      // Decrypt last messages
      const decryptedChats = chats.map((chat: any) => {
        if (!chat.lastMessage) return { ...chat, lastMessage: null };
        
        // For crypto_box decryption, always use the other user's public key
        // (they're either the sender or recipient of the message)
        return {
          ...chat,
          lastMessage: chat.otherUser.publicKey 
            ? decryptMessage(chat.lastMessage, chat.otherUser.publicKey) 
            : 'Encrypted message',
        };
      });
      setChatList(decryptedChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const handleDeleteChat = async () => {
    if (!userToDelete) return;

    try {
      await api.deleteConversation(userToDelete);
      setChatList(prev => prev.filter(chat => chat.otherUser.id !== userToDelete));
      if (selectedUserId === userToDelete) {
        onSelectUser('');
      }
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete conversation');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
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
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {chatList.map((chat) => (
            <div
              key={chat.otherUser.id}
              className={`relative group flex items-center gap-3 p-4 hover:bg-sidebar-hover transition-colors ${
                selectedUserId === chat.otherUser.id ? 'bg-sidebar-active' : ''
              }`}
            >
              <button
                onClick={() => onSelectUser(chat.otherUser.id)}
                className="flex-1 flex items-center gap-3 text-left"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={chat.otherUser.profilePicture} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(chat.otherUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-semibold text-foreground">
                    {chat.otherUser.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage || 'Start a conversation'}
                  </p>
                </div>
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setUserToDelete(chat.otherUser.id);
                  setDeleteDialogOpen(true);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages with this user. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChat} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatList;
