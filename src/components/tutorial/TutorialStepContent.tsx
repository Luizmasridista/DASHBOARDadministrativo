
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TutorialStep } from "./tutorialSteps";

interface TutorialStepContentProps {
  step: TutorialStep;
}

const TutorialStepContent = ({ step }: TutorialStepContentProps) => {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {step.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground font-normal">{step.description}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step.content}
      </CardContent>
    </Card>
  );
};

export default TutorialStepContent;
