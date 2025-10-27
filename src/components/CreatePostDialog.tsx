import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Upload, X, FileText, Image as ImageIcon, Video, Music, Link as LinkIcon, Loader2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getAvatarForUser } from '../utils/avatarUtils';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userProfile: any;
  userCodes: string[];
  adminCode: string;
  onPostCreated: (post: any) => void;
  onPostSynced?: () => void;
}

const MATERIE = [
  "Italiano",
  "Matematica",
  "Storia",
  "Geografia",
  "Scienze",
  "Inglese",
  "Arte",
  "Musica",
  "Educazione Fisica",
  "Tecnologia",
  "Generale",
];

export function CreatePostDialog({ open, onOpenChange, userId, userProfile, userCodes, adminCode, onPostCreated, onPostSynced }: CreatePostDialogProps) {
  const [type, setType] = useState<string>('appunti');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [materia, setMateria] = useState('Generale');
  const [codiceCategoria, setCodiceCategoria] = useState('');
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string; type: string; size: number }>>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const hasAdminCode = userCodes.includes(adminCode);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    if (attachments.length + files.length > 5) {
      toast.error('Puoi caricare massimo 5 allegati');
      return;
    }

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0e1ba11c/upload`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAttachments(prev => [...prev, data]);
        } else {
          toast.error(`Errore nel caricamento di ${file.name}`);
        }
      }
      toast.success('Allegati caricati con successo!');
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Errore nel caricamento degli allegati');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (type.startsWith('audio/')) return <Music className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const truncateFileName = (name: string, maxLength: number = 40) => {
    if (name.length <= maxLength) return name;
    const extension = name.substring(name.lastIndexOf('.'));
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 3);
    return truncatedName + '...' + extension;
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Il titolo è obbligatorio');
      return;
    }
    
    // La descrizione è sempre facoltativa (può essere vuota)

    if ((type === 'annunci' || type === 'comunicazioni' || type === 'eventi') && !hasAdminCode) {
      toast.error(`Devi avere il codice ${adminCode} per postare questo tipo di contenuto`);
      return;
    }

    // Crea il post ottimistico immediatamente
    const authorName = userProfile?.name && userProfile?.surname 
      ? `${userProfile.name} ${userProfile.surname}`
      : 'Utente';
    
    // La descrizione vuota non viene salvata come stringa vuota ma come nulla (il server gestirà il codice speciale)
    const optimisticPost = {
      id: `temp_${Date.now()}`,
      type,
      title: title.trim(),
      content: content.trim() || '', // Rimane vuota se non c'è contenuto
      materia,
      author: {
        id: userId,
        name: authorName,
        avatar: getAvatarForUser(userId, userProfile?.avatarIndex),
        role: hasAdminCode && (type === 'annunci' || type === 'comunicazioni' || type === 'eventi') ? 'admin' : 'student',
      },
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      attachments: attachments.map(a => ({
        name: a.name,
        url: a.url,
        type: a.type,
        size: formatFileSize(a.size),
      })),
      codiceCategoria: codiceCategoria.trim().toUpperCase() || null,
      eventDate: eventDate || undefined,
      eventTime: eventTime || undefined,
      isLiked: false,
      _optimistic: true, // Flag per identificare post ottimistici
    };

    // Mostra immediatamente nel feed
    onPostCreated(optimisticPost);
    resetForm();
    onOpenChange(false);
    
    // Mostra messaggio che il post potrebbe richiedere tempo
    toast.success('Post in pubblicazione! Potrebbe servire qualche secondo per vederlo apparire.');

    // Sincronizza con il database in background
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0e1ba11c/posts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            type,
            title: title.trim(),
            content: content.trim(), // Invia stringa vuota se non c'è contenuto (il server gestirà)
            materia,
            attachments: attachments.map(a => ({
              name: a.name,
              url: a.url,
              type: a.type,
              size: formatFileSize(a.size),
            })),
            codiceCategoria: codiceCategoria.trim().toUpperCase() || null,
            eventDate: eventDate || null,
            eventTime: eventTime || null,
            isAdmin: hasAdminCode && (type === 'annunci' || type === 'comunicazioni' || type === 'eventi'),
          }),
        }
      );

      if (response.ok) {
        onPostSynced?.(); // Aggiorna stats
      } else {
        // Log dettagliato dell'errore per debug
        const errorData = await response.json().catch(() => null);
        console.error('Server error:', errorData);
        console.error('Request data:', {
          userId,
          type,
          title: title.trim(),
          content: content.trim(),
          materia,
          eventDate: eventDate || null,
          eventTime: eventTime || null,
          isAdmin: hasAdminCode && (type === 'annunci' || type === 'comunicazioni' || type === 'eventi'),
        });
        toast.error(`Errore nel salvataggio: ${errorData?.error || 'Errore sconosciuto'}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Errore nel salvataggio del post');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setType('appunti');
    setTitle('');
    setContent('');
    setMateria('Generale');
    setCodiceCategoria('');
    setAttachments([]);
    setEventDate('');
    setEventTime('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border w-[95vw] max-w-xl lg:max-w-2xl max-h-[85vh] lg:max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Condividi un contenuto</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Crea un nuovo post con allegati e seleziona la materia
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2.5">
            <Label htmlFor="type" className="text-foreground">Tipo di contenuto *</Label>
            <Select value={type} onValueChange={(newType) => {
              setType(newType);
              // Reset allegati se si passa da/a richieste
              if (newType === 'richieste' || type === 'richieste') {
                setAttachments([]);
              }
            }}>
              <SelectTrigger className="h-11 bg-muted/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appunti">📚 Appunti</SelectItem>
                <SelectItem value="richieste">🙋 Richiesta</SelectItem>
                <SelectItem value="progetti">🚀 Progetto</SelectItem>
                {hasAdminCode && <SelectItem value="annunci">📢 Annuncio</SelectItem>}
                {hasAdminCode && <SelectItem value="comunicazioni">🔔 Comunicazione</SelectItem>}
                {hasAdminCode && <SelectItem value="eventi">📅 Evento</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {type === 'eventi' && (
            <>
              <div className="space-y-2.5">
                <Label htmlFor="eventDate" className="text-foreground">Data evento (facoltativa)</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="h-11 bg-muted/50 border-border"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="eventTime" className="text-foreground">Orario evento (facoltativa)</Label>
                <Input
                  id="eventTime"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="h-11 bg-muted/50 border-border"
                />
              </div>
            </>
          )}

          <div className="space-y-2.5">
            <Label htmlFor="materia" className="text-foreground">Materia</Label>
            <Select value={materia} onValueChange={setMateria}>
              <SelectTrigger className="h-11 bg-muted/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATERIE.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="title" className="text-foreground">Titolo *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'richieste' ? 'Descrivi la tua richiesta...' : 'Inserisci il titolo...'}
              className="h-11 bg-muted/50 border-border"
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="content" className="text-foreground">
              Descrizione (facoltativa)
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Aggiungi una descrizione al tuo post (opzionale)..."
              rows={5}
              className="bg-muted/50 border-border resize-none"
            />
          </div>

          {type !== 'richieste' && type !== 'comunicazioni' && (
            <div className="space-y-2.5">
              <Label htmlFor="codice" className="text-foreground">Codice Categoria (opzionale)</Label>
              <Input
                id="codice"
                value={codiceCategoria}
                onChange={(e) => setCodiceCategoria(e.target.value.toUpperCase())}
                placeholder="Es: CLASSETERZA, PROGRAMMAZIONE..."
                className="h-11 bg-muted/50 border-border"
              />
              <p className="text-xs text-muted-foreground">
                Solo chi ha questo codice potrà vedere il post
              </p>
            </div>
          )}

          {type !== 'richieste' && (
            <div className="space-y-2.5">
              <Label className="text-foreground">Allegati (massimo 5)</Label>
              <div 
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center bg-muted/30 
                  transition-all duration-200
                  ${isDragging 
                    ? 'border-primary bg-primary/10 scale-[1.02]' 
                    : 'border-border hover:border-primary/30'
                  }
                `}
              >
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading || attachments.length >= 5}
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer flex flex-col items-center gap-2 ${uploading ? 'opacity-50' : ''}`}
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  ) : (
                    <Upload className={`w-8 h-8 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                  <span className={`text-sm transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}>
                    {uploading ? 'Caricamento in corso...' : isDragging ? 'Rilascia i file qui' : 'Clicca o trascina i file qui'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Immagini, PDF, documenti, video...
                  </span>
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2 mt-3">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="text-primary">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm truncate text-foreground">{truncateFileName(file.name)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAttachment(index)}
                        className="shrink-0 h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleSubmit} disabled={loading || uploading} className="min-w-[100px]">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Pubblicazione...' : 'Pubblica'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}