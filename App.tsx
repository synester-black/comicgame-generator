import React, { useState } from 'react';
import Header from './components/Header';
import CharacterCreationView from './components/CharacterCreationView';
import SceneGenerationView from './components/SceneGenerationView';
import StoryCompletionView from './components/StoryCompletionView';
import type { CharacterStats, StoryScene } from './types';

// The RPG game can be in one of these states
type RpgState = 'characterCreation' | 'sceneGeneration' | 'storyCompletion';

const App: React.FC = () => {
  // State for the RPG mode
  const [rpgState, setRpgState] = useState<RpgState>('characterCreation');
  const [characterDescription, setCharacterDescription] = useState('');
  const [characterImage, setCharacterImage] = useState('');
  const [characterStats, setCharacterStats] = useState<CharacterStats>({ strength: 10, dexterity: 10, intelligence: 10 });
  const [storyHistory, setStoryHistory] = useState<StoryScene[]>([]);

  const handleCharacterCreated = (description: string, imageUrl: string, stats: CharacterStats) => {
    setCharacterDescription(description);
    setCharacterImage(imageUrl);
    setCharacterStats(stats);
    setRpgState('sceneGeneration');
  };

  const handleStoryComplete = (finalHistory: StoryScene[]) => {
    setStoryHistory(finalHistory);
    setRpgState('storyCompletion');
  };
  
  const handleStartNewStory = () => {
    // Reset all RPG state
    setCharacterDescription('');
    setCharacterImage('');
    setCharacterStats({ strength: 10, dexterity: 10, intelligence: 10 });
    setStoryHistory([]);
    setRpgState('characterCreation');
  };

  const renderRpgView = () => {
    switch (rpgState) {
      case 'characterCreation':
        return <CharacterCreationView onCharacterCreated={handleCharacterCreated} />;
      case 'sceneGeneration':
        return <SceneGenerationView 
                  characterDescription={characterDescription} 
                  characterImage={characterImage} 
                  characterStats={characterStats} 
                  onStoryComplete={handleStoryComplete} 
                />;
      case 'storyCompletion':
        return <StoryCompletionView storyHistory={storyHistory} onStartNew={handleStartNewStory} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          {renderRpgView()}
        </div>
      </main>
    </div>
  );
};

export default App;