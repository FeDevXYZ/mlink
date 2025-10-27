// Sistema di notifiche nativo del browser - Gratuito e senza limiti

export interface NotificationState {
  userPosition: number;
  userLikes: number;
  lastAnnouncementId: string | null;
  lastCommunicationId: string | null;
  userPostComments: Record<string, number>; // postId -> comment count
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Browser non supporta le notifiche');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (error) {
      console.error('Errore invio notifica:', error);
    }
  }
}

export function checkLeaderboardChange(
  oldPosition: number,
  newPosition: number,
  userName: string
) {
  if (oldPosition === 0 || newPosition === 0) return; // Prima volta

  if (newPosition < oldPosition) {
    // Salito in classifica
    const emoji = newPosition === 1 ? '🏆' : newPosition === 2 ? '🥈' : newPosition === 3 ? '🥉' : '🎉';
    showNotification(
      `${emoji} Grande, ${userName}!`,
      {
        body: `Sei arrivato al ${newPosition}° posto nella classifica!`,
        tag: 'leaderboard-up',
      }
    );
  } else if (newPosition > oldPosition) {
    // Sceso in classifica
    showNotification(
      `📉 ${userName}, sei sceso alla posizione ${newPosition}`,
      {
        body: 'Cavolo! Continua a contribuire per risalire! 💪',
        tag: 'leaderboard-down',
      }
    );
  }
}

export function checkNewLikes(
  oldLikes: number,
  newLikes: number,
  userName: string
) {
  if (oldLikes === 0) return; // Prima volta

  const diff = newLikes - oldLikes;
  if (diff > 0) {
    const emoji = diff >= 5 ? '🔥' : diff >= 3 ? '❤️' : '👍';
    showNotification(
      `${emoji} Nuovi like, ${userName}!`,
      {
        body: `Hai ricevuto ${diff} nuov${diff === 1 ? 'o' : 'i'} like sui tuoi post!`,
        tag: 'new-likes',
      }
    );
  }
}

export function notifyNewAnnouncement(title: string) {
  showNotification(
    '📢 Nuovo Annuncio!',
    {
      body: title,
      tag: 'new-announcement',
      requireInteraction: true, // Rimane finché non viene cliccata
    }
  );
}

export function notifyNewCommunication(title: string) {
  showNotification(
    '📋 Nuova Comunicazione!',
    {
      body: title,
      tag: 'new-communication',
      requireInteraction: true,
    }
  );
}

export function notifyNewComment(
  authorName: string,
  postType: 'appunti' | 'video' | 'progetti' | 'annunci' | 'comunicazioni',
  postTitle: string
) {
  const typeLabels = {
    'appunti': 'appunti',
    'video': 'video',
    'progetti': 'progetto',
    'annunci': 'annuncio',
    'comunicazioni': 'comunicazione',
  };

  showNotification(
    `💬 Nuovo commento da ${authorName}`,
    {
      body: `Ha commentato sotto i tuoi ${typeLabels[postType]}: "${postTitle}"`,
      tag: 'new-comment',
    }
  );
}

export function notifyNewLike(
  authorName: string,
  postTitle: string
) {
  showNotification(
    `❤️ ${authorName} ha messo like`,
    {
      body: `Al tuo post: "${postTitle}"`,
      tag: 'new-like',
    }
  );
}

// Salva lo stato nel localStorage
export function saveNotificationState(userId: string, state: NotificationState) {
  localStorage.setItem(`notification_state_${userId}`, JSON.stringify(state));
}

// Carica lo stato dal localStorage
export function loadNotificationState(userId: string): NotificationState | null {
  const saved = localStorage.getItem(`notification_state_${userId}`);
  if (!saved) return null;
  
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}
