import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { StoryScene } from '../types';
import { Icon } from './Icon';
import { narrateWithElevenLabs } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface StoryCompletionViewProps {
  storyHistory: StoryScene[];
  onStartNew: () => void;
}

const StoryCompletionView: React.FC<StoryCompletionViewProps> = ({ storyHistory, onStartNew }) => {
    const [isNarrating, setIsNarrating] = useState(false);
    const [narrationLoading, setNarrationLoading] = useState(false);
    const [narrationError, setNarrationError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const fullStoryText = useMemo(() => {
        return storyHistory.map((scene, index) => {
            return `Scene ${index + 1}. ${scene.description}. ${scene.dialogue || ''}`;
        }).join('\n\n');
    }, [storyHistory]);

    // Cleanup audio object URL on component unmount
    useEffect(() => {
        const audio = audioRef.current;
        return () => {
            if (audio && audio.src) {
                URL.revokeObjectURL(audio.src);
            }
        };
    }, []);

    const handleDownloadComic = () => {
        window.print();
    };

    const handleNarrate = async () => {
        if (isNarrating) {
            audioRef.current?.pause();
            setIsNarrating(false);
            return;
        }

        if (audioRef.current?.src) {
             audioRef.current.play();
             setIsNarrating(true);
             return;
        }
        
        setNarrationLoading(true);
        setNarrationError(null);
        try {
            const audioUrl = await narrateWithElevenLabs(fullStoryText);
            if(audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.play();
                setIsNarrating(true);
            }
        } catch(err) {
            setNarrationError(err instanceof Error ? err.message : "Failed to generate narration.");
        } finally {
            setNarrationLoading(false);
        }
    };
    
    const handleAudioEnded = () => {
        setIsNarrating(false);
    }

    return (
        <>
            <div className="w-full max-w-4xl mx-auto p-6 animate-fade-in">
                <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">Your Epic Saga</h1>
                <p className="text-center text-slate-400 mb-8">Review your adventure, download your story as a comic, or have it narrated to you.</p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                    <button onClick={handleNarrate} disabled={narrationLoading} className="flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-600">
                        {narrationLoading ? <LoadingSpinner size="sm"/> : <Icon icon={isNarrating ? 'stop' : 'speak'} className="w-5 h-5" />}
                        <span>{narrationLoading ? 'Generating...' : (isNarrating ? 'Pause Narration' : 'Narrate Story')}</span>
                    </button>
                    <button onClick={handleDownloadComic} className="flex items-center justify-center gap-2 w-full sm:w-auto bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                        <Icon icon="download" className="w-5 h-5" />
                        <span>Download Comic</span>
                    </button>
                    <button onClick={onStartNew} className="flex items-center justify-center gap-2 w-full sm:w-auto bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors">
                        <Icon icon="wand" className="w-5 h-5" />
                        <span>Start New Story</span>
                    </button>
                </div>
                 {narrationError && <p className="text-center text-red-400 mb-4">{narrationError}</p>}

                <div className="space-y-8 bg-slate-800/50 p-4 sm:p-6 rounded-lg max-h-[60vh] overflow-y-auto">
                    {storyHistory.map((scene, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-6 p-4 bg-slate-900 rounded-lg shadow-md animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="md:w-1/3 flex-shrink-0">
                                <img src={scene.imageUrl} alt={`Scene ${index + 1}`} className="w-full h-auto object-cover rounded-md border-2 border-slate-700" />
                            </div>
                            <div className="md:w-2/3">
                                <h3 className="text-lg font-bold text-purple-300 mb-2">Scene {index + 1}</h3>
                                <p className="text-slate-300 mb-3">{scene.description}</p>
                                {scene.dialogue && (
                                    <blockquote className="border-l-4 border-cyan-400 pl-4 italic text-cyan-200">
                                        {scene.dialogue}
                                    </blockquote>
                                )}
                            </div>
                        </div>
                    ))}
                    {storyHistory.length === 0 && (
                        <div className="text-center py-16 text-slate-500">
                            <p>Your story is empty! Go back and create an adventure.</p>
                        </div>
                    )}
                </div>
            </div>
            {/* This is the hidden, printable version of the comic */}
            <div className="printable-comic hidden">
                <h1>My Gemini RPG Story</h1>
                <div className="comic-grid">
                    {storyHistory.map((scene, index) => (
                        <div key={`print-${index}`} className="scene-panel">
                            <img src={scene.imageUrl} alt={`Scene ${index + 1}`} />
                            <h3>Scene {index + 1}</h3>
                            <p>{scene.description}</p>
                            {scene.dialogue && <blockquote>"{scene.dialogue}"</blockquote>}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default StoryCompletionView;