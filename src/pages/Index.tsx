
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "@/components/Dashboard";
import ConnectSheet from "@/components/ConnectSheet";
import Settings from "@/components/Settings";
import { MobileHeader } from "@/components/MobileHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "connect":
        return <ConnectSheet />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case "dashboard":
        return "Painel Financeiro";
      case "connect":
        return "Conectar Planilha";
      case "settings":
        return "Configurações";
      default:
        return "Painel Financeiro";
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <SidebarInset className="flex-1">
          <MobileHeader title={getSectionTitle()} />
          <main className="flex-1 p-4 md:p-6 overflow-auto bg-background">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Bem-vindo, {user.email}</span>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sair
                </Button>
              </div>
            </div>
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
