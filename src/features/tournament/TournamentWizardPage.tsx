import { useWizardStore } from './store/wizardStore';
import { WizardLayout } from './components/wizard/WizardLayout';
import { ModeSelection } from './components/wizard/ModeSelection';
import { TournamentSetup } from './components/wizard/TournamentSetup';
import { FormatAndRules } from './components/wizard/FormatAndRules';
import { CampaignSetup } from './components/wizard/CampaignSetup';
import { PlayerSelection } from './components/wizard/PlayerSelection';
import { TournamentSummary } from './components/wizard/TournamentSummary';
import { AnimatePresence } from 'framer-motion';

export function TournamentWizardPage() {
  const { step, mode } = useWizardStore();

  const getStepContent = () => {
    // Step 1: Mode Selection (common to both flows)
    if (step === 1) {
      return {
        title: "Mode Selection",
        description: "How do you want to play?",
        component: <ModeSelection />
      };
    }

    // PLANNED MODE - New 6-step flow (selection done in Campaign Setup)
    if (mode === 'planned') {
      switch (step) {
        case 2:
          return {
            title: "Configuration du Tournoi",
            description: "Définissez les informations de base",
            component: <TournamentSetup />
          };
        case 3:
          return {
            title: "Format & Règles",
            description: "Choisissez le format et les critères",
            component: <FormatAndRules />
          };
        case 4:
          return {
            title: "Campagne d'Inscription",
            description: "Générez le formulaire, collectez et validez les inscriptions",
            component: <CampaignSetup />
          };
        // Skip step 5 (Player Selection) - already done in Campaign Setup
        case 5:
          return {
            title: "Aperçu du Calendrier",
            description: "Visualisez le planning des matchs",
            component: <div className="text-center text-slate-400">🚧 En construction - Prochainement</div>
          };
        case 6:
          return {
            title: "Récapitulatif & Lancement",
            description: "Vérifiez et lancez le tournoi",
            component: <TournamentSummary />
          };
        default:
          return { title: "Error", description: "Error", component: <div>Error</div> };
      }
    } else {
      // INSTANT MODE - Keep original simplified flow
      switch (step) {
        case 2:
          return {
            title: "Format & Règles",
            description: "Choose your tournament format and rules",
            component: <FormatAndRules />
          };
        case 3:
          return {
            title: "Add Players",
            description: "Who will be competing?",
            component: <PlayerSelection />
          };
        case 4:
          return {
            title: "Review & Launch",
            description: "Double check everything before we start",
            component: <TournamentSummary />
          };
        default:
          return { title: "Error", description: "Error", component: <div>Error</div> };
      }
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
