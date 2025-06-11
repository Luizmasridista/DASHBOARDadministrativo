
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";

interface TutorialNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onNavigateToConnect: () => void;
}

const TutorialNavigation = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onNavigateToConnect
}: TutorialNavigationProps) => {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0}
        className="flex items-center space-x-2"
      >
        <span>Anterior</span>
      </Button>
      
      <div className="flex space-x-2">
        {isLastStep ? (
          <Button
            onClick={onNavigateToConnect}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
          >
            <span>Ir para Conectar Planilha</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="flex items-center space-x-2"
          >
            <span>Próximo</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TutorialNavigation;
