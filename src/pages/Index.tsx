
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import ConnectSheet from "@/components/ConnectSheet";
import Settings from "@/components/Settings";

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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border p-6">
          <h1 className="text-2xl font-semibold text-foreground">
            {activeSection === "dashboard" && "Painel Financeiro"}
            {activeSection === "connect" && "Conectar Planilha"}
            {activeSection === "settings" && "Configurações"}
          </h1>
        </header>
        
        <main className="flex-1 p-6 overflow-auto bg-background">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
