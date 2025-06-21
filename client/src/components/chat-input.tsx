import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const commandSuggestions = ['/help', '/spawn', '/home', '/tpa', '/warp'];

  const insertCommand = (command: string) => {
    setMessage(command + ' ');
  };

  return (
    <div className="bg-discord-surface border-t border-gray-700 p-4">
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Type a message or command (use / for commands)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            className="w-full bg-discord-darker text-white placeholder-gray-500 px-4 py-3 rounded-lg border border-gray-600 focus:border-discord-primary focus:outline-none transition-colors duration-200 font-mono"
          />
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-discord-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </form>
      
      <div className="mt-2 flex flex-wrap gap-2">
        {commandSuggestions.map((cmd, index) => (
          <Button
            key={index}
            onClick={() => insertCommand(cmd)}
            variant="ghost"
            size="sm"
            className="bg-discord-darker hover:bg-gray-600 text-gray-300 px-3 py-1 rounded text-xs font-mono transition-colors duration-200"
          >
            {cmd}
          </Button>
        ))}
      </div>
    </div>
  );
}
