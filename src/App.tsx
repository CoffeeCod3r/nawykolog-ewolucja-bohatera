import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Tournament from "./pages/Tournament";
import Rankings from "./pages/Rankings";
import Profile from "./pages/Profile";
import Shop from "./pages/Shop";
import Library from "./pages/Library";
import Tasks from "./pages/Tasks";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/logowanie" element={<Auth />} />
          <Route path="/rejestracja" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/turniej" element={<Tournament />} />
          <Route path="/rankingi" element={<Rankings />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/sklep" element={<Shop />} />
          <Route path="/biblioteka" element={<Library />} />
          <Route path="/zadania" element={<Tasks />} />
          <Route path="/ustawienia" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
