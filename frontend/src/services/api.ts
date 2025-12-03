// Update this URL after deploying your backend
const API_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const api = {
  // Chat endpoints
  getChatList: async () => {
    const response = await fetch(`${API_URL}/chat/chats`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch chats');
    return response.json();
  },

  getMessages: async (otherUserId: string) => {
    const response = await fetch(`${API_URL}/chat/messages/${otherUserId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  searchUserByPhone: async (phoneNumber: string) => {
    const response = await fetch(`${API_URL}/chat/search?phoneNumber=${phoneNumber}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('User not found');
    return response.json();
  },

  blockUser: async (blockedUserId: string) => {
    const response = await fetch(`${API_URL}/chat/block`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ blockedUserId }),
    });
    if (!response.ok) throw new Error('Failed to block user');
    return response.json();
  },

  unblockUser: async (blockedUserId: string) => {
    const response = await fetch(`${API_URL}/chat/unblock`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ blockedUserId }),
    });
    if (!response.ok) throw new Error('Failed to unblock user');
    return response.json();
  },

  checkBlockStatus: async (otherUserId: string) => {
    const response = await fetch(`${API_URL}/chat/block-status/${otherUserId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to check block status');
    return response.json();
  },

  // User endpoints
  getProfile: async () => {
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  getUserDetails: async (userId: string) => {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch user details');
    return response.json();
  },

  updateProfile: async (data: any) => {
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await fetch(`${API_URL}/user/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!response.ok) throw new Error('Failed to change password');
    return response.json();
  },

  deleteConversation: async (otherUserId: string) => {
    const response = await fetch(`${API_URL}/chat/conversation/${otherUserId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete conversation');
    return response.json();
  },
};
