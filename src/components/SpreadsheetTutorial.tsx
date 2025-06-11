
import { useState } from "react";
import TutorialProgressIndicator from "./tutorial/TutorialProgressIndicator";
import TutorialStepContent from "./tutorial/TutorialStepContent";
import TutorialNavigation from "./tutorial/TutorialNavigation";
import { tutorialSteps } from "./tutorial/tutorialSteps";

const SpreadsheetTutorial = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNavigateToConnect = () => {
    window.dispatchEvent(new CustomEvent('navigateToConnect'));
  };

  return (
    <div className="space-y-6">
      <TutorialProgressIndicator 
        steps={tutorialSteps} 
        currentStep={currentStep} 
      />
      
      <TutorialStepContent 
        step={tutorialSteps[currentStep]} 
      />
      
      <TutorialNavigation
        currentStep={currentStep}
        totalSteps={tutorialSteps.length}
        onPrevious={prevStep}
        onNext={nextStep}
        onNavigateToConnect={handleNavigateToConnect}
      />
    </div>
  );
};

export default SpreadsheetTutorial;
