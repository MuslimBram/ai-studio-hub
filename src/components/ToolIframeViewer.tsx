import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface ToolIframeViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
}

export function ToolIframeViewer({ open, onOpenChange, url, title }: ToolIframeViewerProps) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          fullscreen
            ? 'fixed inset-0 max-w-none w-screen h-screen rounded-none p-0 border-0'
            : 'max-w-6xl w-[95vw] h-[85vh] p-0'
        }
      >
        <div className="flex items-center justify-between border-b bg-card px-4 py-2">
          <DialogHeader className="flex-1">
            <DialogTitle className="text-sm font-medium">{title}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setFullscreen(!fullscreen)}
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <iframe
          src={url}
          title={title}
          className="flex-1 w-full h-[calc(100%-44px)] border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          referrerPolicy="no-referrer"
        />
      </DialogContent>
    </Dialog>
  );
}
