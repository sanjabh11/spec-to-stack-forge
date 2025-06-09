import React from 'react';
import { cn } from '@/lib/utils';

/**
 * StepperProps defines the props for the Stepper component.
 * @param steps - Array of step labels (string[])
 * @param currentStep - Index of the current step (number)
 * @param onStepClick - Optional callback when a step is clicked (stepIdx: number) => void
 * @param className - Optional additional className for the container
 */
export interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (stepIdx: number) => void;
  className?: string;
}

/**
 * Always-visible, small font, minimal horizontal stepper for workflow navigation.
 * Modular, does not modify any global CSS or UI. Sticky at the top by default.
 * Version 1.0
 */
export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick, className }) => {
  return (
    <nav
      className={cn(
        'sticky top-0 z-30 w-full bg-background/80 backdrop-blur border-b border-muted flex items-center justify-center py-1',
        className
      )}
      aria-label="Workflow Steps"
    >
      <ol className="flex flex-row gap-2 md:gap-4 text-xs md:text-sm font-medium text-muted-foreground select-none">
        {steps.map((step, idx) => (
          <li key={step} className="flex items-center">
            <button
              type="button"
              className={cn(
                'px-2 py-1 rounded transition-colors',
                idx === currentStep
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                'text-xs md:text-sm',
                'min-w-[2rem]'
              )}
              aria-current={idx === currentStep ? 'step' : undefined}
              aria-label={`Step ${idx + 1}: ${step}`}
              onClick={() => onStepClick && onStepClick(idx)}
              tabIndex={0}
            >
              {idx + 1}. {step}
            </button>
            {idx < steps.length - 1 && (
              <span className="mx-1 text-muted-foreground">→</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Version log for rollback
// stepper-version-log.json
// [
//   { "version": "1.0", "date": "2024-06-09", "description": "Initial modular always-visible small font Stepper component." }
// ]

export default Stepper; 