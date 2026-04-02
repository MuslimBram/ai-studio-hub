import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container flex flex-col items-center justify-center py-32 text-center">
        <div className="text-8xl font-extrabold text-primary/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Faqja nuk u gjet</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Faqja që po kërkoni nuk ekziston ose është zhvendosur.
        </p>
        <Button asChild>
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            Kthehu në Kryefaqje
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
