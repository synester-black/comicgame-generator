import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import { CHAT_MODEL_NAME, IMAGE_MODEL_NAME } from '../constants';

// NOTE: Hardcoding API keys in client-side code is a security risk.
// This should be replaced with a secure method, like an environment variable
// accessed through a backend proxy.
const ELEVENLABS_API_KEY = "7e9d88a82875cdc300af455f4b5b7a3592846442392ddfad16d852e5e115558e";
const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // A default, versatile voice (Rachel)

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an image based on a textual prompt using the 'imagen-4.0-generate-001' model.
 */
export const generateImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: IMAGE_MODEL_NAME,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
    return imageUrl;
};

// FIX: Add and export createChat function to instantiate a new chat session for ChatView.
/**
 * Creates a new chat session with the specified model.
 * @param modelName The name of the model to use for the chat.
 * @returns A Chat instance.
 */
export const createChat = (modelName: string): Chat => {
  return ai.chats.create({
    model: modelName,
  });
};


/**
 * Generates a story scene based on player actions and character details.
 * Returns a structured JSON object by leveraging the Gemini API's JSON mode.
 */
export const generateScene = async (prompt: string): Promise<{ description: string; dialogue: string; playerHealthChange: number; enemyHealthChange: number; }> => {
    const result = await ai.models.generateContent({
        model: CHAT_MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    description: {
                        type: Type.STRING,
                        description: "A vivid, third-person description of the scene and what is happening. Should be 2-3 sentences."
                    },
                    dialogue: {
                        type: Type.STRING,
                        description: "A single line of dialogue for a non-player character, if any. Can be an empty string."
                    },
                    playerHealthChange: {
                        type: Type.INTEGER,
                        description: "The change in the player's health as a result of the action. Can be positive, negative, or zero."
                    },
                    enemyHealthChange: {
                        type: Type.INTEGER,
                        description: "The change in the enemy's health as a result of the action. Can be positive, negative, or zero."
                    }
                },
                required: ["description", "dialogue", "playerHealthChange", "enemyHealthChange"],
            },
        }
    });

    const jsonText = result.text.trim();
    return JSON.parse(jsonText);
};

/**
 * A helper to convert a data URL to a GoogleGenerativeAI.Part object.
 */
const fileToGenerativePart = (dataUrl: string) => {
    const parts = dataUrl.split(',');
    const mimeType = parts[0].split(':')[1].split(';')[0];
    const base64Data = parts[1];
    return {
        inlineData: {
            mimeType,
            data: base64Data,
        },
    };
};

/**
 * Generates a new image by combining an existing image and a text prompt.
 * This is used to maintain character consistency across scenes.
 */
export const generateImageFromImage = async (baseImage: string, prompt: string): Promise<string> => {
    const imagePart = fileToGenerativePart(baseImage);
    const textPart = { text: prompt };

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of result.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            return `data:${mimeType};base64,${base64ImageBytes}`;
        }
    }
    
    throw new Error("The model did not return an image. Could not maintain character consistency.");
};

/**
 * Narrates the given text using the ElevenLabs Text-to-Speech API.
 * @param text The text to narrate.
 * @returns A URL for the generated audio stream.
 */
export const narrateWithElevenLabs = async (text: string): Promise<string> => {
  const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text: text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`ElevenLabs API Error: ${errorData.detail?.message || response.statusText}`);
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
};