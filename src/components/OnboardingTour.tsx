
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

const steps = [
  { 
    selector: "[data-tour='upload-btn']", 
    title: "Step 1: Upload Documents", 
    desc: "Start by uploading your policy documents, contracts, or knowledge base files here." 
  },
  { 
    selector: "[data-tour='train-btn']", 
    title: "Step 2: Train Your AI", 
    desc: "Click 'Process Documents' to index and train your AI assistant with the uploaded content." 
  },
  { 
    selector: "[data-tour='chat-input']", 
    title: "Step 3: Ask Questions", 
    desc: "Now you can ask any questions about your documents and get instant, accurate answers." 
  },
  {
    selector: "[data-tour='workflows']",
    title: "Step 4: Automate Workflows", 
    desc: "Set up automated workflows to process documents and handle routine tasks."
  }
];

export default function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!localStorage.getItem("onboardingTourSeen")) {
      setTimeout(() => setActive(true), 1000); // Delay to ensure DOM is ready
    }
  }, []);

  useEffect(() => {
    if (active && steps[step]) {
      const target = document.querySelector(steps[step].selector);
      if (target) {
        const rect = target.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 10,
          left: Math.min(rect.left + window.scrollX, window.innerWidth - 350)
        });
      }
    }
  }, [step, active]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      finishTour();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const finishTour = () => {
    setActive(false);
    localStorage.setItem("onboardingTourSeen", "1");
  };

  if (!active || !steps[step]) return null;

  const currentStep = steps[step];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[100]" />
      
      {/* Tour Card */}
      <Card 
        className="fixed z-[101] w-80 shadow-xl"
        style={{ 
          top: `${position.top}px`, 
          left: `${position.left}px` 
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{currentStep.title}</CardTitle>
            <Button variant="ghost" size="sm" onClick={finishTour}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {currentStep.desc}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i === step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={finishTour}>
                Skip
              </Button>
              {step > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrev}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {step === steps.length - 1 ? 'Finish' : 'Next'}
                {step < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
