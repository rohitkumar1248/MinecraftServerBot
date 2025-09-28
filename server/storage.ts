import { chatMessages, botStatus, botInstances, users, type ChatMessage, type InsertChatMessage, type BotStatus, type InsertBotStatus, type User, type UpsertUser, type BotInstance, type InsertBotInstance } from "@shared/schema";

export interface IStorage {
  // Chat message operations
  insertChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(limit?: number): Promise<ChatMessage[]>;
  clearChatMessages(): Promise<void>;
  
  // Bot status operations
  updateBotStatus(status: InsertBotStatus): Promise<BotStatus>;
  getBotStatus(): Promise<BotStatus | undefined>;

  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Bot instance operations
  createBotInstance(botInstance: InsertBotInstance): Promise<BotInstance>;
  getUserBotInstances(userId: string): Promise<BotInstance[]>;
  updateBotInstance(id: number, botInstance: Partial<InsertBotInstance>): Promise<BotInstance>;
  deleteBotInstance(id: number): Promise<void>;
  setActiveBotInstance(userId: string, botId: number): Promise<void>;
  getActiveBotInstance(userId: string): Promise<BotInstance | undefined>;
}

export class MemStorage implements IStorage {
  private chatMessages: Map<number, ChatMessage>;
  private botStatusData: BotStatus | undefined;
  private currentChatId: number;
  private currentStatusId: number;
  private users: Map<string, User>;
  private botInstances: Map<number, BotInstance>;
  private currentBotInstanceId: number;

  constructor() {
    this.chatMessages = new Map();
    this.currentChatId = 1;
    this.currentStatusId = 1;
    this.users = new Map();
    this.botInstances = new Map();
    this.currentBotInstanceId = 1;
    
    // Initialize default bot status
    this.botStatusData = {
      id: 1,
      status: 'offline',
      username: 'CoolMiner123',
      server: 'survival-2',
      serverIp: 'tbcraft.cbu.net:25569',
      version: '1.21.4',
      uptime: 0,
      autoJump: false,
      lastSeen: new Date(),
      ownerId: null,
    };
  }

  async insertChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const message: ChatMessage = {
      id,
      type: insertMessage.type,
      username: insertMessage.username || null,
      message: insertMessage.message,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(limit = 100): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return messages.slice(-limit);
  }

  async clearChatMessages(): Promise<void> {
    this.chatMessages.clear();
  }

  async updateBotStatus(status: InsertBotStatus): Promise<BotStatus> {
    const currentData = this.botStatusData || {
      id: this.currentStatusId,
      status: 'offline',
      username: 'CoolMiner123',
      server: null,
      serverIp: 'tbcraft.cbu.net:25569',
      version: '1.21.4',
      uptime: 0,
      autoJump: false,
      lastSeen: new Date(),
      ownerId: null,
    };
    
    this.botStatusData = {
      ...currentData,
      ...status,
      server: status.server || null,
      serverIp: status.serverIp || null,
      version: status.version || '1.21.4',
      uptime: status.uptime || 0,
      autoJump: status.autoJump || false,
      lastSeen: new Date(),
      ownerId: status.ownerId || null,
    };
    return this.botStatusData;
  }

  async getBotStatus(): Promise<BotStatus | undefined> {
    return this.botStatusData;
  }

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      id: userData.id!,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Bot instance operations
  async createBotInstance(botInstanceData: InsertBotInstance): Promise<BotInstance> {
    const id = this.currentBotInstanceId++;
    const botInstance: BotInstance = {
      id,
      ownerId: botInstanceData.ownerId,
      name: botInstanceData.name,
      username: botInstanceData.username,
      serverIp: botInstanceData.serverIp || null,
      version: botInstanceData.version || null,
      status: botInstanceData.status || null,
      autoJump: botInstanceData.autoJump || null,
      isActive: botInstanceData.isActive || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.botInstances.set(id, botInstance);
    return botInstance;
  }

  async getUserBotInstances(userId: string): Promise<BotInstance[]> {
    return Array.from(this.botInstances.values())
      .filter(bot => bot.ownerId === userId);
  }

  async updateBotInstance(id: number, botInstanceData: Partial<InsertBotInstance>): Promise<BotInstance> {
    const existingBot = this.botInstances.get(id);
    if (!existingBot) {
      throw new Error('Bot instance not found');
    }
    const updatedBot: BotInstance = {
      ...existingBot,
      ...botInstanceData,
      updatedAt: new Date(),
    };
    this.botInstances.set(id, updatedBot);
    return updatedBot;
  }

  async deleteBotInstance(id: number): Promise<void> {
    this.botInstances.delete(id);
  }

  async setActiveBotInstance(userId: string, botId: number): Promise<void> {
    // Deactivate all user's bots
    const instances = Array.from(this.botInstances.entries());
    for (const [id, bot] of instances) {
      if (bot.ownerId === userId) {
        this.botInstances.set(id, { ...bot, isActive: bot.id === botId, updatedAt: new Date() });
      }
    }
  }

  async getActiveBotInstance(userId: string): Promise<BotInstance | undefined> {
    return Array.from(this.botInstances.values())
      .find(bot => bot.ownerId === userId && bot.isActive);
  }
}

export const storage = new MemStorage();
