import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { MinecraftBot } from "./bot";
import type { WebSocketMessage, CommandData } from "@shared/schema";

let minecraftBot: MinecraftBot;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Minecraft bot
  minecraftBot = new MinecraftBot();

  // API Routes
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.delete("/api/chat/messages", async (req, res) => {
    try {
      await storage.clearChatMessages();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear messages" });
    }
  });

  app.get("/api/bot/status", async (req, res) => {
    try {
      const status = await storage.getBotStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot status" });
    }
  });

  app.post("/api/bot/connect", async (req, res) => {
    try {
      await minecraftBot.connect();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to connect bot" });
    }
  });

  app.post("/api/bot/disconnect", async (req, res) => {
    try {
      await minecraftBot.disconnect();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to disconnect bot" });
    }
  });

  app.post("/api/bot/toggle-jump", async (req, res) => {
    try {
      await minecraftBot.toggleAutoJump();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle auto-jump" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket Server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    // Add client to bot's broadcast list
    minecraftBot.addWebSocketClient(ws);

    // Send current bot status and recent messages
    storage.getBotStatus().then(status => {
      if (status) {
        ws.send(JSON.stringify({
          type: 'status',
          data: status
        }));
      }
    });

    storage.getChatMessages(50).then(messages => {
      messages.forEach(message => {
        ws.send(JSON.stringify({
          type: 'chat',
          data: {
            type: message.type,
            username: message.username,
            message: message.message,
            timestamp: message.timestamp.toISOString()
          }
        }));
      });
    });

    ws.on('message', async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'command':
            const commandData = message.data as CommandData;
            if (commandData.command.startsWith('/')) {
              await minecraftBot.sendCommand(commandData.command);
            } else {
              await minecraftBot.sendMessage(commandData.command);
            }
            break;
            
          default:
            console.log('Unknown WebSocket message type:', message.type);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Invalid message format' }
        }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
