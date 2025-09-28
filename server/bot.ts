import { createBot, Bot } from 'mineflayer';
import { storage } from './storage';
import type { InsertChatMessage, InsertBotStatus } from '@shared/schema';
import { WebSocket } from 'ws';
import type { ChatMessageData, BotStatusData, WebSocketMessage } from '@shared/schema';

export class MinecraftBot {
  private bot: Bot | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private uptimeStart: number = 0;
  private autoJumpInterval: NodeJS.Timeout | null = null;
  private webSocketClients: Set<WebSocket> = new Set();

  constructor() {
    this.initializeBot();
  }

  addWebSocketClient(ws: WebSocket): void {
    this.webSocketClients.add(ws);
    ws.on('close', () => {
      this.webSocketClients.delete(ws);
    });
  }

  private broadcastToClients(message: any): void {
    const messageStr = JSON.stringify(message);
    this.webSocketClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  private async addChatMessage(message: InsertChatMessage): Promise<void> {
    const chatMessage = await storage.insertChatMessage(message);
    this.broadcastToClients({
      type: 'chat',
      data: {
        type: chatMessage.type,
        username: chatMessage.username,
        message: chatMessage.message,
        timestamp: chatMessage.timestamp.toISOString()
      }
    });
  }

  private async updateStatus(status: Partial<InsertBotStatus>): Promise<void> {
    const currentStatus = await storage.getBotStatus();
    const uptime = this.uptimeStart ? Math.floor((Date.now() - this.uptimeStart) / 1000) : 0;

    const newStatus = await storage.updateBotStatus({
      status: currentStatus?.status || 'offline',
      username: currentStatus?.username || 'King97334',
      server: currentStatus?.server || 'survival-2',
      serverIp: currentStatus?.serverIp || 'tbcraft.cbu.net:25569',
      version: currentStatus?.version || '1.21.4',
      uptime: uptime,
      autoJump: currentStatus?.autoJump || false,
      ...status
    });

    this.broadcastToClients({
      type: 'status',
      data: newStatus
    });
  }

  private async initializeBot(): Promise<void> {
    if (this.bot) {
      this.bot.quit();
    }

    try {
      await this.updateStatus({ status: 'connecting' });
      await this.addChatMessage({
        type: 'system',
        message: 'Connecting to tbcraft.cbu.net:25569...'
      });

      this.bot = createBot({
        host: 'tbcraft.cbu.net',
        port: 25569,
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

  private setupBotEvents(): void {
    if (!this.bot) return;

    this.bot.on('login', async () => {
      this.uptimeStart = Date.now();
      console.log('Bot connected to Minecraft server');
      await this.updateStatus({ 
        status: 'online',
        uptime: 0
      });
      await this.addChatMessage({
        type: 'system',
        message: 'Bot connected successfully to tbcraft.cbu.net:25569'
      });

      // Execute required commands in sequence
      setTimeout(() => this.executeInitialCommands(), 2000);
    });

    this.bot.on('chat', async (username, message) => {
      await this.addChatMessage({
        type: 'player',
        username,
        message
      });
    });

    this.bot.on('message', async (message: any) => {
      const messageText = message.toString();
      console.log('Received message:', messageText);

      // Parse different message types
      let messageType: 'system' | 'player' | 'bot' | 'error' | 'command' = 'system';
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

    this.bot.on('error', async (err) => {
      console.error('Bot error:', err);
      await this.addChatMessage({
        type: 'error',
        message: `Bot error: ${err.message}`
      });
      await this.updateStatus({ status: 'error' });
    });

    this.bot.on('end', async () => {
      console.log('Bot disconnected');
      await this.updateStatus({ status: 'offline' });
      await this.addChatMessage({
        type: 'system',
        message: 'Bot disconnected - will attempt to reconnect in 60 seconds'
      });
      this.bot = null;

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

  private async executeInitialCommands(): Promise<void> {
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

  async sendMessage(message: string): Promise<void> {
    if (this.bot && this.bot.entity) {
      this.bot.chat(message);
      await this.addChatMessage({
        type: 'bot',
        username: this.bot.username,
        message
      });
    }
  }

  async sendCommand(command: string): Promise<void> {
    if (this.bot && this.bot.entity) {
      console.log('Sending command:', command);
      this.bot.chat(command);
      await this.addChatMessage({
        type: 'command',
        username: this.bot.username,
        message: command
      });
    }
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
      }, 1000);

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

  async updateServerIp(serverIp: string): Promise<void> {
    // Disconnect if currently connected
    if (this.bot) {
      await this.disconnect();
    }

    // Update the server IP in storage
    await this.updateStatus({ serverIp });

    await this.addChatMessage({
      type: 'system',
      message: `Server IP updated to: ${serverIp}`
    });
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