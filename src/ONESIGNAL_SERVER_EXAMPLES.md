# 📨 OneSignal - Esempi Server per Notifiche Automatiche

Questa guida mostra come integrare OneSignal nel tuo backend per inviare notifiche push automatiche quando succedono eventi nell'app (nuovo post, nuovo commento, etc.).

## 🔑 Prerequisiti

Prima di iniziare, assicurati di avere:
1. **OneSignal App ID** (dalla dashboard OneSignal)
2. **REST API Key** (da Settings > Keys & IDs)

## 📋 Scenari di Utilizzo

### 1️⃣ Notifica Nuovo Post

Invia una notifica a tutti gli utenti quando viene creato un nuovo post.

```typescript
// Esempio per Supabase Edge Function
async function notifyNewPost(post: any) {
  const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID';
  const ONESIGNAL_REST_API_KEY = 'YOUR_REST_API_KEY';
  
  // Emoji in base al tipo di post
  const emoji = {
    'annunci': '📢',
    'appunti': '📝',
    'progetti': '🚀',
    'eventi': '📅',
    'richieste': '🙋'
  };
  
  const icon = emoji[post.type] || '🆕';
  
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      included_segments: ['All'], // Invia a tutti
      headings: {
        en: `${icon} Nuovo ${post.type.slice(0, -1)}!`,
        it: `${icon} Nuovo ${post.type.slice(0, -1)}!`
      },
      contents: {
        en: `${post.author.name}: ${post.title}`,
        it: `${post.author.name}: ${post.title}`
      },
      url: `https://tuousername.github.io`, // URL della tua app
      data: {
        postId: post.id,
        postType: post.type,
        action: 'new_post'
      }
    })
  });
  
  return response.json();
}

// Uso nell'endpoint di creazione post
if (pathname === '/create-post') {
  const newPost = await createPost(postData);
  
  // Invia notifica in background (non bloccare la risposta)
  notifyNewPost(newPost).catch(err => 
    console.error('Errore notifica:', err)
  );
  
  return Response.json(newPost);
}
```

### 2️⃣ Notifica Nuovo Commento

Invia una notifica solo all'autore del post quando qualcuno commenta.

```typescript
async function notifyNewComment(comment: any, post: any, authorPlayerId: string) {
  const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID';
  const ONESIGNAL_REST_API_KEY = 'YOUR_REST_API_KEY';
  
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      include_player_ids: [authorPlayerId], // Invia solo all'autore del post
      headings: {
        en: `💬 Nuovo commento da ${comment.author.name}`,
        it: `💬 Nuovo commento da ${comment.author.name}`
      },
      contents: {
        en: `Ha commentato su: "${post.title}"`,
        it: `Ha commentato su: "${post.title}"`
      },
      data: {
        postId: post.id,
        commentId: comment.id,
        action: 'new_comment'
      }
    })
  });
  
  return response.json();
}

// Uso nell'endpoint di creazione commento
if (pathname === '/add-comment') {
  const newComment = await createComment(commentData);
  
  // Recupera il Player ID dell'autore del post dal database
  const postAuthorPlayerId = await getPlayerIdByUserId(post.author.id);
  
  if (postAuthorPlayerId) {
    notifyNewComment(newComment, post, postAuthorPlayerId).catch(err =>
      console.error('Errore notifica:', err)
    );
  }
  
  return Response.json(newComment);
}
```

### 3️⃣ Notifica Nuovo Like

Invia una notifica all'autore quando qualcuno mette like.

```typescript
async function notifyNewLike(post: any, likerName: string, authorPlayerId: string) {
  const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID';
  const ONESIGNAL_REST_API_KEY = 'YOUR_REST_API_KEY';
  
  // Non inviare notifica se l'autore mette like al proprio post
  if (!authorPlayerId) return;
  
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      include_player_ids: [authorPlayerId],
      headings: {
        en: `❤️ A ${likerName} piace il tuo post`,
        it: `❤️ A ${likerName} piace il tuo post`
      },
      contents: {
        en: `"${post.title}"`,
        it: `"${post.title}"`
      },
      data: {
        postId: post.id,
        action: 'new_like'
      }
    })
  });
  
  return response.json();
}
```

### 4️⃣ Notifica Annuncio Importante

Invia una notifica con priorità alta per annunci importanti (solo admin).

```typescript
async function notifyImportantAnnouncement(announcement: any) {
  const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID';
  const ONESIGNAL_REST_API_KEY = 'YOUR_REST_API_KEY';
  
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      included_segments: ['All'],
      headings: {
        en: `🚨 Annuncio Importante`,
        it: `🚨 Annuncio Importante`
      },
      contents: {
        en: announcement.title,
        it: announcement.title
      },
      priority: 10, // Priorità massima
      ttl: 86400, // Valida per 24 ore
      android_channel_id: 'important', // Canale Android personalizzato
      data: {
        postId: announcement.id,
        action: 'important_announcement'
      }
    })
  });
  
  return response.json();
}
```

### 5️⃣ Notifica Evento Imminente

Ricorda agli utenti un evento che inizia tra poco.

```typescript
async function notifyUpcomingEvent(event: any, hoursUntil: number) {
  const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID';
  const ONESIGNAL_REST_API_KEY = 'YOUR_REST_API_KEY';
  
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      // Invia solo agli utenti interessati (tag)
      filters: [
        { field: 'tag', key: 'interested_in_events', relation: '=', value: 'true' }
      ],
      headings: {
        en: `⏰ Evento tra ${hoursUntil} ${hoursUntil === 1 ? 'ora' : 'ore'}!`,
        it: `⏰ Evento tra ${hoursUntil} ${hoursUntil === 1 ? 'ora' : 'ore'}!`
      },
      contents: {
        en: `${event.title} - ${event.location}`,
        it: `${event.title} - ${event.location}`
      },
      data: {
        postId: event.id,
        eventDate: event.eventDate,
        action: 'event_reminder'
      }
    })
  });
  
  return response.json();
}

// Cron job per controllare eventi imminenti (da eseguire ogni ora)
async function checkUpcomingEvents() {
  const events = await getEventsInNext24Hours();
  
  for (const event of events) {
    const hoursUntil = Math.floor((new Date(event.eventDate).getTime() - Date.now()) / 3600000);
    
    // Notifica 24h, 6h, 1h prima
    if ([24, 6, 1].includes(hoursUntil)) {
      await notifyUpcomingEvent(event, hoursUntil);
    }
  }
}
```

### 6️⃣ Notifica Posizione Classifica

Notifica un utente quando la sua posizione in classifica cambia.

```typescript
async function notifyLeaderboardChange(
  userId: string,
  playerIds: string[],
  newPosition: number,
  oldPosition: number
) {
  const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID';
  const ONESIGNAL_REST_API_KEY = 'YOUR_REST_API_KEY';
  
  const isImprovement = newPosition < oldPosition;
  const emoji = newPosition === 1 ? '🏆' : newPosition === 2 ? '🥈' : newPosition === 3 ? '🥉' : isImprovement ? '📈' : '📉';
  
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      include_player_ids: playerIds,
      headings: {
        en: `${emoji} Classifica aggiornata!`,
        it: `${emoji} Classifica aggiornata!`
      },
      contents: {
        en: isImprovement 
          ? `Congratulazioni! Sei salito alla posizione ${newPosition}!`
          : `Sei sceso alla posizione ${newPosition}. Continua a contribuire! 💪`,
        it: isImprovement 
          ? `Congratulazioni! Sei salito alla posizione ${newPosition}!`
          : `Sei sceso alla posizione ${newPosition}. Continua a contribuire! 💪`
      },
      data: {
        userId,
        newPosition,
        oldPosition,
        action: 'leaderboard_change'
      }
    })
  });
  
  return response.json();
}
```

## 🏷️ Segmentazione Avanzata

### Notifica per Materia

```typescript
async function notifyBySubject(post: any, materia: string) {
  const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID';
  const ONESIGNAL_REST_API_KEY = 'YOUR_REST_API_KEY';
  
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      filters: [
        { field: 'tag', key: 'materia', relation: '=', value: materia }
      ],
      headings: {
        en: `📚 Nuovi appunti di ${materia}`,
        it: `📚 Nuovi appunti di ${materia}`
      },
      contents: {
        en: post.title,
        it: post.title
      }
    })
  });
  
  return response.json();
}
```

### Notifica per Classe

```typescript
async function notifyByClass(message: string, classe: string) {
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      filters: [
        { field: 'tag', key: 'classe', relation: '=', value: classe }
      ],
      headings: {
        en: `📋 Comunicazione per la ${classe}`,
        it: `📋 Comunicazione per la ${classe}`
      },
      contents: {
        en: message,
        it: message
      }
    })
  });
  
  return response.json();
}
```

## 🔄 Integrazione Completa nel Server Supabase

Ecco come integrare OneSignal nel tuo file `/supabase/functions/server/index.tsx`:

```typescript
// All'inizio del file, aggiungi le costanti
const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID';
const ONESIGNAL_REST_API_KEY = 'YOUR_REST_API_KEY';

// Funzione helper per inviare notifiche
async function sendPushNotification(
  payload: {
    targetType: 'all' | 'user' | 'segment';
    playerIds?: string[];
    filters?: any[];
    title: string;
    message: string;
    url?: string;
    data?: any;
  }
) {
  try {
    const body: any = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: payload.title, it: payload.title },
      contents: { en: payload.message, it: payload.message },
      url: payload.url || undefined,
      data: payload.data || undefined,
    };

    if (payload.targetType === 'all') {
      body.included_segments = ['All'];
    } else if (payload.targetType === 'user' && payload.playerIds) {
      body.include_player_ids = payload.playerIds;
    } else if (payload.targetType === 'segment' && payload.filters) {
      body.filters = payload.filters;
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    console.log('OneSignal notification sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return null;
  }
}

// Esempio di uso nell'endpoint create-post
if (pathname === '/create-post') {
  const newPost = await createPost(postData);
  
  // Invia notifica push
  const emoji = { 'annunci': '📢', 'appunti': '📝', 'progetti': '🚀' };
  sendPushNotification({
    targetType: 'all',
    title: `${emoji[newPost.type]} Nuovo ${newPost.type.slice(0, -1)}!`,
    message: `${newPost.author.name}: ${newPost.title}`,
    data: { postId: newPost.id, action: 'new_post' }
  }).catch(err => console.error('Push error:', err));
  
  return Response.json(newPost);
}
```

## 📊 Salvare i Player ID nel Database

Per inviare notifiche mirate, devi salvare il Player ID di ogni utente:

```typescript
// Endpoint per salvare il Player ID
if (pathname === '/save-player-id') {
  const { userId, playerId } = await request.json();
  
  // Salva nel KV store
  await kv.set(`player_id:${userId}`, playerId);
  
  return Response.json({ success: true });
}

// Endpoint per recuperare il Player ID
async function getPlayerIdByUserId(userId: string): Promise<string | null> {
  return await kv.get(`player_id:${userId}`);
}
```

Poi nel file `/utils/onesignal.ts`, modifica `sendPlayerIdToServer`:

```typescript
export async function sendPlayerIdToServer(playerId: string, userId: string): Promise<void> {
  try {
    await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-0e1ba11c/save-player-id`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ userId, playerId }),
      }
    );
    console.log('Player ID salvato sul server');
  } catch (error) {
    console.error('Errore salvataggio Player ID:', error);
  }
}
```

## 🎯 Best Practices

1. **Non bloccare le risposte**: Invia le notifiche in background con `.catch()`
2. **Rate limiting**: Non inviare più di 1 notifica per evento
3. **Testa sempre**: Usa "Send to Test User" prima di inviare a tutti
4. **Personalizza**: Usa i tag per inviare notifiche rilevanti
5. **Monitora**: Controlla le analytics nel dashboard OneSignal

## 🔒 Sicurezza

⚠️ **IMPORTANTE**: La REST API Key deve rimanere segreta!
- ✅ Usala solo nel backend/server
- ❌ Non esporla mai nel frontend
- ✅ Usa variabili d'ambiente per memorizzarla

---

**🎉 Ora puoi inviare notifiche push automatiche dal tuo server!**
