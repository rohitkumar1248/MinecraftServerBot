import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { MinecraftBot } from "./bot";
import { setupAuth, isAuthenticated } from "./replitAuth";
import type { WebSocketMessage, CommandData } from "@shared/schema";

// Map to store bot instances per user
const userBots = new Map<string, MinecraftBot>();

// Get or create bot for user
function getUserBot(userId: string): MinecraftBot {
  if (!userBots.has(userId)) {
    userBots.set(userId, new MinecraftBot());
  }
  return userBots.get(userId)!;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth routes - now returns default user for direct bot control
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Return a default user for direct access
      const defaultUser = {
        id: 'default_user',
        email: 'bot@controller.local',
        firstName: 'Bot',
        lastName: 'Controller'
      };
      res.json(defaultUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // API Routes - removed authentication requirements for direct access
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

  app.get("/api/bot/status", async (req: any, res) => {
    try {
      const userId = 'default_user';
      const userBot = getUserBot(userId);
      const status = await storage.getBotStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot status" });
    }
  });

  // Bot instance management
  app.get("/api/bot/instances", async (req: any, res) => {
    try {
      const userId = 'default_user';
      const instances = await storage.getUserBotInstances(userId);
      res.json(instances);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot instances" });
    }
  });

  app.post("/api/bot/instances", async (req: any, res) => {
    try {
      const userId = 'default_user';
      const { name, username, serverIp, version } = req.body;
      
      const botInstance = await storage.createBotInstance({
        ownerId: userId,
        name: name || `Bot ${Date.now()}`,
        username: username || `Player${Math.floor(Math.random() * 1000)}`,
        serverIp: serverIp || "tbcraft.cbu.net:25569",
        version: version || "1.21.4",
        status: "offline",
        autoJump: false,
        isActive: false,
      });
      
      res.json(botInstance);
    } catch (error) {
      res.status(500).json({ error: "Failed to create bot instance" });
    }
  });

  app.put("/api/bot/instances/:id/activate", async (req: any, res) => {
    try {
      const userId = 'default_user';
      const botId = parseInt(req.params.id);
      
      await storage.setActiveBotInstance(userId, botId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to activate bot instance" });
    }
  });

  app.post("/api/bot/connect", async (req: any, res) => {
    try {
      const userId = 'default_user';
      const userBot = getUserBot(userId);
      await userBot.connect();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to connect bot" });
    }
  });

  app.post("/api/bot/disconnect", async (req: any, res) => {
    try {
      const userId = 'default_user';
      const userBot = getUserBot(userId);
      await userBot.disconnect();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to disconnect bot" });
    }
  });

  app.post("/api/bot/toggle-jump", async (req: any, res) => {
    try {
      const userId = 'default_user';
      const userBot = getUserBot(userId);
      await userBot.toggleAutoJump();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle auto-jump" });
    }
  });

  app.post("/api/bot/update-ip", async (req: any, res) => {
    try {
      const userId = 'default_user';
      const { serverIp } = req.body;
      if (!serverIp) {
        return res.status(400).json({ error: "Server IP is required" });
      }
      const userBot = getUserBot(userId);
      await userBot.updateServerIp(serverIp);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update server IP" });
    }
  });

  app.post("/api/bot/regenerate-name", async (req: any, res) => {
    try {
      const userId = 'default_user';
      const userBot = getUserBot(userId);
      // Disconnect current bot
      await userBot.disconnect();
      // Create a new bot instance with random name
      userBots.set(userId, new MinecraftBot());
      res.json({ success: true, message: "New random username generated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to regenerate bot name" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket Server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req: any) => {
    console.log('WebSocket client connected');
    
    // Note: In a real implementation, you'd verify the user's session here
    // For now, we'll use a default bot or create one based on query params

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
        
        // In a real implementation, extract userId from authenticated session
        // For now, we'll use a default user or handle it differently
        const userId = 'default_user'; // This should be extracted from authenticated session
        const userBot = getUserBot(userId);
        userBot.addWebSocketClient(ws);
        
        switch (message.type) {
          case 'command':
            const commandData = message.data as CommandData;
            if (commandData.command.startsWith('/')) {
              await userBot.sendCommand(commandData.command);
            } else {
              await userBot.sendMessage(commandData.command);
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
