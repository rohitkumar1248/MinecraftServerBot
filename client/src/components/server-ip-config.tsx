
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ServerIpConfigProps {
  currentIp: string;
  onIpUpdate: () => void;
}

export function ServerIpConfig({ currentIp, onIpUpdate }: ServerIpConfigProps) {
  const [newIp, setNewIp] = useState(currentIp);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdateIp = async () => {
    if (!newIp.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid server IP",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch("/api/bot/update-ip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ serverIp: newIp.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update server IP");
      }

      toast({
        title: "Success",
        description: "Server IP updated successfully",
      });
      
      onIpUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update server IP",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server Configuration</CardTitle>
        <CardDescription>
          Change the Minecraft server IP address
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="server-ip">Server IP</Label>
          <Input
            id="server-ip"
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            placeholder="Enter server IP (e.g., survival-2.minehut.gg)"
            disabled={isUpdating}
          />
        </div>
        <Button 
          onClick={handleUpdateIp} 
          disabled={isUpdating || newIp === currentIp}
          className="w-full"
        >
          {isUpdating ? "Updating..." : "Update Server IP"}
        </Button>
      </CardContent>
    </Card>
  );
}
