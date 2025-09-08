import React, { useState } from 'react';
import type { CharacterStats, StoryScene } from '../types';
import { generateImageFromImage, generateScene } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { Icon } from './Icon';
import HealthBar from './HealthBar';

interface SceneGenerationViewProps {
  characterDescription: string;
  characterImage: string;
  characterStats: CharacterStats;
  onStoryComplete: (history: StoryScene[]) => void;
}

const MAX_PLAYER_HEALTH = 100;
const MAX_ENEMY_HEALTH = 100;
const MAX_SCENES = 10;

const SceneGenerationView: React.FC<SceneGenerationViewProps> = ({ characterDescription, characterImage, characterStats, onStoryComplete }) => {
  const [storyHistory, setStoryHistory] = useState<StoryScene[]>([]);
  const [playerAction, setPlayerAction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [playerHealth, setPlayerHealth] = useState(MAX_PLAYER_HEALTH);
  const [enemyHealth, setEnemyHealth] = useState(MAX_ENEMY_HEALTH);
  
  const currentScene = storyHistory.length > 0 ? storyHistory[storyHistory.length - 1] : null;
  const isGameOver = playerHealth <= 0 || enemyHealth <= 0;

  const generateFullPrompt = (action: string): string => {
    return `
      You are a dungeon master for a simple text-based RPG.
      Character: ${characterDescription}
      Character Stats: Strength ${characterStats.strength}, Dexterity ${characterStats.dexterity}, Intelligence ${characterStats.intelligence}.
      Previous Scene: ${currentScene ? currentScene.description : 'The story is just beginning.'}
      Player's Action: "${action}"

      Based on this, generate the next part of the story. 
      The story should be an epic fantasy adventure.
      Keep the description concise (2-3 sentences).
      The player started with ${MAX_PLAYER_HEALTH} health and the enemy with ${MAX_ENEMY_HEALTH}.
      Current Player Health: ${playerHealth}, Current Enemy Health: ${enemyHealth}.
      Calculate the health changes based on the action, character stats, and story progression.
      Return a JSON object with the scene description, any NPC dialogue, and the health changes.
    `;
  }

  const handleNextScene = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerAction.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Generate story text from action
      const prompt = generateFullPrompt(playerAction);
      const sceneResult = await generateScene(prompt);
      
      // 2. Generate image from new description, using the base character image for consistency
      const imagePrompt = `Place the character from the provided image into this new scene: "${sceneResult.description}". Maintain the character's appearance and style. The scene should be an epic fantasy digital painting.`;
      const imageUrl = await generateImageFromImage(characterImage, imagePrompt);
      
      // 3. Update state
      const newPlayerHealth = playerHealth + sceneResult.playerHealthChange;
      const newEnemyHealth = enemyHealth + sceneResult.enemyHealthChange;

      const newScene: StoryScene = {
        ...sceneResult,
        imageUrl,
        playerHealth: newPlayerHealth,
        enemyHealth: newEnemyHealth,
      };

      const newHistory = [...storyHistory, newScene];
      setStoryHistory(newHistory);
      setPlayerHealth(newPlayerHealth);
      setEnemyHealth(newEnemyHealth);
      setPlayerAction('');

      if (newPlayerHealth <= 0 || newEnemyHealth <= 0 || newHistory.length >= MAX_SCENES) {
          onStoryComplete(newHistory);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred creating the next scene.');
    } finally {
      setIsLoading(false);
    }
  };

  if (storyHistory.length === 0 && !isLoading) {
    // Initial Scene Generation
    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Your Adventure Awaits</h2>
            <p className="text-slate-400 mb-8">What is the first thing your hero does?</p>
            <form onSubmit={handleNextScene} className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto">
                 <input
                    type="text"
                    value={playerAction}
                    onChange={(e) => setPlayerAction(e.target.value)}
                    placeholder="e.g., Enter the dark cave"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-slate-600">
                    <span>Begin</span>
                    <Icon icon="next" className="w-5 h-5" />
                </button>
            </form>
        </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-8">
            {/* Left side: Image and Stats */}
            <div className="flex flex-col gap-4">
                <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden relative">
                    {isLoading && !currentScene && <div className="aspect-square bg-slate-700 animate-pulse"></div>}
                    {currentScene && <img src={currentScene.imageUrl} alt="Current scene" className="w-full h-auto object-cover" />}
                    {isGameOver && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <h2 className="text-5xl font-extrabold text-red-500 transform -rotate-12">GAME OVER</h2>
                        </div>
                    )}
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg flex flex-col gap-4">
                  <HealthBar label="Hero" current={playerHealth} max={MAX_PLAYER_HEALTH} />
                  <HealthBar label="Enemy" current={enemyHealth} max={MAX_ENEMY_HEALTH} />
                </div>
            </div>

            {/* Right side: Story and Action */}
            <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-purple-300 mb-2">Scene {storyHistory.length} / {MAX_SCENES}</h2>
                {isLoading && <p className="text-slate-400 italic animate-pulse">The next chapter is being written...</p>}
                {currentScene && (
                  <div className="text-slate-300 space-y-4">
                    <p>{currentScene.description}</p>
                    {currentScene.dialogue && <blockquote className="border-l-4 border-cyan-400 pl-4 italic text-cyan-200">"{currentScene.dialogue}"</blockquote>}
                  </div>
                )}
                 {error && (
                    <div className="mt-4 text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
                        <p className="font-bold">An Error Occurred</p>
                        <p>{error}</p>
                    </div>
                )}
                
                <div className="mt-auto pt-8">
                     <form onSubmit={handleNextScene} className="flex flex-col sm:flex-row items-center gap-3">
                        <input
                            type="text"
                            value={playerAction}
                            onChange={(e) => setPlayerAction(e.target.value)}
                            placeholder="What do you do next?"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={isLoading || isGameOver}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !playerAction.trim() || isGameOver}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-slate-600"
                        >
                           {isLoading ? <LoadingSpinner size="sm" /> : <Icon icon="next" className="w-5 h-5" />}
                           <span>Continue</span>
                        </button>
                    </form>
                    {storyHistory.length >= 5 && (
                        <div className="text-center mt-4">
                            <button 
                                onClick={() => onStoryComplete(storyHistory)} 
                                className="text-slate-400 hover:text-white hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors text-sm"
                            >
                                Finish Story & View Comic
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default SceneGenerationView;