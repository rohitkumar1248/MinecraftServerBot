import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Server, User, Bot, Terminal, AlertTriangle } from "lucide-react";
import type { ChatMessageData } from "@shared/schema";

interface ChatMessagesProps {
  messages: ChatMessageData[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <Server className="w-4 h-4 text-white" />;
      case 'player':
        return <User className="w-4 h-4 text-white" />;
      case 'bot':
        return <Bot className="w-4 h-4 text-white" />;
      case 'command':
        return <Terminal className="w-4 h-4 text-white" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-white" />;
      default:
        return <Server className="w-4 h-4 text-white" />;
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'system':
        return 'bg-yellow-500';
      case 'player':
        return 'bg-blue-500';
      case 'bot':
        return 'bg-discord-primary';
      case 'command':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getMessageTextColor = (type: string) => {
    switch (type) {
      case 'system':
        return 'text-yellow-400';
      case 'player':
        return 'text-blue-400';
      case 'bot':
        return 'text-discord-primary';
      case 'command':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return new Date().toLocaleTimeString('en-US', { hour12: false });
    return new Date(timestamp).toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No messages yet. Bot will appear here once connected.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="flex items-start space-x-3">
              <Avatar className={`w-8 h-8 ${getMessageColor(message.type)} flex items-center justify-center flex-shrink-0`}>
                <AvatarFallback className="bg-transparent">
                  {getMessageIcon(message.type)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`font-medium text-sm ${getMessageTextColor(message.type)}`}>
                    {message.type === 'system' ? 'System' :
                     message.type === 'error' ? 'Error' :
                     message.type === 'command' ? 'Command' :
                     message.username || 'Unknown'}
                  </span>
                  {message.type === 'bot' && (
                    <span className="bg-discord-primary text-white text-xs px-2 py-0.5 rounded">
                      BOT
                    </span>
                  )}
                  <span className="text-gray-500 text-xs">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <div className={`text-gray-300 text-sm ${
                  message.type === 'command' ? 'font-mono bg-discord-darker p-2 rounded border-l-4 border-green-500' :
                  message.type === 'error' ? 'bg-red-900/20 p-2 rounded border-l-4 border-red-500' :
                  ''
                }`}>
                  {message.message}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
