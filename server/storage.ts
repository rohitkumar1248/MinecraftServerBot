import { chatMessages, botStatus, type ChatMessage, type InsertChatMessage, type BotStatus, type InsertBotStatus } from "@shared/schema";

export interface IStorage {
  // Chat message operations
  insertChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(limit?: number): Promise<ChatMessage[]>;
  clearChatMessages(): Promise<void>;
  
  // Bot status operations
  updateBotStatus(status: InsertBotStatus): Promise<BotStatus>;
  getBotStatus(): Promise<BotStatus | undefined>;
}

export class MemStorage implements IStorage {
  private chatMessages: Map<number, ChatMessage>;
  private botStatusData: BotStatus | undefined;
  private currentChatId: number;
  private currentStatusId: number;

  constructor() {
    this.chatMessages = new Map();
    this.currentChatId = 1;
    this.currentStatusId = 1;
    
    // Initialize default bot status
    this.botStatusData = {
      id: 1,
      status: 'offline',
      username: 'King97334',
      server: 'survival-2',
      version: '1.21.4',
      uptime: 0,
      autoJump: false,
      lastSeen: new Date(),
    };
  }

  async insertChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
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
    this.botStatusData = {
      id: this.currentStatusId,
      ...status,
      lastSeen: new Date(),
    };
    return this.botStatusData;
  }

  async getBotStatus(): Promise<BotStatus | undefined> {
    return this.botStatusData;
  }
}

export const storage = new MemStorage();
