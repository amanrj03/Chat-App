import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const deleteConversation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otherUserId } = req.params;

    // Delete all messages between the two users
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      }
    });

    // Delete from chat list
    await prisma.chatList.deleteMany({
      where: {
        OR: [
          { user1Id: userId, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: userId }
        ]
      }
    });

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};
