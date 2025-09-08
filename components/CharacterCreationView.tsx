import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { Icon } from './Icon';
// FIX: Import CharacterStats from the centralized types.ts file instead of the non-module App.tsx.
import type { CharacterStats } from '../types';


interface CharacterCreationViewProps {
  onCharacterCreated: (description: string, imageUrl: string, stats: CharacterStats) => void;
}

const CharacterCreationView: React.FC<CharacterCreationViewProps> = ({ onCharacterCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [stats, setStats] = useState<CharacterStats>({ strength: 10, dexterity: 10, intelligence: 10 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleStatChange = (stat: keyof CharacterStats, value: string) => {
    const numValue = parseInt(value, 10);
    // Allow empty input to clear, but default to 0 if NaN
    if (value === '') {
        setStats(prevStats => ({ ...prevStats, [stat]: 0 }));
    } else if (!isNaN(numValue)) {
        setStats(prevStats => ({ ...prevStats, [stat]: numValue }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const fullPrompt = `A full-body digital painting portrait of a character: ${prompt}. The character should be centered, on a simple, atmospheric background.`;
      const imageUrl = await generateImage(fullPrompt);
      setGeneratedImage(imageUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center animate-fade-in">
      {!generatedImage && (
        <>
          <Icon icon="user" className="w-20 h-20 text-slate-500 mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Step 1: Create Your Character</h1>
          <p className="text-slate-400 mb-8">Describe your hero and set their starting stats.</p>
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Elf archer in sleek cyberpunk armor"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500"
              >
                {isLoading ? <LoadingSpinner /> : <Icon icon="wand" className="w-5 h-5" />}
                <span>Generate</span>
              </button>
            </div>

            <div className="w-full grid grid-cols-3 gap-4 mt-6 text-left">
                {/* FIX: With CharacterStats correctly typed, Object.keys(stats) is now strongly typed, fixing key and string assignment errors. */}
                {(Object.keys(stats) as Array<keyof CharacterStats>).map((statName) => (
                    <div key={statName}>
                        <label htmlFor={statName} className="block text-sm font-medium text-slate-300 mb-1 capitalize">{statName}</label>
                        <input 
                            type="number" 
                            id={statName} 
                            value={stats[statName]} 
                            onChange={e => handleStatChange(statName, e.target.value)} 
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={isLoading}
                        />
                    </div>
                ))}
            </div>
          </form>
        </>
      )}

      {isLoading && !generatedImage && (
        <div className="mt-8 flex flex-col items-center text-slate-400">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg animate-pulse">Forging your hero...</p>
        </div>
      )}

      {error && (
        <div className="mt-8 text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
          <p className="font-bold">Generation Failed</p>
          <p>{error}</p>
        </div>
      )}

      {generatedImage && (
        <div className="flex flex-col items-center animate-fade-in">
           <h2 className="text-3xl font-bold mb-4">Your Hero is Ready!</h2>
           <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden mb-6 w-full max-w-lg">
                <img src={generatedImage} alt="Generated character" className="w-full h-auto object-cover" />
           </div>
           <button
             onClick={() => onCharacterCreated(prompt, generatedImage, stats)}
             className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 text-lg"
           >
             <span>Next: Create a Scene</span>
             <Icon icon="next" className="w-6 h-6" />
           </button>
        </div>
      )}
    </div>
  );
};

export default CharacterCreationView;
