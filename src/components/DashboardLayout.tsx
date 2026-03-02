import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <SidebarProvider>
          <div className="min-h-[calc(100vh-4rem)] flex w-full">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col">
              <header className="h-12 flex items-center border-b border-border/30 px-4">
                <SidebarTrigger />
              </header>
              <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default DashboardLayout;
