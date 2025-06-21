import mineflayer from 'mineflayer';
import { storage } from './storage';
import { WebSocket } from 'ws';
import type { ChatMessageData, BotStatusData, WebSocketMessage } from '@shared/schema';

export class MinecraftBot {
  private bot: any = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private uptimeStart: number = 0;
  private autoJumpInterval: NodeJS.Timeout | null = null;
  private websocketClients: Set<WebSocket> = new Set();

  constructor() {
    this.initializeBot();
  }

  addWebSocketClient(ws: WebSocket) {
    this.websocketClients.add(ws);
    ws.on('close', () => {
      this.websocketClients.delete(ws);
    });
  }

  private broadcast(message: WebSocketMessage) {
    const messageStr = JSON.stringify(message);
    this.websocketClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  private async updateStatus(status: Partial<BotStatusData>) {
    const currentStatus = await storage.getBotStatus();
    const uptime = this.uptimeStart ? Math.floor((Date.now() - this.uptimeStart) / 1000) : 0;
    
    const newStatus = {
      status: currentStatus?.status || 'offline',
      username: 'King97334',
      server: 'survival-2',
      version: '1.21.4',
      uptime,
      autoJump: currentStatus?.autoJump || false,
      ...status,
    };

    await storage.updateBotStatus(newStatus);
    this.broadcast({
      type: 'status',
      data: newStatus
    });
  }

  private async addChatMessage(messageData: ChatMessageData) {
    const message = await storage.insertChatMessage({
      type: messageData.type,
      username: messageData.username,
      message: messageData.message,
    });

    this.broadcast({
      type: 'chat',
      data: {
        ...messageData,
        timestamp: message.timestamp.toISOString(),
      }
    });
  }

  async initializeBot() {
    if (this.bot) {
      this.bot.quit();
    }

    try {
      await this.updateStatus({ status: 'connecting' });
      await this.addChatMessage({
        type: 'system',
        message: 'Connecting to mcfleet.net...'
      });

      this.bot = mineflayer.createBot({
        host: 'mcfleet.net',
        username: 'King97334',
        version: '1.21.4',
        auth: 'offline'
      });

      this.setupBotEvents();
    } catch (error) {
      console.error('Bot initialization error:', error);
      await this.updateStatus({ status: 'error' });
      await this.addChatMessage({
        type: 'error',
        message: `Failed to initialize bot: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  private setupBotEvents() {
    this.bot.on('login', async () => {
      this.uptimeStart = Date.now();
      await this.updateStatus({ status: 'online' });
      await this.addChatMessage({
        type: 'system',
        message: 'Bot connected successfully to mcfleet.net'
      });

      // Execute required commands in sequence
      setTimeout(() => this.executeInitialCommands(), 2000);
    });

    this.bot.on('message', async (message: any) => {
      const messageText = message.toString();
      console.log('Received message:', messageText);
      
      // Parse different message types
      let messageType: ChatMessageData['type'] = 'system';
      let username: string | undefined;
      
      // Simple message parsing - in production, you'd want more sophisticated parsing
      if (messageText.includes('<') && messageText.includes('>')) {
        // Player message format: <username> message
        const match = messageText.match(/<(.+?)>\s*(.+)/);
        if (match) {
          username = match[1];
          messageType = username === 'King97334' ? 'bot' : 'player';
        }
      }

      await this.addChatMessage({
        type: messageType,
        username,
        message: messageText
      });
    });

    this.bot.on('error', async (error: Error) => {
      console.error('Bot error:', error);
      await this.updateStatus({ status: 'error' });
      await this.addChatMessage({
        type: 'error',
        message: `Bot error: ${error.message}`
      });
    });

    this.bot.on('end', async () => {
      console.log('Bot disconnected');
      await this.updateStatus({ status: 'offline' });
      await this.addChatMessage({
        type: 'system',
        message: 'Bot disconnected - will attempt to reconnect in 60 seconds'
      });

      // Auto-reconnect after 1 minute
      this.reconnectTimer = setTimeout(() => {
        this.initializeBot();
      }, 60000);
    });

    this.bot.on('kicked', async (reason: string) => {
      console.log('Bot was kicked:', reason);
      await this.addChatMessage({
        type: 'error',
        message: `Bot was kicked: ${reason}`
      });
    });
  }

  private async executeInitialCommands() {
    const commands = [
      '/register 1234512345',
      '/login 1234512345',
      '/server survival-2'
    ];

    for (const command of commands) {
      try {
        await this.sendCommand(command);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between commands
      } catch (error) {
        console.error(`Failed to execute command ${command}:`, error);
      }
    }
  }

  async sendCommand(command: string): Promise<void> {
    if (!this.bot) {
      throw new Error('Bot not connected');
    }

    console.log('Sending command:', command);
    this.bot.chat(command);

    await this.addChatMessage({
      type: 'command',
      username: 'King97334',
      message: command
    });
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.bot) {
      throw new Error('Bot not connected');
    }

    this.bot.chat(message);
    await this.addChatMessage({
      type: 'bot',
      username: 'King97334',
      message
    });
  }

  async toggleAutoJump(): Promise<void> {
    const currentStatus = await storage.getBotStatus();
    const newAutoJump = !currentStatus?.autoJump;
    
    await this.updateStatus({ autoJump: newAutoJump });

    if (newAutoJump) {
      this.autoJumpInterval = setInterval(() => {
        if (this.bot && this.bot.entity) {
          this.bot.setControlState('jump', true);
          setTimeout(() => {
            if (this.bot) {
              this.bot.setControlState('jump', false);
            }
          }, 100);
        }
      }, 1000); // Jump every second
      
      await this.addChatMessage({
        type: 'system',
        message: 'Auto-jump enabled'
      });
    } else {
      if (this.autoJumpInterval) {
        clearInterval(this.autoJumpInterval);
        this.autoJumpInterval = null;
      }
      await this.addChatMessage({
        type: 'system',
        message: 'Auto-jump disabled'
      });
    }
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.autoJumpInterval) {
      clearInterval(this.autoJumpInterval);
      this.autoJumpInterval = null;
    }

    if (this.bot) {
      this.bot.quit();
      this.bot = null;
    }

    await this.updateStatus({ status: 'offline' });
  }

  async connect(): Promise<void> {
    await this.initializeBot();
  }
}
