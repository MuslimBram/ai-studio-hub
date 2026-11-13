import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import "./PwaInstallPrompt.css";

type Platform = "ios" | "android" | "desktop";
interface DeferredInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export default function PwaInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<DeferredInstallPrompt | null>(null);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [installed, setInstalled] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(isStandalone());
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as DeferredInstallPrompt);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setHelpOpen(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const onInstall = async () => {
    if (!promptEvent) {
      setHelpOpen((open) => !open);
      return;
    }
    const event = promptEvent;
    setPromptEvent(null);
    try {
      await event.prompt();
      const result = await event.userChoice;
      if (result.outcome === "accepted") {
        setInstalled(true);
        setHelpOpen(false);
      } else {
        setHelpOpen(true);
      }
    } catch {
      setHelpOpen(true);
    }
  };

  if (installed || dismissed) return null;
  const help = platform === "ios"
    ? "Në Safari: prek Share → Add to Home Screen → Add."
    : platform === "android"
      ? "Në Chrome: hap menunë ⋮ → Install app ose Add to Home Screen → Install."
      : "Në Chrome ose Edge: përdor ikonën Install në shiritin e adresës, ose menunë → Install AI Tools Hub.";

  return (
    <aside className="pwa-install-root" aria-label="Instalo AI Tools Hub">
      {helpOpen && (
        <section id="pwa-install-help" className="pwa-install-help" role="dialog" aria-label="Udhëzime instalimi">
          <button className="pwa-install-close" type="button" onClick={() => setHelpOpen(false)} aria-label="Mbyll udhëzimet">
            <X size={16} aria-hidden="true" />
          </button>
          <strong>Instalo AI Tools Hub</strong>
          <p>{help}</p>
          <p className="pwa-install-note">Kjo krijon një ikonë në ekranin kryesor dhe e hap faqen si aplikacion. Kërkohet HTTPS.</p>
        </section>
      )}
      <div className="pwa-install-actions">
        <button className="pwa-install-button" type="button" onClick={onInstall} aria-expanded={helpOpen} aria-controls="pwa-install-help">
          <Download size={18} aria-hidden="true" />
          <span>Instalo aplikacionin</span>
        </button>
        <button className="pwa-install-dismiss" type="button" onClick={() => setDismissed(true)} aria-label="Mbyll butonin e instalimit" title="Mbyll">
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
