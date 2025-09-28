import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from 'drizzle-orm';

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
  serverIp: text("server_ip").default("tbcraft.cbu.net:25569"),
  version: text("version").notNull(),
  uptime: integer("uptime").default(0), // seconds
  autoJump: boolean("auto_jump").default(false),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  ownerId: varchar("owner_id"), // User who owns this bot
});

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bot instances table - allows multiple bots per user
export const botInstances = pgTable("bot_instances", {
  id: serial("id").primaryKey(),
  ownerId: varchar("owner_id").notNull(),
  name: text("name").notNull(),
  username: text("username").notNull(),
  serverIp: text("server_ip").default("tbcraft.cbu.net:25569"),
  version: text("version").default("1.21.4"),
  status: text("status").default("offline"),
  autoJump: boolean("auto_jump").default(false),
  isActive: boolean("is_active").default(false), // Only one bot can be active per user
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertBotStatusSchema = createInsertSchema(botStatus).omit({
  id: true,
  lastSeen: true,
});

export const insertBotInstanceSchema = createInsertSchema(botInstances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type BotStatus = typeof botStatus.$inferSelect;
export type InsertBotStatus = z.infer<typeof insertBotStatusSchema>;
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type BotInstance = typeof botInstances.$inferSelect;
export type InsertBotInstance = z.infer<typeof insertBotInstanceSchema>;

// Type for real-time bot status updates
export type BotStatusData = {
  status: 'online' | 'offline' | 'connecting' | 'error';
  username: string;
  server?: string;
  serverIp?: string;
  version: string;
  uptime: number;
  autoJump: boolean;
  lastSeen: Date;
};

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
