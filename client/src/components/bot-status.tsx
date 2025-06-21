import { Card } from "@/components/ui/card";
import type { BotStatusData } from "@shared/schema";

interface BotStatusProps {
  status: BotStatusData | null;
}

export function BotStatus({ status }: BotStatusProps) {
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'connecting': return 'Connecting';
      case 'offline': return 'Offline';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="p-4 border-b border-gray-700">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm font-medium">Bot Status</span>
          <span className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(status?.status || 'offline')} ${status?.status === 'online' ? 'animate-pulse' : ''}`}></div>
            <span className={`text-sm font-medium ${status?.status === 'online' ? 'text-green-400' : status?.status === 'error' ? 'text-red-400' : 'text-gray-400'}`}>
              {getStatusText(status?.status || 'offline')}
            </span>
          </span>
        </div>

        <div className="bg-discord-darker rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Username:</span>
            <span className="text-white font-mono">{status?.username || 'King97334'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Server:</span>
            <span className="text-white font-mono">{status?.server || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Server IP:</span>
            <span className="text-white font-mono">{status?.serverIp || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Version:</span>
            <span className="text-white font-mono">{status?.version || '1.21.4'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Uptime:</span>
            <span className="text-white font-mono">{formatUptime(status?.uptime || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}