import { Category, Subcategory } from './types';

export const categories: Category[] = [
  {
    id: 'image',
    name: 'Foto AI',
    slug: 'image',
    icon: 'Image',
    description: 'Gjenero, edito dhe transformo imazhe me AI',
    order: 1,
    colorClass: 'cat-image',
    bgColorClass: 'bg-cat-image',
  },
  {
    id: 'video',
    name: 'Video AI',
    slug: 'video',
    icon: 'Video',
    description: 'Krijo dhe edito video me inteligjencë artificiale',
    order: 2,
    colorClass: 'cat-video',
    bgColorClass: 'bg-cat-video',
  },
  {
    id: 'audio',
    name: 'Audio AI',
    slug: 'audio',
    icon: 'Music',
    description: 'Tekst në fjalë, klono zërin dhe krijo muzikë',
    order: 3,
    colorClass: 'cat-audio',
    bgColorClass: 'bg-cat-audio',
  },
  {
    id: 'text',
    name: 'Tekst & Chat',
    slug: 'text',
    icon: 'MessageSquare',
    description: 'Shkrim, përmbledhje, përkthim dhe chatbot AI',
    order: 4,
    colorClass: 'cat-text',
    bgColorClass: 'bg-cat-text',
  },
  {
    id: 'games',
    name: 'Lojra & Kreativitet',
    slug: 'games',
    icon: 'Gamepad2',
    description: 'NPC, histori, asset-e dhe koncepte për lojra',
    order: 5,
    colorClass: 'cat-games',
    bgColorClass: 'bg-cat-games',
  },
  {
    id: 'business',
    name: 'Biznes & Marketing',
    slug: 'business',
    icon: 'Briefcase',
    description: 'Reklama, përshkrime, email dhe asistent biznesi',
    order: 6,
    colorClass: 'cat-business',
    bgColorClass: 'bg-cat-business',
  },
];

export const subcategories: Subcategory[] = [
  // Image
  { id: 'text-to-image', categoryId: 'image', name: 'Text to Image', slug: 'text-to-image', description: 'Gjenero imazhe nga teksti' },
  { id: 'image-to-image', categoryId: 'image', name: 'Image to Image', slug: 'image-to-image', description: 'Transformo imazhe ekzistuese' },
  { id: 'background-removal', categoryId: 'image', name: 'Background Removal', slug: 'background-removal', description: 'Hiq sfondin automatikisht' },
  { id: 'upscale', categoryId: 'image', name: 'Upscale', slug: 'upscale', description: 'Rrit rezolucionin e imazheve' },
  { id: 'face-restore', categoryId: 'image', name: 'Face Restore', slug: 'face-restore', description: 'Rikthe cilësinë e fytyrave' },
  { id: 'product-mockup', categoryId: 'image', name: 'Product Mockup', slug: 'product-mockup', description: 'Krijo mockup-e produktesh' },

  // Video
  { id: 'text-to-video', categoryId: 'video', name: 'Text to Video', slug: 'text-to-video', description: 'Krijo video nga teksti' },
  { id: 'image-to-video', categoryId: 'video', name: 'Image to Video', slug: 'image-to-video', description: 'Animo imazhe në video' },
  { id: 'lip-sync', categoryId: 'video', name: 'Lip Sync', slug: 'lip-sync', description: 'Sinkronizo buzët me audio' },
  { id: 'video-upscale', categoryId: 'video', name: 'Video Upscale', slug: 'video-upscale', description: 'Rrit cilësinë e videos' },
  { id: 'video-avatar', categoryId: 'video', name: 'Video Avatar', slug: 'video-avatar', description: 'Krijo avatar video realistike' },

  // Audio
  { id: 'text-to-speech', categoryId: 'audio', name: 'Text to Speech', slug: 'text-to-speech', description: 'Konverto tekstin në fjalë' },
  { id: 'voice-clone', categoryId: 'audio', name: 'Voice Clone', slug: 'voice-clone', description: 'Klono zërin me AI' },
  { id: 'music', categoryId: 'audio', name: 'Music', slug: 'music', description: 'Gjenero muzikë me AI' },
  { id: 'sound-fx', categoryId: 'audio', name: 'Sound FX', slug: 'sound-fx', description: 'Krijo efekte zanore' },

  // Text
  { id: 'ai-writing', categoryId: 'text', name: 'AI Writing', slug: 'ai-writing', description: 'Shkrim automatik me AI' },
  { id: 'summarizer', categoryId: 'text', name: 'Summarizer', slug: 'summarizer', description: 'Përmbledh tekste të gjata' },
  { id: 'translator', categoryId: 'text', name: 'Translator', slug: 'translator', description: 'Përkthe në shumë gjuhë' },
  { id: 'chatbot', categoryId: 'text', name: 'Chatbot', slug: 'chatbot', description: 'Chatbot inteligjent' },

  // Games
  { id: 'npc-dialogue', categoryId: 'games', name: 'NPC Dialogue', slug: 'npc-dialogue', description: 'Dialogë për personazhe lojrash' },
  { id: 'story-generator', categoryId: 'games', name: 'Story Generator', slug: 'story-generator', description: 'Gjenero tregime dhe narrativa' },
  { id: 'asset-generator', categoryId: 'games', name: 'Asset Generator', slug: 'asset-generator', description: 'Krijo asset-e vizuale për lojra' },
  { id: 'game-concept-art', categoryId: 'games', name: 'Game Concept Art', slug: 'game-concept-art', description: 'Art konceptual për lojra' },

  // Business
  { id: 'ads-generator', categoryId: 'business', name: 'Ads Generator', slug: 'ads-generator', description: 'Gjenero reklama automatikisht' },
  { id: 'product-description', categoryId: 'business', name: 'Product Description', slug: 'product-description', description: 'Përshkrime produktesh me AI' },
  { id: 'email-writer', categoryId: 'business', name: 'Email Writer', slug: 'email-writer', description: 'Shkruaj email profesionale' },
  { id: 'lead-assistant', categoryId: 'business', name: 'Lead Assistant', slug: 'lead-assistant', description: 'Asistent për gjenerim lead-esh' },
];
