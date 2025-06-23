
import { ThemeToggle } from "@/components/ThemeToggle";

export const AuthHeader = () => {
  return (
    <header className="relative z-20 p-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/d206fe24-569e-4a35-96a6-2a9262522005.png" 
            alt="Logo" 
            className="h-8 w-auto"
          />
          <span className="text-white font-bold text-xl">FinanceControl</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};
