import type { ChannelDefinition, ModeDefinition } from "@/components/content-engine/channels-config";

function buildPopupFeatures() {
  const width = 640;
  const height = 760;
  const left = Math.max(window.screenX + (window.outerWidth - width) / 2, 0);
  const top = Math.max(window.screenY + (window.outerHeight - height) / 2, 0);

  return [
    `width=${width}`,
    `height=${height}`,
    `left=${Math.round(left)}`,
    `top=${Math.round(top)}`,
    "popup=yes",
    "noopener=no",
    "resizable=yes",
    "scrollbars=yes",
  ].join(",");
}

export function openOAuthPopup(channelName: string) {
  const popup = window.open("about:blank", `social-oauth-${channelName}-${Date.now()}`, buildPopupFeatures());

  if (popup) {
    popup.document.write(`<!DOCTYPE html><html lang="sq"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>OAuth</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#fff;color:#111"><div style="padding:24px;text-align:center"><p style="margin:0 0 8px;font-size:18px;font-weight:600">Po hapet autorizimi për ${channelName}</p><p style="margin:0;font-size:14px;color:#666">Nëse dritarja nuk vazhdon, mbylle dhe provo përsëri.</p></div></body></html>`);
    popup.document.close();
  }

  return popup;
}

/**
 * Map platform to edge function name.
 * Platforms that route through the same Meta Business Login use "meta-oauth".
 * Each platform with its own OAuth app gets its own edge function.
 */
function resolveOAuthFunction(platform: string): string {
  switch (platform) {
    case "facebook":
    case "instagram":
    case "threads":
      return "meta-oauth";
    case "linkedin":
      return "linkedin-oauth";
    case "twitter":
      return "twitter-oauth";
    case "youtube":
      return "youtube-oauth";
    case "tiktok":
      return "tiktok-oauth";
    case "pinterest":
      return "pinterest-oauth";
    case "google_business":
      return "google_business-oauth";
    default:
      return `${platform}-oauth`;
  }
}

export async function startSocialOAuth({
  channel,
  mode,
  popup,
}: {
  channel: ChannelDefinition;
  mode: ModeDefinition;
  popup?: Window | null;
}) {
  const redirectUri = `${window.location.origin}/oauth/callback`;
  const functionName = resolveOAuthFunction(channel.platform);

  const bodyPayload: Record<string, string> = {
    redirectUri,
    platform: channel.platform,
    accountType: mode.accountTypes[0] || "professional",
    connectionMode: mode.mode,
  };

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}?action=authorize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(bodyPayload),
  });

  const data = await res.json();
  if (!res.ok || data.error || !data.authUrl) {
    throw new Error(data.error || "Gabim gjatë nisjes së autorizimit.");
  }

  if (popup && !popup.closed) {
    popup.location.href = data.authUrl;
    popup.focus();
    return;
  }

  if (window.self === window.top) {
    window.location.assign(data.authUrl);
    return;
  }

  throw new Error("OAuth popup u bllokua. Lejo popups ose përdor URL-në e publikuar të aplikacionit.");
}
