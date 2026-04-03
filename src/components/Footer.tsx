import { Link } from 'react-router-dom';
import { Zap, Heart, Mail, Github } from 'lucide-react';
import { useDonationStats } from '@/hooks/useDonations';
import { useCategories } from '@/hooks/useCategories';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { data: stats } = useDonationStats();
  const { data: categories = [] } = useCategories();
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Pulse AI</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('footer_description')}</p>
            {stats && stats.totalCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4 text-destructive" />
                <span>{stats.totalCount} {t('footer_supporters')} · {stats.totalAmount.toFixed(0)}€ {t('donate_total').toLowerCase()}</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('footer_categories')}</h3>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/tools/${cat.slug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('footer_quick_links')}</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer_home')}</Link></li>
              <li><Link to="/donate" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer_support_platform')}</Link></li>
              <li><Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer_create_account')}</Link></li>
              <li><Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer_login')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('footer_support_us')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t('footer_support_desc')}</p>
            <Link to="/donate" className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
              <Heart className="h-4 w-4" />
              {t('footer_donate_now')}
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Pulse AI. {t('footer_copyright')}</p>
          <p className="text-xs text-muted-foreground">{t('footer_built_with')}</p>
        </div>
      </div>
    </footer>
  );
}
