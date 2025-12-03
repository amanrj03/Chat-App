import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const clients = new Map();

export const setupWebSocket = (wss) => {
  wss.on('connection', async (ws, req) => {
    const token = new URL(req.url, 'http://localhost').searchParams.get('token');

    if (!token) {
      ws.close(1008, 'Token required');
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = decoded.userId;
      clients.set(decoded.userId, ws);

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);

          if (message.type === 'send_message') {
            const { receiverId, content } = message;

            // Check if blocked
            const blockRecord = await prisma.blockedUser.findFirst({
              where: {
                OR: [
                  { blockerId: ws.userId, blockedId: receiverId },
                  { blockerId: receiverId, blockedId: ws.userId }
                ]
              }
            });

            if (blockRecord) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Cannot send message - user is blocked'
              }));
              return;
            }

            // Save message
            const newMessage = await prisma.message.create({
              data: {
                content,
                senderId: ws.userId,
                receiverId
              },
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    profilePicture: true
                  }
                }
              }
            });

            // Update or create chat list
            await prisma.chatList.upsert({
              where: {
                user1Id_user2Id: {
                  user1Id: ws.userId < receiverId ? ws.userId : receiverId,
                  user2Id: ws.userId < receiverId ? receiverId : ws.userId
                }
              },
              create: {
                user1Id: ws.userId < receiverId ? ws.userId : receiverId,
                user2Id: ws.userId < receiverId ? receiverId : ws.userId,
                lastMessage: content,
                lastMessageSenderId: ws.userId
              },
              update: {
                lastMessage: content,
                lastMessageSenderId: ws.userId,
                updatedAt: new Date()
              }
            });

            // Send to receiver if online
            const receiverWs = clients.get(receiverId);
            if (receiverWs && receiverWs.readyState === 1) {
              receiverWs.send(JSON.stringify({
                type: 'new_message',
                message: newMessage
              }));
            }

            // Confirm to sender
            ws.send(JSON.stringify({
              type: 'message_sent',
              message: newMessage
            }));
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to process message'
          }));
        }
      });

      ws.on('close', () => {
        clients.delete(ws.userId);
      });
    } catch (error) {
      console.error('WebSocket auth error:', error);
      ws.close(1008, 'Invalid token');
    }
  });
};
