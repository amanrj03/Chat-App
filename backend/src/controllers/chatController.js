import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getChatList = async (req, res) => {
  try {
    const userId = req.user.userId;

    const chats = await prisma.chatList.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            profilePicture: true,
            publicKey: true
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            profilePicture: true,
            publicKey: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const chatList = chats.map(chat => ({
      ...chat,
      otherUser: chat.user1Id === userId ? chat.user2 : chat.user1,
      lastMessageSenderId: chat.lastMessageSenderId
    }));

    res.json(chatList);
  } catch (error) {
    console.error('Get chat list error:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otherUserId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            publicKey: true
          }
        }
      }
    });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const searchUserByPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.query;

    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        profilePicture: true,
        bio: true,
        publicKey: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Search user error:', error);
    res.status(500).json({ error: 'Failed to search user' });
  }
};

export const blockUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { blockedUserId } = req.body;

    await prisma.blockedUser.create({
      data: {
        blockerId: userId,
        blockedId: blockedUserId
      }
    });

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { blockedUserId } = req.body;

    await prisma.blockedUser.deleteMany({
      where: {
        blockerId: userId,
        blockedId: blockedUserId
      }
    });

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
};

export const checkBlockStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otherUserId } = req.params;

    const blockRecord = await prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: otherUserId },
          { blockerId: otherUserId, blockedId: userId }
        ]
      }
    });

    res.json({
      isBlocked: !!blockRecord,
      blockedByMe: blockRecord?.blockerId === userId
    });
  } catch (error) {
    console.error('Check block status error:', error);
    res.status(500).json({ error: 'Failed to check block status' });
  }
};
