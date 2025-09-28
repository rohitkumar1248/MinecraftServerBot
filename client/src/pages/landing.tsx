import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Shield, Zap, Users, Server, MessageSquare } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: <Bot className="w-8 h-8 text-blue-500" />,
      title: "Minecraft Bot Control",
      description: "Fully control your Minecraft bots with an intuitive web interface"
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-green-500" />,
      title: "Real-time Chat",
      description: "Chat with other players through your bot in real-time"
    },
    {
      icon: <Server className="w-8 h-8 text-purple-500" />,
      title: "Multi-Server Support",
      description: "Connect to any Minecraft server with custom configurations"
    },
    {
      icon: <Users className="w-8 h-8 text-orange-500" />,
      title: "Multiple Bot Management",
      description: "Manage multiple bots with different usernames and servers"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Auto Features",
      description: "Enable auto-jump and other automation features"
    },
    {
      icon: <Shield className="w-8 h-8 text-red-500" />,
      title: "Secure Authentication",
      description: "Your bots and data are protected with secure authentication"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">Minecraft Bot Manager</h1>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              data-testid="login-button"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Control Your 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> Minecraft Bots</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Manage multiple Minecraft bots with random usernames, chat in real-time, 
              switch servers, and control everything from a beautiful web dashboard.
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg"
              data-testid="hero-login-button"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-300">Powerful features to manage your Minecraft bots effectively</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-center leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-gray-700">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start Managing Your Bots?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join now and get full access to the bot management dashboard
              </p>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg"
                data-testid="cta-login-button"
              >
                Sign In to Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center text-gray-400">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span>Minecraft Bot Manager</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}