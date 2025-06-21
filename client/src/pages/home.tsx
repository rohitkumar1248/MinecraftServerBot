import { useQuery } from "@tanstack/react-query";
import { BotStatus } from "@/components/bot-status";
import { BotControls } from "@/components/bot-controls";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import { QuickCommands } from "@/components/quick-commands";
import { ServerIpConfig } from "@/components/server-ip-config";
import { useWebSocket } from "@/hooks/use-websocket";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Bot, Hash, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected, chatMessages, botStatus, sendCommand, clearMessages } = useWebSocket();

  const { data: onlineCount } = useQuery({
    queryKey: ['/api/bot/status'],
    refetchInterval: 30000, // Update every 30 seconds
  });

  const clearChatMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', '/api/chat/messages'),
    onSuccess: () => {
      clearMessages();
      toast({
        title: "Success",
        description: "Chat cleared",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to clear chat: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (message: string) => {
    sendCommand(message);
  };

  const handleQuickCommand = (command: string) => {
    sendCommand(command);
    toast({
      title: "Command Sent",
      description: command,
    });
  };

  const handleClearChat = () => {
    clearChatMutation.mutate();
  };

  const handleToggleJump = () => {
    // This will be handled by the BotControls component
  };

  return (
    <div className="flex h-screen bg-discord-background text-gray-300">
      {/* Sidebar */}
      <div className="w-80 bg-discord-surface border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-discord-primary rounded-lg flex items-center justify-center">
              <Bot className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">Bot Controller</h1>
              <p className="text-gray-400 text-sm">mcfleet.net</p>
            </div>
          </div>
        </div>

        <BotStatus status={botStatus} />
        <BotControls status={botStatus} onToggleJump={handleToggleJump} />
        <QuickCommands onCommand={handleQuickCommand} />
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-discord-surface border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Hash className="text-white text-xs" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Server Chat</h2>
                <p className="text-gray-400 text-sm">mcfleet.net - survival-2</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-2 text-sm text-gray-400">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <Users className="w-4 h-4" />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </span>
              <Button
                onClick={handleClearChat}
                variant="ghost"
                size="sm"
                disabled={clearChatMutation.isPending}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <ChatMessages messages={chatMessages} />
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={!isConnected || botStatus?.status !== 'online'}
        />
      </div>
    </div>
  );
}