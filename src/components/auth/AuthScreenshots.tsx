
import { TrendingUp, Sparkles, Brain, CheckCircle } from "lucide-react";
import { softwareScreenshots } from "@/constants/authData";
import { useResponsive } from "@/hooks/useResponsive";
import { ScreenshotHeader } from "./ScreenshotHeader";
import { ScreenshotCard } from "./ScreenshotCard";
import { FinalCTA } from "./FinalCTA";

export const AuthScreenshots = () => {
  const { isMobile, isTablet } = useResponsive();

  const getIconForIndex = (index: number) => {
    switch (index) {
      case 0: return TrendingUp;
      case 1: return Sparkles;
      case 2: return Brain;
      default: return CheckCircle;
    }
  };

  const getGradientForIndex = (index: number) => {
    switch (index) {
      case 0: return "from-emerald-500 via-blue-500 to-purple-500";
      case 1: return "from-blue-500 via-purple-500 to-pink-500";
      case 2: return "from-purple-500 via-pink-500 to-rose-500";
      default: return "from-blue-500 via-purple-500 to-pink-500";
    }
  };

  return (
    <section className="relative z-10 py-16 md:py-24 lg:py-32 px-4 md:px-6 bg-gradient-to-b from-slate-800/20 to-slate-900/60 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/10 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto relative">
        <ScreenshotHeader />

        {/* Screenshots Grid */}
        <div className="grid gap-8 lg:gap-12">
          {softwareScreenshots.map((screenshot, index) => {
            const IconComponent = getIconForIndex(index);
            const gradientClass = getGradientForIndex(index);
            
            return (
              <ScreenshotCard
                key={index}
                screenshot={screenshot}
                index={index}
                IconComponent={IconComponent}
                gradientClass={gradientClass}
              />
            );
          })}
        </div>

        <FinalCTA />
      </div>
    </section>
  );
};
