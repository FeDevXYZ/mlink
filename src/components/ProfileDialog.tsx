import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { User, KeyRound, Plus, X, Loader2 } from "lucide-react";
import { AvatarPicker } from "./AvatarPicker";
import { getAvatarIndex } from "../utils/avatarUtils";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  adminCode: string;
  onProfileUpdate: () => void;
}

export function ProfileDialog({ open, onOpenChange, userId, adminCode, onProfileUpdate }: ProfileDialogProps) {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [codes, setCodes] = useState<string[]>([]);
  const [newCode, setNewCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open]);

  const loadProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0e1ba11c/user/profile/${userId}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const profile = await response.json();
        const profileName = profile.name || '';
        const profileSurname = profile.surname || '';
        
        setName(profileName);
        setSurname(profileSurname);
        setAvatarIndex(profile.avatarIndex ?? 0);
        setCodes(profile.codes || []);
        
        // È la prima volta se non ha nome
        setIsFirstTime(!profileName.trim());
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Errore nel caricamento del profilo');
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !surname.trim()) {
      toast.error('Nome e cognome sono obbligatori');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0e1ba11c/user/profile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            name: name.trim(),
            surname: surname.trim(),
            avatarIndex,
            codes,
          }),
        }
      );

      if (response.ok) {
        toast.success('Profilo aggiornato con successo!');
        onProfileUpdate();
        onOpenChange(false);
      } else {
        toast.error('Errore nel salvataggio del profilo');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Errore nel salvataggio del profilo');
    } finally {
      setLoading(false);
    }
  };

  const addCode = () => {
    const code = newCode.trim().toUpperCase();
    if (code && !codes.includes(code)) {
      setCodes([...codes, code]);
      setNewCode('');
    }
  };

  const removeCode = (codeToRemove: string) => {
    setCodes(codes.filter(c => c !== codeToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={isFirstTime ? undefined : onOpenChange}>
      <DialogContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/95 border-white/40 dark:border-slate-700/50 shadow-2xl w-[95vw] max-w-md max-h-[85vh] lg:max-h-[75vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground dark:text-white">
            <User className="w-5 h-5 text-primary" />
            {isFirstTime ? 'Crea il tuo Profilo' : 'Il tuo profilo'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-gray-400">
            {isFirstTime 
              ? 'Benvenuto! Completa il tuo profilo per iniziare ad usare Marconi Link'
              : 'Inserisci i tuoi dati e i codici di accesso alle categorie'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground dark:text-gray-200">Nome *</Label>
            <Input
              id="name"
              placeholder="Mario"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/60 dark:bg-slate-800/90 dark:text-white border-white/40 dark:border-slate-600/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="surname" className="text-foreground dark:text-gray-200">Cognome *</Label>
            <Input
              id="surname"
              placeholder="Rossi"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="bg-white/60 dark:bg-slate-800/90 dark:text-white border-white/40 dark:border-slate-600/50"
            />
          </div>

          <AvatarPicker
            selected={avatarIndex}
            onSelect={setAvatarIndex}
          />

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-foreground dark:text-gray-200">
              <KeyRound className="w-4 h-4" />
              Codici di accesso (facoltativo)
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Inserisci codice..."
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && addCode()}
                className="bg-white/60 dark:bg-slate-800/90 dark:text-white border-white/40 dark:border-slate-600/50"
              />
              <Button onClick={addCode} size="icon" className="shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {codes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                {codes.map((code) => (
                  <Badge
                    key={code}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1 dark:bg-slate-700 dark:text-white"
                  >
                    {code}
                    <button onClick={() => removeCode(code)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              I codici determinano a quali categorie di post hai accesso e le tue permessi.
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          {!isFirstTime && (
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="dark:hover:bg-slate-700">
              Annulla
            </Button>
          )}
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Salvataggio...' : isFirstTime ? 'Inizia' : 'Salva'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}