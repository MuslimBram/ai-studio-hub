import {
  Instagram,
  AtSign,
  Linkedin,
  Facebook,
  Music2,
  Youtube,
  Twitter,
  Building2,
  Send,
  MessageCircle,
  Mail,
  Plug,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ChannelDefinition {
  id: string;
  platform: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  supported: boolean;
}

export const channels: ChannelDefinition[] = [
  { id: "instagram", platform: "instagram", name: "Instagram", subtitle: "Business & Creator", icon: Instagram, iconColor: "text-pink-500", supported: true },
  { id: "threads", platform: "threads", name: "Threads", subtitle: "Text-based", icon: AtSign, iconColor: "text-foreground", supported: false },
  { id: "linkedin", platform: "linkedin", name: "LinkedIn", subtitle: "Company & Profile", icon: Linkedin, iconColor: "text-blue-700", supported: true },
  { id: "facebook", platform: "facebook", name: "Facebook", subtitle: "Pages & Groups", icon: Facebook, iconColor: "text-blue-600", supported: true },
  { id: "tiktok", platform: "tiktok", name: "TikTok", subtitle: "Creator & Business", icon: Music2, iconColor: "text-foreground", supported: false },
  { id: "youtube", platform: "youtube", name: "YouTube", subtitle: "Channels", icon: Youtube, iconColor: "text-red-600", supported: false },
  { id: "twitter", platform: "twitter", name: "X / Twitter", subtitle: "Posts & Threads", icon: Twitter, iconColor: "text-foreground", supported: false },
  { id: "google_business", platform: "google_business", name: "Google Business", subtitle: "Local listings", icon: Building2, iconColor: "text-green-600", supported: false },
  { id: "telegram", platform: "telegram", name: "Telegram", subtitle: "Bot & Channel", icon: Send, iconColor: "text-blue-500", supported: true },
  { id: "whatsapp", platform: "whatsapp", name: "WhatsApp", subtitle: "Business API", icon: MessageCircle, iconColor: "text-green-500", supported: true },
  { id: "email", platform: "email", name: "Email", subtitle: "SMTP / Newsletter", icon: Mail, iconColor: "text-orange-500", supported: true },
  { id: "custom", platform: "custom", name: "Custom Channel", subtitle: "Webhook / Adapter", icon: Plug, iconColor: "text-muted-foreground", supported: true },
];
