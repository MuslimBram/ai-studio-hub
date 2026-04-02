import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">AI Tools Hub</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Kryefaqja</Link>
          <Link to="/tools/image" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Foto</Link>
          <Link to="/tools/video" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Video</Link>
          <Link to="/tools/audio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Audio</Link>
          <Link to="/tools/text" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tekst</Link>
          <Link to="/tools/business" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Biznes</Link>
        </nav>
      </div>
    </header>
  );
}
