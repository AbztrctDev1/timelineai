import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { TimelineProvider } from "./contexts/TimelineContext";
import Dashboard from "@/pages/Dashboard";
import TimelineView from "@/pages/TimelineView";
import CreateMemory from "@/pages/CreateMemory";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TimelineProvider>
          <BrowserRouter>
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                <AppSidebar />
                <SidebarInset className="flex-1 w-full min-w-0">
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/timeline/:id" element={<TimelineView />} />
                    <Route path="/create-memory/:timelineId?" element={<CreateMemory />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </TimelineProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;