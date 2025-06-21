import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Play, Square, ArrowUp } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BotStatusData } from "@shared/schema";

interface BotControlsProps {
  status: BotStatusData | null;
  onToggleJump: () => void;
}

export function BotControls({ status, onToggleJump }: BotControlsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/bot/connect'),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bot connection initiated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bot/status'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to connect: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/bot/disconnect'),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bot disconnected",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bot/status'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to disconnect: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const toggleJumpMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/bot/toggle-jump'),
    onSuccess: () => {
      onToggleJump();
      queryClient.invalidateQueries({ queryKey: ['/api/bot/status'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to toggle auto-jump: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    connectMutation.mutate();
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  const handleToggleJump = () => {
    toggleJumpMutation.mutate();
  };

  return (
    <div className="p-4 border-b border-gray-700 space-y-3">
      <h3 className="text-white font-medium text-sm mb-3">Controls</h3>
      
      <Button 
        onClick={handleConnect}
        disabled={status?.status === 'online' || status?.status === 'connecting' || connectMutation.isPending}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <Play className="w-4 h-4" />
        <span>{connectMutation.isPending ? 'Connecting...' : 'Connect Bot'}</span>
      </Button>
      
      <Button 
        onClick={handleDisconnect}
        disabled={status?.status === 'offline' || disconnectMutation.isPending}
        variant="destructive"
        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <Square className="w-4 h-4" />
        <span>{disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect Bot'}</span>
      </Button>

      <div className="flex items-center justify-between bg-discord-darker rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <ArrowUp className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300 text-sm">Auto Jump</span>
        </div>
        <Switch
          checked={status?.autoJump || false}
          onCheckedChange={handleToggleJump}
          disabled={toggleJumpMutation.isPending}
        />
      </div>
    </div>
  );
}
