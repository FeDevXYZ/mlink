# 🔔 Configurazione OneSignal - Notifiche Push

OneSignal è un sistema di notifiche push gratuito e molto più semplice da configurare rispetto a Firebase Cloud Messaging (FCM). Funziona perfettamente su GitHub Pages e supporta sia Web che Mobile.

## 📋 Vantaggi di OneSignal

✅ **Gratuito fino a 10,000 utenti**  
✅ **Setup semplicissimo** (5 minuti)  
✅ **Funziona su GitHub Pages** senza problemi  
✅ **Supporto Web + Mobile** (iOS, Android)  
✅ **Dashboard intuitiva** per inviare notifiche  
✅ **No service worker custom** richiesto  
✅ **Segmentazione utenti** con tag  

## 🚀 Setup Rapido (5 minuti)

### 1️⃣ Crea un Account OneSignal

1. Vai su [https://onesignal.com](https://onesignal.com)
2. Clicca su **"Get Started Free"**
3. Registrati con email o Google

### 2️⃣ Crea una Nuova App

1. Nel dashboard, clicca **"New App/Website"**
2. Inserisci il nome della tua app (es: "Marconi Link")
3. Seleziona **"Web"** come piattaforma
4. Clicca **"Next: Configure Your Platform"**

### 3️⃣ Configura Web Push

OneSignal ti chiederà di configurare il dominio:

#### Per GitHub Pages:
- **Site URL**: `https://tuousername.github.io`
- **Default Notification Icon URL**: `https://tuousername.github.io/favicon.ico`
- **Auto Resubscribe**: ✅ Attivo (raccomandato)

#### Per Dominio Personalizzato:
- **Site URL**: `https://tuodominio.com`
- **Default Notification Icon URL**: `https://tuodominio.com/favicon.ico`
- **Auto Resubscribe**: ✅ Attivo

### 4️⃣ Ottieni il tuo App ID

1. Una volta completato il setup, vai su **"Settings" > "Keys & IDs"**
2. Copia il tuo **OneSignal App ID** (formato: `12345678-1234-1234-1234-123456789012`)
3. **IMPORTANTE**: Salva anche la tua **REST API Key** (la userai per inviare notifiche dal server)

### 5️⃣ Configura il Codice

Apri il file `/utils/onesignal.ts` e sostituisci:

```typescript
const ONESIGNAL_APP_ID = "YOUR_ONESIGNAL_APP_ID";
```

con il tuo App ID:

```typescript
const ONESIGNAL_APP_ID = "12345678-1234-1234-1234-123456789012";
```

### 6️⃣ Testa le Notifiche

1. Apri la tua app in un browser (Chrome, Firefox, Edge, Safari)
2. Al primo accesso, dovrebbe apparire un popup che chiede il permesso per le notifiche
3. Clicca **"Consenti"**
4. Verifica nella console del browser se vedi: `OneSignal attivato con successo! ✅`

## 📨 Inviare Notifiche

### Metodo 1: Dashboard OneSignal (Più Semplice)

1. Vai su [OneSignal Dashboard](https://app.onesignal.com)
2. Seleziona la tua app
3. Clicca su **"Messages" > "New Push"**
4. Compila:
   - **Title**: Titolo della notifica (es: "Nuovo Post!")
   - **Message**: Testo della notifica (es: "Controlla le ultime novità")
   - **Launch URL**: (opzionale) dove portare l'utente quando clicca
5. Clicca **"Send to All Subscribers"** per inviare a tutti
6. Oppure usa **"Segment"** per inviare a specifici gruppi

### Metodo 2: API REST (Per il Backend)

Se vuoi inviare notifiche automaticamente dal tuo server (es: quando viene creato un nuovo post), usa l'API REST:

```javascript
// Esempio Node.js
async function sendNotification(title, message) {
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic YOUR_REST_API_KEY' // Dalla dashboard OneSignal
    },
    body: JSON.stringify({
      app_id: 'YOUR_ONESIGNAL_APP_ID',
      included_segments: ['All'], // Invia a tutti
      headings: { en: title },
      contents: { en: message },
      url: 'https://tuousername.github.io' // URL quando cliccano la notifica
    })
  });
  
  return response.json();
}

// Uso
await sendNotification('🆕 Nuovo Post!', 'Controlla le ultime novità della community');
```

### Metodo 3: Notifiche Mirate a Specifici Utenti

Per inviare notifiche a specifici utenti, devi salvare il loro Player ID sul server:

```javascript
// 1. Salva il Player ID quando l'utente si registra
// Il codice in App.tsx chiama automaticamente sendPlayerIdToServer()

// 2. Recupera il Player ID dal database quando vuoi inviare una notifica
const playerId = await getPlayerIdFromDatabase(userId);

// 3. Invia la notifica
async function sendNotificationToUser(playerId, title, message) {
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic YOUR_REST_API_KEY'
    },
    body: JSON.stringify({
      app_id: 'YOUR_ONESIGNAL_APP_ID',
      include_player_ids: [playerId], // Invia solo a questo utente
      headings: { en: title },
      contents: { en: message }
    })
  });
  
  return response.json();
}
```

## 🏷️ Segmentazione con Tag

OneSignal permette di segmentare gli utenti con tag personalizzati. Il codice in `App.tsx` imposta automaticamente:
- `userId`: ID univoco dell'utente
- `userName`: Nome dell'utente

Puoi aggiungere altri tag:

```typescript
await OneSignal.setUserTags({
  classe: '3A',
  materia: 'matematica',
  ruolo: 'studente'
});
```

Poi inviare notifiche solo agli utenti con specifici tag:

```javascript
{
  app_id: 'YOUR_ONESIGNAL_APP_ID',
  filters: [
    { field: 'tag', key: 'classe', relation: '=', value: '3A' },
    { operator: 'AND' },
    { field: 'tag', key: 'materia', relation: '=', value: 'matematica' }
  ],
  headings: { en: 'Compiti di Matematica' },
  contents: { en: 'Nuovi compiti caricati per la classe 3A' }
}
```

## 🔧 Implementazione nel Server Supabase

Se vuoi inviare notifiche automaticamente quando viene creato un nuovo post, aggiungi questo codice al tuo server Supabase (`/supabase/functions/server/index.tsx`):

```typescript
// Funzione per inviare notifica OneSignal
async function sendOneSignalNotification(title: string, message: string, url?: string) {
  const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID';
  const ONESIGNAL_REST_API_KEY = 'YOUR_REST_API_KEY';
  
  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ['All'],
        headings: { en: title, it: title },
        contents: { en: message, it: message },
        url: url || undefined
      })
    });
    
    const data = await response.json();
    console.log('OneSignal response:', data);
    return data;
  } catch (error) {
    console.error('Errore invio notifica OneSignal:', error);
  }
}

// Esempio: Invia notifica quando viene creato un nuovo post
if (pathname === '/create-post') {
  // ... codice per creare il post ...
  
  // Invia notifica a tutti gli utenti
  await sendOneSignalNotification(
    '🆕 Nuovo Post!',
    `${author.name} ha pubblicato: ${title}`,
    'https://tuousername.github.io'
  );
}
```

## 📊 Analytics e Statistiche

OneSignal ti fornisce statistiche dettagliate:
- **Delivery**: Quante notifiche sono state consegnate
- **Click Rate**: Quanti utenti hanno cliccato
- **Conversion Rate**: Quanti hanno completato un'azione
- **Best Time to Send**: Orario migliore per inviare

Vai su **"Analytics"** nel dashboard per vederle.

## 🎯 Best Practices

### 1. Non Inviare Troppe Notifiche
- Massimo 1-2 notifiche al giorno
- Invia solo contenuti importanti e rilevanti

### 2. Usa Titoli Accattivanti
- ✅ "🔥 Nuovo progetto da non perdere!"
- ❌ "Nuovo contenuto"

### 3. Personalizza le Notifiche
- Usa il nome dell'utente: "Ciao Mario, nuovo post per te!"
- Segmenta per interessi: invia notifiche di matematica solo a chi la studia

### 4. Testa Prima di Inviare
- Usa "Send to Test User" nel dashboard
- Invia prima a te stesso per controllare

### 5. Ottimizza gli Orari
- Non inviare di notte (00:00 - 07:00)
- Orari migliori: 12:00-13:00 (pausa pranzo) e 18:00-20:00 (dopo scuola)

## 🐛 Risoluzione Problemi

### Le notifiche non vengono ricevute

1. **Controlla il permesso del browser**
   - Vai su `Impostazioni > Notifiche` nel browser
   - Verifica che il tuo sito abbia il permesso "Consenti"

2. **Verifica l'App ID**
   - Controlla che l'App ID in `/utils/onesignal.ts` sia corretto
   - Verifica nella console del browser se ci sono errori

3. **Controlla la connessione HTTPS**
   - OneSignal richiede HTTPS (GitHub Pages lo ha di default)
   - Per localhost, usa `http://localhost` (è supportato)

4. **Service Worker**
   - OneSignal registra automaticamente il service worker
   - Vai su `DevTools > Application > Service Workers` per verificare

### L'utente non vede il popup di permesso

- Alcuni browser bloccano i popup automatici
- Usa `OneSignal.showSlidedownPrompt()` per mostrare il prompt manualmente
- Aggiungi un pulsante "Attiva Notifiche" nella UI

### Le notifiche non vengono inviate dal server

1. Verifica la REST API Key
2. Controlla i log del server per errori
3. Testa l'endpoint con Postman o curl

## 📱 Supporto Browser

OneSignal supporta:
- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Edge
- ✅ Safari 16+ (richiede configurazione extra)
- ✅ Opera
- ❌ Safari iOS < 16.4

## 🆘 Supporto

- **Documentazione**: [https://documentation.onesignal.com](https://documentation.onesignal.com)
- **Forum**: [https://forums.onesignal.com](https://forums.onesignal.com)
- **Email**: support@onesignal.com

## 🎓 Risorse Utili

- [OneSignal Web Push Quickstart](https://documentation.onesignal.com/docs/web-push-quickstart)
- [REST API Reference](https://documentation.onesignal.com/reference/create-notification)
- [Segmentation Guide](https://documentation.onesignal.com/docs/segmentation)
- [Testing Guide](https://documentation.onesignal.com/docs/testing-guide)

---

**🎉 Fatto! Ora la tua app supporta le notifiche push con OneSignal!**
