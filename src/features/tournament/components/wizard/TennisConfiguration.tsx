import { useWizardStore } from '../../store/wizardStore';
import { TennisPresetSelector } from './TennisPresetSelector';
import { TennisRulesCustomizer } from './TennisRulesCustomizer';
import { getPresetById } from '@/sports/tennis/tournamentPresets';
import { useState } from 'react';

export function TennisConfiguration() {
  const { tennisPresetId, tennisConfig, setTennisPreset, setTennisConfig } = useWizardStore();
  const [showCustomizer, setShowCustomizer] = useState(false);

  const handlePresetSelect = (presetId: string) => {
    setTennisPreset(presetId);
    
    if (presetId === 'custom') {
      setShowCustomizer(true);
    } else {
      const preset = getPresetById(presetId);
      if (preset) {
        setTennisConfig(preset.config);
      }
      setShowCustomizer(false);
    }
  };

  const handleCustomize = () => {
    setShowCustomizer(true);
    setTennisPreset('custom');
  };

  if (showCustomizer) {
    return (
      <TennisRulesCustomizer
        config={tennisConfig || getPresetById('custom')!.config}
        onChange={setTennisConfig}
      />
    );
  }

  return (
    <TennisPresetSelector
      selectedPresetId={tennisPresetId}
      onSelectPreset={handlePresetSelect}
      onCustomize={handleCustomize}
    />
  );
}
