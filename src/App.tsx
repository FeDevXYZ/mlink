// ========== CONFIGURAZIONE ==========
const ADMIN_CODE = "PDMADMIN"; // Codice admin per pubblicare annunci
const SUPERADMIN_CODE = "TERMINALADMIN"; // Codice super admin (vede tutto e può modificare/eliminare tutto)

// Testi personalizzabili
const APP_NAME = "Marconi Link";
const APP_SUBTITLE = "I.C. Pace del Mela";
const WELCOME_TITLE = "Benvenuto su Marconi Link 👋";
const WELCOME_DESCRIPTION = "La piattaforma di condivisione risorse per studenti e docenti dell'I.C. Pace del Mela. Scopri, condividi e impara insieme alla tua comunità scolastica.";
const FOOTER_TEXT = "Marconi Link - Scopri, condividi e impara.";
const FOOTER_SUBTITLE = "Questa piattaforma non è di proprietà dell'Istituto Comprensivo Pace del Mela, è un iniziativa di noi studenti.";

import { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { FilterBar } from "./components/FilterBar";
import { FeedCard } from "./components/FeedCard";
import { StatsBar } from "./components/StatsBar";
import { ProfileDialog } from "./components/ProfileDialog";
import { CreatePostDialog } from "./components/CreatePostDialog";
import { PostDetailDialog } from "./components/PostDetailDialog";
import { EditPostDialog } from "./components/EditPostDialog";
import { LeaderboardDialog } from "./components/LeaderboardDialog";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from './utils/supabase/info';
import * as NotificationUtils from './utils/notifications';
import * as OneSignal from './utils/onesignal';

type FilterType = "all" | "annunci" | "appunti" | "richieste" | "progetti" | "eventi" | "leaderboard";

export default function App() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);
  const [editPostDialogOpen, setEditPostDialogOpen] = useState(false);
  const [leaderboardDialogOpen, setLeaderboardDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [postToEdit, setPostToEdit] = useState<any>(null);
  
  // User state
  const [userId] = useState(() => {
    let id = localStorage.getItem('marconilink_userId');
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('marconilink_userId', id);
    }
    return id;
  });
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ todayVisits: 0, totalPosts: 0, totalRichieste: 0, totalNotes: 0 });
  const [loading, setLoading] = useState(true);
  
  // Notification state
  const notificationStateRef = useRef<NotificationUtils.NotificationState | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [oneSignalEnabled, setOneSignalEnabled] = useState(false);
  const lastPostCountRef = useRef<number>(0);

  useEffect(() => {
    loadUserProfile();
    trackVisit();
  }, []);

  useEffect(() => {
    if (userProfile) {
      loadPosts();
      loadStats();
    }
  }, [userProfile]);

  // Auto-refresh ogni 5 secondi con rilevamento nuovi post
  useEffect(() => {
    if (!userProfile) return;

    const intervalId = setInterval(async () => {
      // Refresh silenzioso in background (silent = true)
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0e1ba11c/posts/${userId}`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );

        if (response.ok) {
          const newPosts = await response.json();
          
          // Controlla se ci sono nuovi post
          if (lastPostCountRef.current > 0 && newPosts.length > lastPostCountRef.current) {
            const numNewPosts = newPosts.length - lastPostCountRef.current;
            
            // Mostra notifica per nuovi post
            if (notificationsEnabled) {
              NotificationUtils.showNotification(
                `🆕 ${numNewPosts} nuov${numNewPosts === 1 ? 'o' : 'i'} post!`,
                {
                  body: 'Controlla le ultime novità della community',
                  tag: 'new-posts',
                }
              );
            }
            
            toast.success(`${numNewPosts} nuov${numNewPosts === 1 ? 'o' : 'i'} post disponibil${numNewPosts === 1 ? 'e' : 'i'}!`);
          }
          
          lastPostCountRef.current = newPosts.length;
          setPosts(newPosts);
        }
      } catch (error) {
        console.error('Error refreshing posts:', error);
      }
      
      loadStats();
    }, 5000); // 5 secondi per aggiornamenti più rapidi

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, notificationsEnabled]); // userId è nella closure, non serve nelle dipendenze

  // Setup notifiche native e OneSignal
  useEffect(() => {
    if (!userProfile) return;

    const setupNotifications = async () => {
      // Setup notifiche native browser
      const enabled = await NotificationUtils.requestNotificationPermission();
      setNotificationsEnabled(enabled);

      if (enabled) {
        // Carica stato precedente
        const savedState = NotificationUtils.loadNotificationState(userId);
        notificationStateRef.current = savedState || {
          userPosition: 0,
          userLikes: 0,
          lastAnnouncementId: null,
          lastCommunicationId: null,
          userPostComments: {},
        };
      }

      // Setup OneSignal Push Notifications
      try {
        const pushEnabled = await OneSignal.requestPushPermission();
        if (pushEnabled) {
          setOneSignalEnabled(true);
          console.log('OneSignal attivato con successo! ✅');
          
          // Ottieni e salva il Player ID
          const playerId = await OneSignal.getPlayerId();
          if (playerId) {
            console.log('OneSignal Player ID:', playerId);
            
            // Salva il Player ID sul server (opzionale - per inviare notifiche mirate)
            await OneSignal.sendPlayerIdToServer(playerId, userId);
            
            // Imposta tag per segmentazione (opzionale)
            await OneSignal.setUserTags({
              userId: userId,
              userName: userProfile.name || 'Utente',
            });
          }
          
          // Ascolta notifiche in foreground
          OneSignal.onNotificationReceived((notification) => {
            console.log('Notifica OneSignal ricevuta:', notification);
            // Ricarica i post quando arriva una notifica
            loadPosts(true);
          });
          
          // Ascolta click sulle notifiche
          OneSignal.onNotificationClicked((notification) => {
            console.log('Notifica OneSignal cliccata:', notification);
            // Ricarica i post quando l'utente clicca una notifica
            loadPosts(true);
          });
        }
      } catch (error) {
        console.log('OneSignal non disponibile:', error);
      }
    };

    setupNotifications();
  }, [userProfile, userId]);

  // Controlla cambiamenti per notifiche (ogni 30 secondi)
  useEffect(() => {
    if (!userProfile || !notificationsEnabled) return;

    const checkForNotifications = async () => {
      try {
        // 1. Controlla classifica
        const leaderboardResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0e1ba11c/leaderboard`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );
        const leaderboard = await leaderboardResponse.json();
        const userIndex = leaderboard.findIndex((u: any) => u.userId === userId);
        const newPosition = userIndex + 1;

        if (notificationStateRef.current && notificationStateRef.current.userPosition > 0) {
          NotificationUtils.checkLeaderboardChange(
            notificationStateRef.current.userPosition,
            newPosition,
            userProfile.name
          );
        }

        // 2. Conta like totali sui post dell'utente
        const userPosts = posts.filter(p => p.author.id === userId);
        const totalLikes = userPosts.reduce((sum, p) => sum + p.likes, 0);

        if (notificationStateRef.current && notificationStateRef.current.userLikes > 0) {
          NotificationUtils.checkNewLikes(
            notificationStateRef.current.userLikes,
            totalLikes,
            userProfile.name
          );
        }

        // 3. Controlla nuovi annunci/comunicazioni
        const announcements = posts.filter(p => p.type === 'annunci' && p.author.role === 'admin');
        const communications = posts.filter(p => p.type === 'comunicazioni' && p.author.role === 'admin');

        if (announcements.length > 0) {
          const latest = announcements[0];
          if (
            notificationStateRef.current?.lastAnnouncementId &&
            latest.id !== notificationStateRef.current.lastAnnouncementId
          ) {
            NotificationUtils.notifyNewAnnouncement(latest.title);
          }
          if (notificationStateRef.current) {
            notificationStateRef.current.lastAnnouncementId = latest.id;
          }
        }

        if (communications.length > 0) {
          const latest = communications[0];
          if (
            notificationStateRef.current?.lastCommunicationId &&
            latest.id !== notificationStateRef.current.lastCommunicationId
          ) {
            NotificationUtils.notifyNewCommunication(latest.title);
          }
          if (notificationStateRef.current) {
            notificationStateRef.current.lastCommunicationId = latest.id;
          }
        }

        // 4. Controlla nuovi commenti sui post dell'utente
        for (const post of userPosts) {
          const oldCount = notificationStateRef.current?.userPostComments[post.id] || 0;
          if (oldCount > 0 && post.comments > oldCount) {
            // Nuovo commento! (in produzione dovresti recuperare chi ha commentato)
            NotificationUtils.notifyNewComment(
              'Un utente',
              post.type,
              post.title
            );
          }
          if (notificationStateRef.current) {
            notificationStateRef.current.userPostComments[post.id] = post.comments;
          }
        }

        // Aggiorna stato
        if (notificationStateRef.current) {
          notificationStateRef.current.userPosition = newPosition;
          notificationStateRef.current.userLikes = totalLikes;
          NotificationUtils.saveNotificationState(userId, notificationStateRef.current);
        }
      } catch (error) {
        console.error('Errore controllo notifiche:', error);
      }
    };

    // Controlla subito e poi ogni 30 secondi
    checkForNotifications();
    const intervalId = setInterval(checkForNotifications, 30000);

    return () => clearInterval(intervalId);
  }, [userProfile, userId, posts, notificationsEnabled]);

  const trackVisit = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0e1ba11c/visit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ userId, date: today }),
        }
      );
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0e1ba11c/stats`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0e1ba11c/user/profile/${userId}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
        
        // Show profile dialog if user hasn't set name/surname yet
        if (!profile.name || !profile.surname) {
          setProfileDialogOpen(true);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Errore nel caricamento del profilo');
    }
  };

  const loadPosts = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0e1ba11c/posts/${userId}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
        
        // Aggiorna il contatore dei post
        if (!lastPostCountRef.current) {
          lastPostCountRef.current = data.length;
        }
      } else {
        if (!silent) {
          toast.error('Errore nel caricamento dei post');
        }
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      if (!silent) {
        toast.error('Errore nel caricamento dei post');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleLike = async (postId: string) => {
    // Optimistic update - aggiorna immediatamente il client
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const wasLiked = post.isLiked;
    const newLiked = !wasLiked;
    const newLikes = wasLiked ? post.likes - 1 : post.likes + 1;

    // Update immediato dello stato locale
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, isLiked: newLiked, likes: newLikes }
        : p
    ));

    // Update selected post if open
    if (selectedPost?.id === postId) {
      setSelectedPost({ ...selectedPost, isLiked: newLiked, likes: newLikes });
    }

    // Sincronizza con il database in background
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0e1ba11c/posts/${postId}/like`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        // Rollback in caso di errore
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, isLiked: wasLiked, likes: post.likes }
            : p
        ));
        if (selectedPost?.id === postId) {
          setSelectedPost({ ...selectedPost, isLiked: wasLiked, likes: post.likes });
        }
        toast.error('Errore nel like del post');
      }
    } catch (error) {
      // Rollback in caso di errore
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, isLiked: wasLiked, likes: post.likes }
          : p
      ));
      if (selectedPost?.id === postId) {
        setSelectedPost({ ...selectedPost, isLiked: wasLiked, likes: post.likes });
      }
      console.error('Error toggling like:', error);
      toast.error('Errore nel like del post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo post?')) return;

    // Ottimistic update - rimuovi immediatamente dal client
    const deletedPost = posts.find(p => p.id === postId);
    setPosts(posts.filter(p => p.id !== postId));
    setSelectedPost(null);
    toast.success('Post eliminato');

    // Sincronizza con il database in background
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0e1ba11c/posts/${postId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (response.ok) {
        loadStats(); // Aggiorna le statistiche
      } else {
        // Rollback in caso di errore
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete error:', errorData);
        if (deletedPost) {
          setPosts(prevPosts => [deletedPost, ...prevPosts]);
        }
        toast.error(`Errore nell'eliminazione: ${errorData.error || 'Permesso negato'}`);
      }
    } catch (error) {
      // Rollback in caso di errore
      if (deletedPost) {
        setPosts(prevPosts => [deletedPost, ...prevPosts]);
      }
      console.error('Error deleting post:', error);
      toast.error('Errore nell\'eliminazione del post');
    }
  };

  const handleEditPost = (post: any) => {
    setPostToEdit(post);
    setSelectedPost(null);
    setEditPostDialogOpen(true);
  };

  const handlePostUpdated = (updatedPost: any) => {
    // Optimistic update - aggiorna immediatamente il client
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
    if (selectedPost?.id === updatedPost.id) {
      setSelectedPost(updatedPost);
    }
  };

  const handlePostCreated = (newPost: any) => {
    // Optimistic update - aggiungi immediatamente al feed
    setPosts([newPost, ...posts]);
    // Non mostrare toast qui, il CreatePostDialog lo fa già
  };

  const handlePostsRefresh = () => {
    // Refresh manuale (con loading)
    loadPosts(false);
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minuto' : 'minuti'} fa`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`;
    
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const isAdmin = userProfile?.codes?.includes(ADMIN_CODE) || false;
  const isSuperAdmin = userProfile?.codes?.includes(SUPERADMIN_CODE) || false;

  // Filter and search
  const filteredFeed = posts
    .filter(item => {
      // SuperAdmin vede tutti i post
      if (isSuperAdmin) {
        // Le richieste non devono apparire in "Tutti i contenuti"
        if (activeFilter === "all" && item.type === "richieste") return false;
        return activeFilter === "all" || activeFilter === "leaderboard" || item.type === activeFilter;
      }
      
      // Le richieste non devono apparire in "Tutti i contenuti"
      if (activeFilter === "all" && item.type === "richieste") return false;
      
      // Filtro per categoria
      return activeFilter === "all" || activeFilter === "leaderboard" || item.type === activeFilter;
    })
    .filter(item => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.author.name.toLowerCase().includes(query) ||
        (item.materia && item.materia.toLowerCase().includes(query))
      );
    });

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      
      <Header 
        userProfile={userProfile ? { ...userProfile, userId } : null}
        appName={APP_NAME}
        appSubtitle={APP_SUBTITLE}
        onCreatePost={() => setCreatePostDialogOpen(true)}
        onProfileClick={() => setProfileDialogOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-foreground mb-3">
            {WELCOME_TITLE}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {WELCOME_DESCRIPTION}
          </p>
        </div>

        {/* Stats - Hidden on mobile */}
        <div className="mb-6 sm:mb-8 hidden lg:block">
          <StatsBar 
          stats={stats} 
          onStatClick={(type) => {
            if (type === 'all') {
              setActiveFilter('all');
            } else if (type === 'annunci') {
              setActiveFilter('annunci');
            } else if (type === 'appunti') {
              setActiveFilter('appunti');
            } else if (type === 'richieste') {
              setActiveFilter('richieste');
            } else if (type === 'progetti') {
              setActiveFilter('progetti');
            }
          }}
        />
        </div>

        {/* Filters */}
        <div className="mb-6 sm:mb-8">
          <FilterBar 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter}
            onLeaderboardClick={() => setLeaderboardDialogOpen(true)}
          />
        </div>

        {/* Feed */}
        {loading ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">Caricamento...</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredFeed.length > 0 ? (
              filteredFeed.map(item => (
                <FeedCard 
                  key={item.id} 
                  {...item}
                  timestamp={formatTimestamp(item.timestamp)}
                  onClick={() => setSelectedPost(item)}
                  onLike={() => handleLike(item.id)}
                  currentUserId={userId}
                  isAdmin={isAdmin || isSuperAdmin}
                  onEdit={() => handleEditPost(item)}
                  onDelete={() => handleDeletePost(item.id)}
                />
              ))
            ) : (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? 'Nessun risultato trovato per la tua ricerca.' : 'Nessun contenuto trovato per questa categoria.'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 sm:mt-16 lg:mt-20 py-8 sm:py-10 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground text-sm">
            {FOOTER_TEXT}
          </p>
          <p className="text-muted-foreground text-xs mt-2 opacity-70">
            {FOOTER_SUBTITLE}
          </p>
        </div>
      </footer>

      {/* Dialogs */}
      <ProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        userId={userId}
        adminCode={ADMIN_CODE}
        onProfileUpdate={() => {
          loadUserProfile();
          loadPosts();
        }}
      />

      <CreatePostDialog
        open={createPostDialogOpen}
        onOpenChange={setCreatePostDialogOpen}
        userId={userId}
        userProfile={userProfile}
        userCodes={userProfile?.codes || []}
        adminCode={ADMIN_CODE}
        onPostCreated={handlePostCreated}
        onPostSynced={() => loadStats()}
      />

      <EditPostDialog
        open={editPostDialogOpen}
        onOpenChange={setEditPostDialogOpen}
        post={postToEdit}
        userId={userId}
        userCodes={userProfile?.codes || []}
        adminCode={ADMIN_CODE}
        onPostUpdated={(updatedPost) => {
          handlePostUpdated(updatedPost);
          setPostToEdit(null);
        }}
      />

      {selectedPost && (
        <PostDetailDialog
          open={!!selectedPost}
          onOpenChange={(open) => !open && setSelectedPost(null)}
          post={{
            ...selectedPost,
            timestamp: formatTimestamp(selectedPost.timestamp),
          }}
          currentUserId={userId}
          userProfile={userProfile}
          isAdmin={isAdmin || isSuperAdmin}
          isSuperAdmin={isSuperAdmin}
          onLike={() => handleLike(selectedPost.id)}
          onEdit={() => handleEditPost(selectedPost)}
          onDelete={() => handleDeletePost(selectedPost.id)}
          onPostUpdated={(updatedPost) => {
            setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
            setSelectedPost(updatedPost);
          }}
        />
      )}

      <LeaderboardDialog
        open={leaderboardDialogOpen}
        onOpenChange={setLeaderboardDialogOpen}
      />
    </div>
  );
}