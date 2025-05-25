
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useResponsive } from "@/hooks/useResponsive";
import { ThemeToggle } from "./ThemeToggle";

interface MobileHeaderProps {
  title: string;
}

export function MobileHeader({ title }: MobileHeaderProps) {
  const { isMobile } = useResponsive();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-lg md:text-2xl font-semibold text-foreground">
            {title}
          </h1>
        </div>
        <div className="md:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
