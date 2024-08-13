import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  port: 3000,
  cors: {
    origin: '*',
  },
})
export class MessageGateway {
  @WebSocketServer()
  server: Server;

  private userSocketMap = new Map<string, Socket>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      // Disconnect the existing socket if it exists
      const existingSocket = this.userSocketMap.get(userId);
      if (existingSocket) {
        existingSocket.disconnect();
      }

      // Store the new socket
      this.userSocketMap.set(userId, client);
      client.join(userId);
    }
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSocketMap.delete(userId);
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() message: { senderId: string; receiverId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(message.receiverId).emit('receiveMessage', message);
    this.server.to(message.senderId).emit('receiveMessage', message);
  }
}
