
import { CheckCircle } from "lucide-react";
import { TutorialStep } from "./tutorialSteps";

interface TutorialProgressIndicatorProps {
  steps: TutorialStep[];
  currentStep: number;
}

const TutorialProgressIndicator = ({ steps, currentStep }: TutorialProgressIndicatorProps) => {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              index <= currentStep
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted text-muted-foreground"
            }`}
          >
            {index < currentStep ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-2 ${
                index < currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default TutorialProgressIndicator;
