import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'player', 'bot', 'system', 'error', 'command'
  username: text("username"),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const botStatus = pgTable("bot_status", {
  id: serial("id").primaryKey(),
  status: text("status").notNull(), // 'online', 'offline', 'connecting', 'error'
  username: text("username").notNull(),
  server: text("server"),
  version: text("version").notNull(),
  uptime: integer("uptime").default(0), // seconds
  autoJump: boolean("auto_jump").default(false),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertBotStatusSchema = createInsertSchema(botStatus).omit({
  id: true,
  lastSeen: true,
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type BotStatus = typeof botStatus.$inferSelect;
export type InsertBotStatus = z.infer<typeof insertBotStatusSchema>;

// WebSocket message types
export interface WebSocketMessage {
  type: 'chat' | 'status' | 'command' | 'error';
  data: any;
}

export interface ChatMessageData {
  type: 'player' | 'bot' | 'system' | 'error' | 'command';
  username?: string;
  message: string;
  timestamp?: string;
}

export interface BotStatusData {
  status: 'online' | 'offline' | 'connecting' | 'error';
  username: string;
  server?: string;
  version: string;
  uptime: number;
  autoJump: boolean;
}

export interface CommandData {
  command: string;
  isQuickCommand?: boolean;
}
