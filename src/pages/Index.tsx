import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "@/components/Dashboard";
import Settings from "@/components/Settings";
import { MobileHeader } from "@/components/MobileHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import ConnectSheetWithOAuth from "@/components/ConnectSheetWithOAuth";
import ConsolidatedView from "@/components/ConsolidatedView";
import { AnimatePresence, motion } from "framer-motion";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const handleNavigateToConnect = () => {
      console.log("Navigating to connect sheet section");
      setActiveSection("connect");
    };

    window.addEventListener('navigateToConnect', handleNavigateToConnect);

    return () => {
      window.removeEventListener('navigateToConnect', handleNavigateToConnect);
    };
  }, []);

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
        return <ConnectSheetWithOAuth />;
      case "settings":
        return <Settings />;
      case "consolidated":
        return <ConsolidatedView />;
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
      case "consolidated":
        return "Visão Consolidada";
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
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.35 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
