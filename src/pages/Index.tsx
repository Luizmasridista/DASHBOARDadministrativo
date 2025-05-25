
import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "@/components/Dashboard";
import ConnectSheet from "@/components/ConnectSheet";
import Settings from "@/components/Settings";
import { MobileHeader } from "@/components/MobileHeader";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

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
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
