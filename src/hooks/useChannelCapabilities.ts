import { useMemo } from "react";
import { useSocialAccounts } from "./useContentEngine";
import { channels, type Capability } from "@/components/content-engine/channels-config";

export interface ConnectedChannel {
  id: string;
  platform: string;
  accountName: string;
  connectionMode: string;
  accountType: string;
  capabilities: Capability[];
  isConnected: boolean;
}

/**
 * Returns capability-aware connected channels from DB.
 * Use `hasCapability` to gate features in UI.
 */
export function useChannelCapabilities() {
  const { data: accounts = [], isLoading } = useSocialAccounts();

  const connectedChannels: ConnectedChannel[] = useMemo(
    () =>
      accounts.map((a) => ({
        id: a.id,
        platform: a.platform,
        accountName: a.account_name,
        connectionMode: (a as any).connection_mode ?? "professional",
        accountType: (a as any).account_type ?? "unknown",
        capabilities: ((a as any).capabilities ?? []) as Capability[],
        isConnected: a.is_connected,
      })),
    [accounts],
  );

  const hasCapability = (platform: string, cap: Capability): boolean => {
    const ch = connectedChannels.find((c) => c.platform === platform && c.isConnected);
    if (!ch) return false;
    return ch.capabilities.includes(cap);
  };

  const getChannelMode = (platform: string) => {
    const ch = connectedChannels.find((c) => c.platform === platform && c.isConnected);
    return ch?.connectionMode ?? null;
  };

  const canAutoPost = (platform: string) => hasCapability(platform, "auto_post");
  const canSchedule = (platform: string) => hasCapability(platform, "scheduling");
  const hasAnalytics = (platform: string) => hasCapability(platform, "analytics");

  return {
    connectedChannels,
    isLoading,
    hasCapability,
    getChannelMode,
    canAutoPost,
    canSchedule,
    hasAnalytics,
  };
}
