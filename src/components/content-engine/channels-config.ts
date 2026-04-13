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
  Globe,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ConnectionMethod = "oauth" | "credentials" | "webhook";
export type ConnectionMode = "professional" | "personal";
export type AccountType = "business" | "creator" | "personal" | "unknown";

export type Capability =
  | "auto_post"
  | "manual_post"
  | "messaging"
  | "comments"
  | "analytics"
  | "notifications"
  | "inbox"
  | "stories"
  | "reels"
  | "scheduling";

export interface ModeDefinition {
  mode: ConnectionMode;
  label: string;
  description: string;
  capabilities: Capability[];
  accountTypes: AccountType[];
  connectionMethod: ConnectionMethod;
}

export interface ChannelDefinition {
  id: string;
  platform: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  supported: boolean;
  modes: ModeDefinition[];
}

/** Human-readable capability labels */
export const capabilityLabels: Record<Capability, string> = {
  auto_post: "Publikim automatik",
  manual_post: "Publikim manual",
  messaging: "Mesazhe / DM",
  comments: "Komente",
  analytics: "Analitika",
  notifications: "Njoftime",
  inbox: "Inbox",
  stories: "Stories",
  reels: "Reels / Short Video",
  scheduling: "Planifikim postimesh",
};

export const channels: ChannelDefinition[] = [
  {
    id: "instagram",
    platform: "instagram",
    name: "Instagram",
    subtitle: "Business, Creator, or Personal",
    icon: Instagram,
    iconColor: "text-pink-500",
    supported: true,
    modes: [
      {
        mode: "professional",
        label: "Professional (Business / Creator)",
        description:
          "Auto-posting, analitika, komente, inbox. Kërkon Instagram Business/Creator account të lidhur me Facebook Page.",
        capabilities: ["auto_post", "scheduling", "analytics", "comments", "inbox", "stories", "reels", "notifications"],
        accountTypes: ["business", "creator"],
        connectionMethod: "oauth",
      },
      {
        mode: "personal",
        label: "Personal (Instagram Login API)",
        description:
          "Lidhu direkt me Instagram pa Facebook Page. Publikim automatik, analitika, komente. Përdor Instagram Login API v3.",
        capabilities: ["auto_post", "scheduling", "analytics", "comments", "notifications"],
        accountTypes: ["personal"],
        connectionMethod: "oauth",
      },
    ],
  },
  {
    id: "threads",
    platform: "threads",
    name: "Threads",
    subtitle: "Profile",
    icon: AtSign,
    iconColor: "text-foreground",
    supported: true,
    modes: [
      {
        mode: "professional",
        label: "Profile",
        description: "Publikim automatik tekst në Threads.",
        capabilities: ["auto_post", "scheduling", "notifications"],
        accountTypes: ["business", "creator", "personal"],
        connectionMethod: "oauth",
      },
    ],
  },
  {
    id: "linkedin",
    platform: "linkedin",
    name: "LinkedIn",
    subtitle: "Page or Profile",
    icon: Linkedin,
    iconColor: "text-blue-700",
    supported: true,
    modes: [
      {
        mode: "professional",
        label: "Company Page",
        description:
          "Publikim automatik në Company Page, analitika bazë. Kërkon LinkedIn OAuth.",
        capabilities: ["auto_post", "scheduling", "analytics", "notifications"],
        accountTypes: ["business"],
        connectionMethod: "oauth",
      },
      {
        mode: "personal",
        label: "Profil Personal",
        description:
          "Publikim me njoftim. Analitika e kufizuar.",
        capabilities: ["manual_post", "scheduling", "notifications"],
        accountTypes: ["personal"],
        connectionMethod: "oauth",
      },
    ],
  },
  {
    id: "facebook",
    platform: "facebook",
    name: "Facebook",
    subtitle: "Page or Group",
    icon: Facebook,
    iconColor: "text-blue-600",
    supported: true,
    modes: [
      {
        mode: "professional",
        label: "Business (Page)",
        description:
          "Publikim automatik në Page, analitika, komente, inbox. Kërkon Facebook Page me role admin.",
        capabilities: ["auto_post", "scheduling", "analytics", "comments", "inbox", "notifications"],
        accountTypes: ["business"],
        connectionMethod: "oauth",
      },
      {
        mode: "personal",
        label: "Profil Personal",
        description:
          "Vetëm njoftime dhe publikim manual. Facebook API nuk lejon auto-posting në profile personale.",
        capabilities: ["manual_post", "notifications"],
        accountTypes: ["personal"],
        connectionMethod: "oauth",
      },
    ],
  },
  {
    id: "bluesky",
    platform: "bluesky",
    name: "Bluesky",
    subtitle: "Profile",
    icon: Globe,
    iconColor: "text-sky-500",
    supported: true,
    modes: [
      {
        mode: "professional",
        label: "Profile",
        description: "Publikim automatik në Bluesky. Kërkon App Password.",
        capabilities: ["auto_post", "scheduling", "notifications"],
        accountTypes: ["personal"],
        connectionMethod: "credentials",
      },
    ],
  },
  {
    id: "youtube",
    platform: "youtube",
    name: "YouTube",
    subtitle: "Channel",
    icon: Youtube,
    iconColor: "text-red-600",
    supported: true,
    modes: [
      {
        mode: "professional",
        label: "Channel (Brand Account)",
        description: "Upload video, analitika, komente.",
        capabilities: ["auto_post", "scheduling", "analytics", "comments", "notifications"],
        accountTypes: ["business", "creator"],
        connectionMethod: "oauth",
      },
    ],
  },
  {
    id: "tiktok",
    platform: "tiktok",
    name: "TikTok",
    subtitle: "Business or Creator",
    icon: Music2,
    iconColor: "text-foreground",
    supported: true,
    modes: [
      {
        mode: "professional",
        label: "Business / Creator",
        description: "Publikim video, analitika, komente.",
        capabilities: ["auto_post", "scheduling", "analytics", "comments", "notifications"],
        accountTypes: ["business", "creator"],
        connectionMethod: "oauth",
      },
    ],
  },
  {
    id: "mastodon",
    platform: "mastodon",
    name: "Mastodon",
    subtitle: "Profile",
    icon: Globe,
    iconColor: "text-purple-500",
    supported: true,
    modes: [
      {
        mode: "professional",
        label: "Profile",
        description: "Publikim automatik në Mastodon instance.",
        capabilities: ["auto_post", "scheduling", "notifications"],
        accountTypes: ["personal"],
        connectionMethod: "credentials",
      },
    ],
  },
  {
    id: "pinterest",
    platform: "pinterest",
    name: "Pinterest",
    subtitle: "Business or Profile",
    icon: Globe,
    iconColor: "text-red-500",
    supported: true,
    modes: [
      {
        mode: "professional",
        label: "Business",
        description: "Publikim automatik i pin-eve, analitika.",
        capabilities: ["auto_post", "scheduling", "analytics", "notifications"],
        accountTypes: ["business"],
        connectionMethod: "oauth",
      },
    ],
  },
  {
    id: "google_business",
    platform: "google_business",
    name: "Google Business",
    subtitle: "Profile",
    icon: Building2,
    iconColor: "text-green-600",
    supported: true,
    modes: [
      {
        mode: "professional",
        label: "Business Profile",
        description: "Publikim në Google Business, analitika lokale.",
        capabilities: ["auto_post", "analytics", "notifications"],
        accountTypes: ["business"],
        connectionMethod: "oauth",
      },
    ],
  },
  {
    id: "twitter",
    platform: "twitter",
    name: "Twitter / X",
    subtitle: "Profile",
    icon: Twitter,
    iconColor: "text-foreground",
    supported: true,
    modes: [
      {
        mode: "professional",
        label: "Pro / Business",
        description: "Publikim automatik, analitika, komente, DM.",
        capabilities: ["auto_post", "scheduling", "analytics", "comments", "messaging", "notifications"],
        accountTypes: ["business", "creator"],
        connectionMethod: "oauth",
      },
    ],
  },
  {
    id: "telegram",
    platform: "telegram",
    name: "Telegram",
    subtitle: "Bot & Channel",
    icon: Send,
    iconColor: "text-blue-500",
    supported: true,
    modes: [
      {
        mode: "professional",
        label: "Bot / Channel",
        description: "Dërgo mesazhe automatike përmes Bot API. Kërkon Bot Token.",
        capabilities: ["auto_post", "scheduling", "messaging", "notifications"],
        accountTypes: ["business"],
        connectionMethod: "credentials",
      },
    ],
  },
  {
    id: "whatsapp",
    platform: "whatsapp",
    name: "WhatsApp",
    subtitle: "Business API",
    icon: MessageCircle,
    iconColor: "text-green-500",
    supported: true,
    modes: [
      {
        mode: "professional",
        label: "Business API",
        description: "Mesazhe automatike përmes WhatsApp Business API.",
        capabilities: ["auto_post", "messaging", "notifications"],
        accountTypes: ["business"],
        connectionMethod: "credentials",
      },
    ],
  },
  {
    id: "email",
    platform: "email",
    name: "Email",
    subtitle: "SMTP / Newsletter",
    icon: Mail,
    iconColor: "text-orange-500",
    supported: true,
    modes: [
      {
        mode: "professional",
        label: "SMTP / Newsletter",
        description: "Dërgo email automatikisht përmes SMTP.",
        capabilities: ["auto_post", "scheduling", "analytics", "notifications"],
        accountTypes: ["business"],
        connectionMethod: "credentials",
      },
    ],
  },
  {
    id: "custom",
    platform: "custom",
    name: "Custom Channel",
    subtitle: "Webhook / Adapter",
    icon: Plug,
    iconColor: "text-muted-foreground",
    supported: true,
    modes: [
      {
        mode: "professional",
        label: "Webhook",
        description: "Dërgo të dhëna përmes webhook URL.",
        capabilities: ["auto_post", "notifications"],
        accountTypes: ["unknown"],
        connectionMethod: "webhook",
      },
    ],
  },
];

/** Get the default connection method for a channel based on its first mode */
export function getDefaultConnectionMethod(ch: ChannelDefinition): ConnectionMethod {
  return ch.modes[0]?.connectionMethod ?? "credentials";
}

/** Check if a channel supports multiple modes */
export function hasMultipleModes(ch: ChannelDefinition): boolean {
  return ch.modes.length > 1;
}
