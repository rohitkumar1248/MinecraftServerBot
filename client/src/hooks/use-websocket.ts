import { useEffect, useRef, useState } from 'react';
import type { WebSocketMessage, ChatMessageData, BotStatusData } from '@shared/schema';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageData[]>([]);
  const [botStatus, setBotStatus] = useState<BotStatusData | null>(null);
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
            const statusData = message.data as BotStatusData;
            setBotStatus(statusData);
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
    sendCommand,
    clearMessages
  };
}
