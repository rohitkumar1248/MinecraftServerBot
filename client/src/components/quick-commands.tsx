import { Button } from "@/components/ui/button";

interface QuickCommandsProps {
  onCommand: (command: string) => void;
}

export function QuickCommands({ onCommand }: QuickCommandsProps) {
  const quickCommands = [
    '/register 1234512345',
    '/login 1234512345',
    '/server survival-2',
    '/spawn',
    '/home',
    '/help'
  ];

  return (
    <div className="p-4 flex-1 overflow-y-auto">
      <h3 className="text-white font-medium text-sm mb-3">Quick Commands</h3>
      <div className="space-y-2">
        {quickCommands.map((command, index) => (
          <Button
            key={index}
            onClick={() => onCommand(command)}
            variant="ghost"
            className="w-full text-left bg-discord-darker hover:bg-gray-600 text-gray-300 py-2 px-3 rounded-lg text-sm transition-colors duration-200 font-mono justify-start"
          >
            {command}
          </Button>
        ))}
      </div>
    </div>
  );
}
