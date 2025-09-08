
import React, { useState } from 'react';
// FIX: Import generateImage instead of non-existent generateImages
import { generateImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { Icon } from './Icon';

const ImageGenView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImages([]);

    try {
      // FIX: Call generateImage and handle single image response
      const imageUrl = await generateImage(prompt);
      setImages([imageUrl]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-8">
      <div className="w-full max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-slate-100">Image Generation Studio</h2>
        <p className="text-center text-slate-400 mb-6">Describe the image you want to create with Imagen.</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 mb-8">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A photo of an astronaut riding a horse on Mars"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500"
          >
            {/* FIX: Change icon from 'generate' to 'wand' for consistency and to fix error */}
            {isLoading ? <LoadingSpinner /> : <Icon icon="wand" className="w-5 h-5" />}
            <span>Generate</span>
          </button>
        </form>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-auto">
        {isLoading && (
          <div className="flex flex-col items-center text-slate-400">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-lg animate-pulse">Creating your masterpiece...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
            <p className="font-bold">Generation Failed</p>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && images.length === 0 && (
          <div className="text-center text-slate-500">
            <Icon icon="image" className="mx-auto w-24 h-24 mb-4" />
            <h3 className="text-xl font-semibold">Your creations will appear here</h3>
            <p>Start by typing a prompt above.</p>
          </div>
        )}

        {!isLoading && images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 w-full max-w-4xl mx-auto">
            {images.map((imgSrc, index) => (
              <div key={index} className="bg-slate-800 rounded-lg shadow-xl overflow-hidden transition-transform hover:scale-105 duration-300">
                <img src={imgSrc} alt={`Generated image ${index + 1}`} className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenView;
