import { useEffect, useRef, useState } from 'react';
import type { WebSocketMessage, ChatMessageData, BotStatusData } from '@shared/schema';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageData[]>([]);
  const [botStatuses, setBotStatuses] = useState<BotStatusData[]>([]);
  const [botStatus, setBotStatus] = useState<BotStatusData | null>(null); // Keep for backward compatibility
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'chat':
            const chatData = message.data as ChatMessageData;
            setChatMessages(prev => [...prev, chatData]);
            break;
            
          case 'status':
            const statusData = message.data as BotStatusData | BotStatusData[];
            if (Array.isArray(statusData)) {
              setBotStatuses(statusData);
              // Set the first online bot as the primary status for backward compatibility
              const primaryBot = statusData.find(bot => bot.status === 'online') || statusData[0];
              setBotStatus(primaryBot || null);
            } else {
              setBotStatus(statusData);
              // Update the bot in the statuses array or add it
              setBotStatuses(prev => {
                const existingIndex = prev.findIndex(bot => bot.username === statusData.username);
                if (existingIndex >= 0) {
                  const updated = [...prev];
                  updated[existingIndex] = statusData;
                  return updated;
                } else {
                  return [...prev, statusData];
                }
              });
            }
            break;
            
          case 'error':
            console.error('WebSocket error:', message.data);
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          // Trigger re-mount of the hook to reconnect
          window.location.reload();
        }
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const sendCommand = (command: string) => {
    sendMessage({
      type: 'command',
      data: { command }
    });
  };

  const clearMessages = () => {
    setChatMessages([]);
  };

  return {
    isConnected,
    chatMessages,
    botStatus,
    botStatuses,
    sendCommand,
    clearMessages
  };
}
