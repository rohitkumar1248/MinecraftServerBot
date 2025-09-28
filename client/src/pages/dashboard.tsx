import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import { 
  Bot, 
  Plus, 
  Play, 
  Square, 
  RotateCcw, 
  Server, 
  Users, 
  MessageSquare, 
  Settings,
  LogOut,
  Trash2
} from "lucide-react";
import { useState } from "react";
import type { User, BotInstance, BotStatusData } from "@shared/schema";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBotForm, setNewBotForm] = useState({
    name: '',
    username: '',
    serverIp: 'tbcraft.cbu.net:25569',
    version: '1.21.4'
  });

  const { isConnected, chatMessages, botStatus, sendCommand, clearMessages } = useWebSocket();

  // Fetch bot instances
  const { data: botInstances = [], isLoading: isLoadingBots } = useQuery<BotInstance[]>({
    queryKey: ['/api/bot/instances'],
    enabled: !!user,
  });

  // Create bot instance mutation
  const createBotMutation = useMutation({
    mutationFn: (botData: any) => apiRequest('POST', '/api/bot/instances', botData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bot/instances'] });
      setIsCreateDialogOpen(false);
      setNewBotForm({ name: '', username: '', serverIp: 'tbcraft.cbu.net:25569', version: '1.21.4' });
      toast({
        title: "Success",
        description: "Bot instance created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create bot: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Bot control mutations
  const connectMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/bot/connect'),
    onSuccess: () => {
      toast({ title: "Success", description: "Bot connected" });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/bot/disconnect'),
    onSuccess: () => {
      toast({ title: "Success", description: "Bot disconnected" });
    },
  });

  const regenerateNameMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/bot/regenerate-name'),
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: "New random username generated! Reconnect to use the new name." 
      });
    },
  });

  const toggleJumpMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/bot/toggle-jump'),
    onSuccess: () => {
      toast({ title: "Success", description: "Auto-jump toggled" });
    },
  });

  const updateServerMutation = useMutation({
    mutationFn: (serverIp: string) => apiRequest('POST', '/api/bot/update-ip', { serverIp }),
    onSuccess: () => {
      toast({ title: "Success", description: "Server updated" });
    },
  });

  const clearChatMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', '/api/chat/messages'),
    onSuccess: () => {
      clearMessages();
      toast({ title: "Success", description: "Chat cleared" });
    },
  });

  const generateRandomUsername = () => {
    const adjectives = ['Swift', 'Bold', 'Clever', 'Brave', 'Quick', 'Smart', 'Cool', 'Fast', 'Wild', 'Free'];
    const nouns = ['Player', 'Gamer', 'Builder', 'Miner', 'Crafter', 'Explorer', 'Hunter', 'Warrior', 'Hero', 'Legend'];
    const randomNum = Math.floor(Math.random() * 1000);
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adjective}${noun}${randomNum}`;
  };

  const handleSendMessage = (message: string) => {
    sendCommand(message);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">Bot Dashboard</h1>
                <p className="text-gray-400 text-sm">Welcome, {(user as User)?.firstName || 'User'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                isConnected ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                data-testid="logout-button"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="control" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="control" data-testid="control-tab">
              <Settings className="w-4 h-4 mr-2" />
              Bot Control
            </TabsTrigger>
            <TabsTrigger value="chat" data-testid="chat-tab">
              <MessageSquare className="w-4 h-4 mr-2" />
              Live Chat
            </TabsTrigger>
            <TabsTrigger value="manage" data-testid="manage-tab">
              <Users className="w-4 h-4 mr-2" />
              Bot Management
            </TabsTrigger>
          </TabsList>

          {/* Bot Control Tab */}
          <TabsContent value="control" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Bot Status */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="w-5 h-5" />
                    <span>Current Bot Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge variant={botStatus?.status === 'online' ? 'default' : 'secondary'}>
                        {botStatus?.status || 'offline'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Username:</span>
                      <span className="text-white">{botStatus?.username || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Server:</span>
                      <span className="text-white">{(botStatus as BotStatusData)?.server || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Auto-Jump:</span>
                      <Badge variant={botStatus?.autoJump ? 'default' : 'secondary'}>
                        {botStatus?.autoJump ? 'On' : 'Off'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bot Controls */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Quick Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => connectMutation.mutate()}
                      disabled={connectMutation.isPending || botStatus?.status === 'online'}
                      className="bg-green-700 hover:bg-green-600"
                      data-testid="connect-button"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                    <Button 
                      onClick={() => disconnectMutation.mutate()}
                      disabled={disconnectMutation.isPending || botStatus?.status === 'offline'}
                      variant="destructive"
                      data-testid="disconnect-button"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                    <Button 
                      onClick={() => regenerateNameMutation.mutate()}
                      disabled={regenerateNameMutation.isPending}
                      variant="outline"
                      data-testid="regenerate-name-button"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      New Username
                    </Button>
                    <Button 
                      onClick={() => toggleJumpMutation.mutate()}
                      disabled={toggleJumpMutation.isPending}
                      variant="outline"
                      data-testid="toggle-jump-button"
                    >
                      Auto-Jump
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Server Configuration */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="w-5 h-5" />
                  <span>Server Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="serverIp" className="text-gray-300">Server IP</Label>
                    <Input 
                      id="serverIp"
                      defaultValue="tbcraft.cbu.net:25569"
                      className="bg-gray-700 border-gray-600 text-white"
                      data-testid="server-ip-input"
                    />
                  </div>
                  <Button 
                    onClick={() => {
                      const serverIp = (document.getElementById('serverIp') as HTMLInputElement)?.value;
                      if (serverIp) updateServerMutation.mutate(serverIp);
                    }}
                    disabled={updateServerMutation.isPending}
                    className="self-end"
                    data-testid="update-server-button"
                  >
                    Update Server
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Live Server Chat</span>
                </CardTitle>
                <Button
                  onClick={() => clearChatMutation.mutate()}
                  variant="ghost"
                  size="sm"
                  disabled={clearChatMutation.isPending}
                  data-testid="clear-chat-button"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 flex flex-col">
                  <div className="flex-1 overflow-hidden">
                    <ChatMessages messages={chatMessages} />
                  </div>
                  <div className="border-t border-gray-700 p-4">
                    <ChatInput 
                      onSendMessage={handleSendMessage}
                      disabled={!isConnected || botStatus?.status !== 'online'}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bot Management Tab */}
          <TabsContent value="manage" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Your Bot Instances</h2>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                    data-testid="create-bot-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Bot
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Create New Bot Instance</DialogTitle>
                    <DialogDescription className="text-gray-300">
                      Configure your new Minecraft bot instance
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="botName">Bot Name</Label>
                      <Input 
                        id="botName"
                        value={newBotForm.name}
                        onChange={(e) => setNewBotForm({...newBotForm, name: e.target.value})}
                        placeholder="My Awesome Bot"
                        className="bg-gray-700 border-gray-600"
                        data-testid="bot-name-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="botUsername">Username</Label>
                      <div className="flex space-x-2">
                        <Input 
                          id="botUsername"
                          value={newBotForm.username}
                          onChange={(e) => setNewBotForm({...newBotForm, username: e.target.value})}
                          placeholder="CoolPlayer123"
                          className="bg-gray-700 border-gray-600 flex-1"
                          data-testid="bot-username-input"
                        />
                        <Button 
                          onClick={() => setNewBotForm({...newBotForm, username: generateRandomUsername()})}
                          variant="outline"
                          data-testid="random-username-button"
                        >
                          Random
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="botServerIp">Server IP</Label>
                      <Input 
                        id="botServerIp"
                        value={newBotForm.serverIp}
                        onChange={(e) => setNewBotForm({...newBotForm, serverIp: e.target.value})}
                        className="bg-gray-700 border-gray-600"
                        data-testid="bot-server-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="botVersion">Minecraft Version</Label>
                      <Input 
                        id="botVersion"
                        value={newBotForm.version}
                        onChange={(e) => setNewBotForm({...newBotForm, version: e.target.value})}
                        className="bg-gray-700 border-gray-600"
                        data-testid="bot-version-input"
                      />
                    </div>
                    <Button 
                      onClick={() => createBotMutation.mutate(newBotForm)}
                      disabled={createBotMutation.isPending}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                      data-testid="create-bot-submit"
                    >
                      Create Bot
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(botInstances as BotInstance[]).map((bot: BotInstance) => (
                <Card key={bot.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{bot.name}</span>
                      <Badge variant={bot.isActive ? 'default' : 'secondary'}>
                        {bot.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {bot.username}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Server:</span>
                        <span>{bot.serverIp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Version:</span>
                        <span>{bot.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <Badge variant={bot.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                          {bot.status}
                        </Badge>
                      </div>
                    </div>
                    {!bot.isActive && (
                      <Button 
                        className="w-full mt-4" 
                        size="sm"
                        data-testid={`activate-bot-${bot.id}`}
                      >
                        Activate Bot
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {(botInstances as BotInstance[]).length === 0 && !isLoadingBots && (
                <div className="col-span-full text-center py-12">
                  <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Bots Yet</h3>
                  <p className="text-gray-500 mb-4">Create your first bot instance to get started</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}