import { useWizardStore } from './store/wizardStore';
import { WizardLayout } from './components/wizard/WizardLayout';
import { ModeSelection } from './components/wizard/ModeSelection';
import { FormatSelection } from './components/wizard/FormatSelection';
import { PlayerSelection } from './components/wizard/PlayerSelection';
import { TournamentSummary } from './components/wizard/TournamentSummary';
import { AnimatePresence } from 'framer-motion';

export function TournamentWizardPage() {
  const { step } = useWizardStore();

  const getStepContent = () => {
    switch (step) {
      case 1:
        return {
          title: "Mode Selection",
          description: "How do you want to play?",
          component: <ModeSelection />
        };
      case 2:
        return {
          title: "Select Format",
          description: "Choose how your tournament will be played.",
          component: <FormatSelection />
        };
      case 3:
        return {
          title: "Add Players",
          description: "Who will be competing for glory?",
          component: <PlayerSelection />
        };
      case 4:
        return {
          title: "Review & Launch",
          description: "Double check everything before we start.",
          component: <TournamentSummary />
        };
      default:
        return {
          title: "Error",
          description: "Something went wrong.",
          component: <div>Error</div>
        };
    }
  };

  const content = getStepContent();

  return (
    <WizardLayout title={content.title} description={content.description}>
      <AnimatePresence mode="wait">
        {content.component}
      </AnimatePresence>
    </WizardLayout>
  );
}
