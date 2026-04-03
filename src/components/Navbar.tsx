import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, User, LogOut, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsAdmin } from '@/hooks/useAdmin';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const { t } = useLanguage();

  const navLinks = [
    { to: '/', label: t('nav_home') },
    { to: '/tools/image', label: t('nav_photo') },
    { to: '/tools/video', label: t('nav_video') },
    { to: '/tools/audio', label: t('nav_audio') },
    { to: '/tools/text', label: t('nav_text') },
    { to: '/tools/games', label: t('nav_games') },
    { to: '/tools/business', label: t('nav_business') },
    { to: '/content-engine', label: t('nav_content_engine') },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Pulse AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = link.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" asChild className="text-destructive hover:text-destructive">
            <Link to="/donate"><Heart className="h-4 w-4 mr-1" />{t('nav_donate')}</Link>
          </Button>
          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t('nav_profile')}
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {t('nav_admin')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={signOut} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    {t('nav_logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">{t('nav_login')}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">{t('nav_signup')}</Link>
                </Button>
              </>
            )
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-card">
          <nav className="container flex flex-col gap-1 py-4">
            {navLinks.map((link) => {
              const isActive = link.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link to="/donate" onClick={() => setMobileOpen(false)} className="rounded-lg px-4 py-3 text-sm text-destructive font-medium flex items-center gap-2">
              <Heart className="h-4 w-4" /> {t('nav_donate')}
            </Link>
            <div className="px-4 py-2">
              <LanguageSwitcher />
            </div>
            <div className="mt-2 border-t pt-3 flex flex-col gap-1">
              {!loading && (
                user ? (
                  <>
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="rounded-lg px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary">
                      {t('nav_profile')}
                    </Link>
                    <button onClick={() => { signOut(); setMobileOpen(false); }} className="rounded-lg px-4 py-3 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-secondary">
                      {t('nav_logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-4 py-3 text-sm text-primary font-medium">
                      {t('nav_login')}
                    </Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)} className="rounded-lg px-4 py-3 text-sm text-primary font-medium">
                      {t('nav_signup')}
                    </Link>
                  </>
                )
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
