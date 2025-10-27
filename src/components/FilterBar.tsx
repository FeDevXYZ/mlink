import { BookOpen, HandHelping, FileText, Megaphone, FolderOpen, Trophy, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type FilterType = "all" | "annunci" | "appunti" | "richieste" | "progetti" | "eventi" | "leaderboard";

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onLeaderboardClick?: () => void;
}

export function FilterBar({ activeFilter, onFilterChange, onLeaderboardClick }: FilterBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const filters = [
    { id: "all" as FilterType, label: "Tutto", icon: FolderOpen },
    { id: "annunci" as FilterType, label: "Annunci", icon: Megaphone },
    { id: "appunti" as FilterType, label: "Appunti", icon: BookOpen },
    { id: "richieste" as FilterType, label: "Richieste", icon: HandHelping },
    { id: "progetti" as FilterType, label: "Progetti", icon: FileText },
    { id: "eventi" as FilterType, label: "Eventi", icon: Calendar },
    { id: "leaderboard" as FilterType, label: "Classifica", icon: Trophy },
  ];

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const hasScroll = container.scrollWidth > container.clientWidth;
    setShowScrollHint(hasScroll);
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });

    setTimeout(checkScroll, 300);
  };

  return (
    <div className="relative">
      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="bg-card border border-border rounded-2xl p-1.5 overflow-x-auto scrollbar-hide"
      >
        <div className="flex gap-1.5 min-w-max">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            
            return (
              <button
                key={filter.id}
                onClick={() => {
                  if (filter.id === 'leaderboard') {
                    onLeaderboardClick?.();
                  } else {
                    onFilterChange(filter.id);
                  }
                }}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm whitespace-nowrap
                  ${filter.id === 'leaderboard'
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 text-white hover:from-amber-600 hover:to-orange-600"
                    : isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{filter.label}</span>
                <span className="sm:hidden">{filter.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scroll indicators */}
      {showScrollHint && (
        <>
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted/80 transition-all z-10"
              aria-label="Scorri a sinistra"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          {canScrollRight && (
            <>
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted/80 transition-all z-10"
                aria-label="Scorri a destra"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <div className="absolute right-2 bottom-0 translate-y-full mt-2 px-2 py-1 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20 flex items-center gap-1.5 animate-pulse">
                <span className="text-xs text-primary">Scorri per vedere altro</span>
                <ChevronRight className="w-3.5 h-3.5 text-primary" />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
