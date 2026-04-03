import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_LABELS } from '@/i18n/types';
import type { Language } from '@/i18n/types';

const POPULAR_LANGUAGES: Language[] = ['sq', 'en', 'de', 'fr', 'es', 'it', 'tr', 'ar', 'pt'];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const allLanguages = Object.entries(LANGUAGE_LABELS) as [Language, string][];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">{LANGUAGE_LABELS[language]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-0">
        <ScrollArea className="h-72">
          <div className="p-1">
            {/* Popular first */}
            {POPULAR_LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang}
                onClick={() => setLanguage(lang)}
                className={language === lang ? 'bg-primary/10 text-primary font-medium' : ''}
              >
                {LANGUAGE_LABELS[lang]}
              </DropdownMenuItem>
            ))}
            <div className="my-1 border-t" />
            {/* Rest */}
            {allLanguages
              .filter(([l]) => !POPULAR_LANGUAGES.includes(l))
              .sort((a, b) => a[1].localeCompare(b[1]))
              .map(([lang, label]) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={language === lang ? 'bg-primary/10 text-primary font-medium' : ''}
                >
                  {label}
                </DropdownMenuItem>
              ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
