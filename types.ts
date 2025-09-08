
export interface CharacterStats {
  strength: number;
  dexterity: number;
  intelligence: number;
}

export interface StoryScene {
  description: string;
  imageUrl: string;
  dialogue?: string;
  playerHealth: number;
  enemyHealth: number;
}

// FIX: Add ChatMessage interface to resolve type errors in ChatView and ChatMessageBubble.
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}
