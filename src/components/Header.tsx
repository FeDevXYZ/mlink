import { useState, useEffect } from "react";
import { Moon, Sun, Search, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getAvatarForUser } from "../utils/avatarUtils";
import schoolLogo from "figma:asset/ec2842f91873b96d63f3f307280eb892eb2c1bd8.png";
import marconiLinkLogo from "figma:asset/de4cb319ac4d8bd84174960c19570c5926e0a0d5.png";

interface HeaderProps {
  userProfile?: { name: string; surname: string; avatarIndex?: number; userId?: string } | null;
  appName: string;
  appSubtitle: string;
  onCreatePost: () => void;
  onProfileClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ userProfile, appName, appSubtitle, onCreatePost, onProfileClick, searchQuery, onSearchChange }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('marconilink_theme');
    
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    setIsDark(shouldBeDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('marconilink_theme', newIsDark ? 'dark' : 'light');
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const displayName = userProfile?.name && userProfile?.surname 
    ? `${userProfile.name} ${userProfile.surname}`
    : 'Utente';
  
  const initials = userProfile?.name && userProfile?.surname
    ? `${userProfile.name[0]}${userProfile.surname[0]}`
    : 'U';

  const avatarUrl = getAvatarForUser(userProfile?.userId || '', userProfile?.avatarIndex);

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[72px]">
          {/* Logo e nome */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <img 
                src={schoolLogo} 
                alt="IC G. Marconi" 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-1 ring-border"
              />
              <img 
                src={marconiLinkLogo} 
                alt="Marconi Link" 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover ring-1 ring-border hidden sm:block"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground tracking-tight">{appName}</span>
              <span className="text-xs text-muted-foreground">{appSubtitle}</span>
            </div>
          </div>

          {/* Search bar - nascosta su mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Cerca contenuti..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full w-10 h-10"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            <Button
              onClick={onCreatePost}
              className="hidden sm:flex gap-2 h-10 bg-primary hover:bg-primary/90 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Condividi</span>
            </Button>

            <Button
              onClick={onCreatePost}
              size="icon"
              className="sm:hidden bg-primary hover:bg-primary/90 w-10 h-10 transition-all"
            >
              <Plus className="w-4 h-4" />
            </Button>

            <Avatar 
              onClick={onProfileClick}
              className="w-9 h-9 sm:w-10 sm:h-10 ring-1 ring-border cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            >
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Search bar mobile */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Cerca contenuti..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
