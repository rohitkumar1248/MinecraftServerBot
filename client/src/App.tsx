import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./hooks/useAuth";
import { isUnauthorizedError } from "./lib/authUtils";
import Landing from "./pages/landing";
import Dashboard from "./pages/dashboard";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Handle authentication errors globally
  useEffect(() => {
    const handleQueryError = (event: any) => {
      if (event.type === 'error' && event.error && isUnauthorizedError(event.error)) {
        // Clear all cached data and redirect to login
        queryClient.clear();
        window.location.href = '/api/login';
      }
    };

    const handleMutationError = (event: any) => {
      if (event.type === 'error' && event.error && isUnauthorizedError(event.error)) {
        // Clear all cached data and redirect to login
        queryClient.clear();
        window.location.href = '/api/login';
      }
    };

    const unsubscribeQuery = queryClient.getQueryCache().subscribe(handleQueryError);
    const unsubscribeMutation = queryClient.getMutationCache().subscribe(handleMutationError);

    return () => {
      unsubscribeQuery();
      unsubscribeMutation();
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {isAuthenticated ? <Dashboard /> : <Landing />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
