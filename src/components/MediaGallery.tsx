import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "./ui/button";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";

interface MediaItem {
  name: string;
  url: string;
  type?: string;
  size: string;
}

interface MediaGalleryProps {
  items: MediaItem[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaGallery({ items, initialIndex = 0, open, onOpenChange }: MediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);
  const lastTouchDistance = useRef(0);
  const imageRef = useRef<HTMLImageElement>(null);

  const currentItem = items[currentIndex];

  // Reset quando si apre o cambia immagine
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [open, initialIndex]);

  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);
  
  const isImage = (item: MediaItem) => {
    const type = item.type?.toLowerCase() || '';
    const name = item.name?.toLowerCase() || '';
    return type.startsWith('image/') || 
           name.endsWith('.png') || 
           name.endsWith('.jpg') || 
           name.endsWith('.jpeg') || 
           name.endsWith('.gif') || 
           name.endsWith('.webp') || 
           name.endsWith('.svg');
  };

  const isVideo = (item: MediaItem) => {
    const type = item.type?.toLowerCase() || '';
    const name = item.name?.toLowerCase() || '';
    return type.startsWith('video/') || 
           name.endsWith('.mp4') || 
           name.endsWith('.webm') || 
           name.endsWith('.ogg') ||
           name.endsWith('.mov');
  };

  const isAudio = (item: MediaItem) => {
    const type = item.type?.toLowerCase() || '';
    const name = item.name?.toLowerCase() || '';
    return type.startsWith('audio/') || 
           name.endsWith('.mp3') || 
           name.endsWith('.wav') || 
           name.endsWith('.ogg') || 
           name.endsWith('.m4a');
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  // Zoom con rotellina mouse
  const handleWheel = (e: React.WheelEvent) => {
    if (!isImage(currentItem)) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(5, prev + delta)));
  };

  // Pan con mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isImage(currentItem) || zoom <= 1) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !isImage(currentItem)) return;
    setPosition({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Gestione pinch to zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1) {
      // Swipe
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && isImage(currentItem)) {
      // Pinch zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      if (lastTouchDistance.current > 0) {
        const delta = (distance - lastTouchDistance.current) * 0.01;
        setZoom((prev) => Math.max(0.5, Math.min(5, prev + delta)));
      }
      
      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1) {
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchStartX.current - touchEndX.current) < 50) {
      lastTouchDistance.current = 0;
      return;
    }

    if (touchStartX.current - touchEndX.current > 50) {
      // Swipe left - next
      handleNext();
    }
    if (touchEndX.current - touchStartX.current > 50) {
      // Swipe right - previous
      handlePrevious();
    }
    
    lastTouchDistance.current = 0;
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch(currentItem.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentItem.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Errore nel download:', error);
      // Fallback: apri in nuova tab
      window.open(currentItem.url, '_blank');
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 overflow-hidden z-[200]" hideCloseButton>
        <VisuallyHidden>
          <DialogTitle>{currentItem.name}</DialogTitle>
          <DialogDescription>Visualizza e scarica il file allegato</DialogDescription>
        </VisuallyHidden>
        
        {/* Header con controlli */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
          <div className="text-foreground dark:text-white">
            <p className="text-sm font-medium">{currentItem.name}</p>
            <p className="text-xs text-muted-foreground">
              {currentIndex + 1} di {items.length} • {currentItem.size}
            </p>
          </div>
          
          <div className="flex items-center gap-2 pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="text-foreground dark:text-white hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/20 dark:active:bg-white/20 transition-colors"
            >
              <Download className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-foreground dark:text-white hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/20 dark:active:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Contenuto principale */}
        <div 
          className="w-full h-full flex items-center justify-center p-4 sm:p-16"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {isImage(currentItem) && (
            <img
              ref={imageRef}
              src={currentItem.url}
              alt={currentItem.name}
              className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
              style={{ transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)` }}
              draggable={false}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
          )}
          
          {isVideo(currentItem) && (
            <video
              src={currentItem.url}
              controls
              controlsList="nodownload"
              autoPlay
              className="max-w-full max-h-full rounded-lg"
              playsInline
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Il tuo browser non supporta la riproduzione video.
            </video>
          )}
          
          {isAudio(currentItem) && (
            <div className="flex flex-col items-center gap-4 p-8 bg-white/10 dark:bg-slate-800/30 rounded-2xl backdrop-blur-xl">
              <div className="text-foreground dark:text-white text-center mb-4">
                <p className="text-xl font-medium">{currentItem.name}</p>
                <p className="text-sm text-muted-foreground">{currentItem.size}</p>
              </div>
              <audio
                src={currentItem.url}
                controls
                autoPlay
                className="w-full max-w-md"
              >
                Il tuo browser non supporta la riproduzione audio.
              </audio>
            </div>
          )}
          
          {!isImage(currentItem) && !isVideo(currentItem) && !isAudio(currentItem) && (
            <div className="flex flex-col items-center gap-4 p-8 bg-white/10 dark:bg-slate-800/30 rounded-2xl backdrop-blur-xl">
              <div className="text-foreground dark:text-white text-center">
                <p className="text-xl font-medium mb-2">{currentItem.name}</p>
                <p className="text-sm text-muted-foreground mb-4">{currentItem.size}</p>
                <p className="text-sm text-muted-foreground mb-4">Anteprima non disponibile per questo tipo di file</p>
                <Button onClick={handleDownload} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Download className="w-4 h-4 mr-2" />
                  Scarica file
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation - nascosto su mobile */}
        {items.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePrevious();
              }}
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 items-center justify-center rounded-full bg-black/30 dark:bg-white/20 hover:bg-black/50 dark:hover:bg-white/30 active:bg-black/60 dark:active:bg-white/40 text-foreground dark:text-white transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNext();
              }}
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 items-center justify-center rounded-full bg-black/30 dark:bg-white/20 hover:bg-black/50 dark:hover:bg-white/30 active:bg-black/60 dark:active:bg-white/40 text-foreground dark:text-white transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        {/* Thumbnails */}
        {items.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-50 p-2 sm:p-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory scroll-smooth pointer-events-auto">
              {items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all snap-start ${
                    idx === currentIndex
                      ? 'border-primary scale-110'
                      : 'border-white/30 dark:border-slate-600 hover:border-white/60 dark:hover:border-slate-400'
                  }`}
                >
                  {isImage(item) ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 dark:bg-slate-800/30 flex items-center justify-center text-foreground dark:text-white text-xs">
                      {isVideo(item) ? '🎬' : isAudio(item) ? '🎵' : '📄'}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}