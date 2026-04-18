import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { type ChannelDefinition, type ModeDefinition, capabilityLabels } from "./channels-config";

interface CredentialsStepProps {
  channel: ChannelDefinition;
  selectedMode: ModeDefinition;
  onConnect: (formData: Record<string, string>) => void;
  connecting: boolean;
}

interface FieldDef {
  label: string;
  key: string;
  type?: string;
  placeholder: string;
  helpText?: string;
  helpUrl?: string;
}

const channelFields: Record<string, FieldDef[]> = {
  bluesky: [
    {
      label: "Handle",
      key: "handle",
      placeholder: "p.sh. username.bsky.social",
      helpText: "Handle-i yt i plotë në Bluesky.",
    },
    {
      label: "App Password",
      key: "appPassword",
      type: "password",
      placeholder: "xxxx-xxxx-xxxx-xxxx",
      helpText: "Krijo një App Password në Bluesky → Settings → App Passwords. Mos përdor fjalëkalimin kryesor.",
      helpUrl: "https://bsky.app/settings/app-passwords",
    },
    {
      label: "PDS Service (opsionale)",
      key: "service",
      placeholder: "https://bsky.social",
      helpText: "Lëre bosh nëse përdor bsky.social standard.",
    },
  ],
  mastodon: [
    {
      label: "Instance URL",
      key: "instanceUrl",
      placeholder: "p.sh. mastodon.social",
      helpText: "URL-ja e instancës tënde Mastodon (pa https://).",
    },
    {
      label: "Access Token",
      key: "accessToken",
      type: "password",
      placeholder: "Bearer token nga aplikacioni yt",
      helpText: "Krijo një aplikacion në Settings → Development → New Application me scope: read, write.",
      helpUrl: "https://docs.joinmastodon.org/client/token/",
    },
  ],
  telegram: [
    { label: "Emri i Botit", key: "account_name", placeholder: "p.sh. MyBot" },
    {
      label: "Bot Token",
      key: "account_id",
      type: "password",
      placeholder: "123456:ABC-DEF...",
      helpText: "Merr token-in nga @BotFather në Telegram.",
    },
  ],
  whatsapp: [
    { label: "Numri i Biznesit", key: "account_name", placeholder: "+355..." },
    { label: "WhatsApp Business API ID", key: "account_id", placeholder: "Phone Number ID" },
  ],
  email: [
    { label: "Emri i llogarisë", key: "account_name", placeholder: "Newsletter" },
    { label: "Email / SMTP", key: "account_id", placeholder: "info@biznesi.com" },
  ],
  custom: [
    { label: "Emri i kanalit", key: "account_name", placeholder: "Kanali im" },
    { label: "Webhook URL", key: "account_id", placeholder: "https://..." },
  ],
};

export function CredentialsStep({ channel, selectedMode, onConnect, connecting }: CredentialsStepProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const Icon = channel.icon;
  const fields = channelFields[channel.platform] || channelFields.custom;

  const requiredKeys = fields.filter((f) => !f.label.includes("opsionale")).map((f) => f.key);
  const isValid = requiredKeys.every((k) => (formData[k] || "").trim().length > 0);

  return (
    <div className="space-y-5 px-6 py-6">
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
          <Icon className={`h-5 w-5 ${channel.iconColor}`} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{channel.name}</p>
          <p className="text-xs text-muted-foreground">{selectedMode.label}</p>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {selectedMode.capabilities.length} veçori
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {selectedMode.capabilities.map((cap) => (
          <Badge key={cap} variant="secondary" className="text-[10px]">
            {capabilityLabels[cap]}
          </Badge>
        ))}
      </div>

      {fields.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Input
            id={field.key}
            type={field.type || "text"}
            placeholder={field.placeholder}
            value={formData[field.key] || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
            disabled={connecting}
            autoComplete="off"
          />
          {field.helpText && (
            <p className="text-xs text-muted-foreground flex items-start gap-1">
              <span>{field.helpText}</span>
              {field.helpUrl && (
                <a
                  href={field.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-primary hover:underline shrink-0"
                >
                  Më shumë <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </p>
          )}
        </div>
      ))}

      <Button onClick={() => onConnect(formData)} disabled={connecting || !isValid} className="w-full" size="lg">
        {connecting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Duke u lidhur...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Lidh {channel.name}
          </>
        )}
      </Button>
    </div>
  );
}
