import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { useLanguage } from '@/contexts/LanguageContext';

const NotFound = () => {
  const { t } = useLanguage();
  useSEO({ title: `404 — ${t('notfound_title')}` });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container flex flex-col items-center justify-center py-32 text-center flex-1">
        <div className="text-8xl font-extrabold text-primary/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('notfound_title')}</h1>
        <p className="text-muted-foreground mb-8 max-w-md">{t('notfound_desc')}</p>
        <Button asChild>
          <Link to="/"><Home className="h-4 w-4 mr-2" />{t('notfound_back')}</Link>
        </Button>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
