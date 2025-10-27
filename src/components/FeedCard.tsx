import { useState } from "react";
import { Heart, MessageCircle, Download, Paperclip, Edit2, Trash2, MoreVertical, ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { motion } from "motion/react";
import { MediaGallery } from "./MediaGallery";

interface FeedCardProps {
  id: string;
  type: "annunci" | "appunti" | "richieste" | "progetti" | "comunicazioni" | "eventi";
  title: string;
  content: string;
  materia?: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: "admin" | "student";
  };
  timestamp: string;
  likes: number;
  comments: number;
  attachments?: { name: string; size: string; url: string; type?: string }[];
  thumbnail?: string;
  isLiked?: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
  onClick?: () => void;
  onLike?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  eventDate?: string;
  eventTime?: string;
}

const typeConfig = {
  annunci: { label: "Annuncio", color: "bg-orange-500 dark:bg-orange-600" },
  comunicazioni: { label: "Comunicazione", color: "bg-red-500 dark:bg-red-600" },
  appunti: { label: "Appunti", color: "bg-blue-500 dark:bg-blue-600" },
  richieste: { label: "Richiesta", color: "bg-purple-500 dark:bg-purple-600" },
  progetti: { label: "Progetto", color: "bg-green-500 dark:bg-green-600" },
  eventi: { label: "Evento", color: "bg-pink-500 dark:bg-pink-600" },
};

export function FeedCard({
  type,
  title,
  content,
  materia,
  author,
  timestamp,
  likes,
  comments,
  attachments,
  thumbnail,
  isLiked = false,
  currentUserId,
  isAdmin = false,
  onClick,
  onLike,
  onEdit,
  onDelete,
  eventDate,
  eventTime,
}: FeedCardProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const config = typeConfig[type];

  const truncatedContent = content.length > 200 
    ? content.substring(0, 200) + '...' 
    : content;

  const isOwnPost = currentUserId === author.id;
  const canEdit = isOwnPost || isAdmin;

  const mediaAttachments = attachments?.filter(att => {
    const type = att.type?.toLowerCase() || '';
    const name = att.name?.toLowerCase() || '';
    return (
      type.startsWith('image/') ||
      type.startsWith('video/') ||
      type.startsWith('audio/') ||
      name.endsWith('.png') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.gif') ||
      name.endsWith('.webp') ||
      name.endsWith('.svg') ||
      name.endsWith('.mp4') ||
      name.endsWith('.webm') ||
      name.endsWith('.ogg') ||
      name.endsWith('.mov') ||
      name.endsWith('.mp3') ||
      name.endsWith('.wav') ||
      name.endsWith('.m4a')
    );
  }) || [];

  const isImage = (att: any) => {
    const type = att.type?.toLowerCase() || '';
    const name = att.name?.toLowerCase() || '';
    return type.startsWith('image/') || 
           name.endsWith('.png') || 
           name.endsWith('.jpg') || 
           name.endsWith('.jpeg') || 
           name.endsWith('.gif') || 
           name.endsWith('.webp') || 
           name.endsWith('.svg');
  };

  const handleMediaClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onClick}
      className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-sm transition-all duration-200 cursor-pointer group"
    >
      {/* Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="w-10 h-10 ring-1 ring-border shrink-0">
              <AvatarImage src={author.avatar} />
              <AvatarFallback>{author.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-foreground truncate">{author.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{timestamp}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-start shrink-0">
            <Badge className={`${config.color} text-white border-0 text-xs px-2.5 h-6`}>
              {config.label}
            </Badge>
            {materia && materia !== 'Generale' && (
              <Badge variant="outline" className="text-xs px-2.5 h-6 hidden sm:inline-flex">
                {materia}
              </Badge>
            )}
            {canEdit && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 rounded-lg hover:bg-muted/80 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onEdit?.(); 
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Modifica
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onDelete?.(); 
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Elimina
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Event Date/Time */}
        {type === 'eventi' && (eventDate || eventTime) && (
          <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
            {eventDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{new Date(eventDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            )}
            {eventTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{eventTime}</span>
              </div>
            )}
          </div>
        )}

        <h3 className="mb-2 text-foreground line-clamp-2" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{title}</h3>
        {content && (
          <p className="text-muted-foreground text-sm line-clamp-3" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{truncatedContent}</p>
        )}
      </div>

      {/* Media Preview */}
      {mediaAttachments.length > 0 && (
        <div className="relative mb-3 px-4 sm:px-5">
          <div 
            onClick={(e) => handleMediaClick(e, currentMediaIndex)}
            className="cursor-pointer hover:opacity-95 transition-opacity rounded-xl overflow-hidden border border-border bg-muted/30"
          >
            {isImage(mediaAttachments[currentMediaIndex]) ? (
              <img
                src={mediaAttachments[currentMediaIndex].url}
                alt={mediaAttachments[currentMediaIndex].name}
                className="w-full max-h-80 object-contain"
              />
            ) : (
              <div className="w-full h-80 flex items-center justify-center">
                  <span className="text-5xl">
                    {mediaAttachments[currentMediaIndex].type?.startsWith('video/') ? '🎬' : '🎵'}
                  </span>
              </div>
            )}
          </div>
          
          {mediaAttachments.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : mediaAttachments.length - 1));
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 dark:bg-white/20 hover:bg-black/80 dark:hover:bg-white/30 text-white flex items-center justify-center transition-all backdrop-blur-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentMediaIndex((prev) => (prev < mediaAttachments.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 dark:bg-white/20 hover:bg-black/80 dark:hover:bg-white/30 text-white flex items-center justify-center transition-all backdrop-blur-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/70 dark:bg-white/20 backdrop-blur-md text-white text-xs">
                {currentMediaIndex + 1} / {mediaAttachments.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Thumbnail fallback */}
      {thumbnail && mediaAttachments.length === 0 && (
        <div className="mb-3 px-4 sm:px-5">
          <div className="rounded-xl overflow-hidden border border-border">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      )}

      {/* Attachments non-media */}
      {attachments && attachments.length > 0 && (
        <div className="space-y-2 mb-3 px-4 sm:px-5">
          {attachments
            .filter(att => !mediaAttachments.includes(att))
            .slice(0, 2)
            .map((attachment, idx) => (
              <a
                key={idx}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title={attachment.name}
                className="flex items-center gap-2.5 p-2.5 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-all cursor-pointer"
              >
                <Paperclip className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm">{attachment.name}</p>
                  <p className="text-xs text-muted-foreground">{attachment.size}</p>
                </div>
                <Download className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors shrink-0" />
              </a>
            ))}
          {attachments.filter(att => !mediaAttachments.includes(att)).length > 2 && (
            <p className="text-xs text-muted-foreground px-2">
              +{attachments.filter(att => !mediaAttachments.includes(att)).length - 2} altri allegati
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 sm:px-5 py-3 border-t border-border">
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
            className="flex items-center gap-1.5 group/like transition-transform active:scale-95"
          >
            <Heart
              className={`w-5 h-5 transition-all ${
                isLiked ? "fill-destructive text-destructive" : "text-muted-foreground group-hover/like:text-destructive group-hover/like:scale-110"
              }`}
            />
            <span className="text-sm text-muted-foreground">{likes}</span>
          </button>
          <button className="flex items-center gap-1.5 group/comment transition-transform active:scale-95">
            <MessageCircle className="w-5 h-5 text-muted-foreground group-hover/comment:text-primary group-hover/comment:scale-110 transition-all" />
            <span className="text-sm text-muted-foreground">{comments}</span>
          </button>
        </div>
      </div>

      {/* Media Gallery */}
      {mediaAttachments.length > 0 && (
        <MediaGallery
          items={mediaAttachments}
          initialIndex={galleryIndex}
          open={galleryOpen}
          onOpenChange={setGalleryOpen}
        />
      )}
    </motion.div>
  );
}
