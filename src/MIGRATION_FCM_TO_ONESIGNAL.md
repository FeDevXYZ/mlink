# 🔄 Guida Migrazione da FCM a OneSignal

Questa guida spiega le modifiche apportate alla migrazione da Firebase Cloud Messaging (FCM) a OneSignal.

## 📋 Cosa è Cambiato

### File Rimossi ❌

- `/utils/fcm.ts` - Vecchio sistema FCM
- `/public/firebase-messaging-sw.js` - Service Worker FCM
- `/FCM_SETUP.md` - Vecchia guida setup
- `/FCM_SERVER_EXAMPLES.md` - Vecchi esempi server

### File Aggiunti ✅

- `/utils/onesignal.ts` - Nuovo sistema OneSignal
- `/ONESIGNAL_SETUP.md` - Guida setup OneSignal
- `/ONESIGNAL_SERVER_EXAMPLES.md` - Esempi server OneSignal
- `/MIGRATION_FCM_TO_ONESIGNAL.md` - Questo file

### File Modificati 📝

- `/App.tsx` - Aggiornato per usare OneSignal
- `/README.md` - Aggiornata documentazione
- `/CHANGELOG.md` - Aggiunta sezione migrazione

## 🆚 Confronto FCM vs OneSignal

### Firebase Cloud Messaging (FCM)

- ❌ Setup complesso (~30 minuti)
- ❌ Richiede configurazione Firebase Console
- ❌ Service Worker custom necessario
- ❌ Credenziali multiple (API Key, Project ID, VAPID Key, etc.)
- ❌ Configurazione separata per ogni progetto
- ⚠️ Supporto Safari limitato
- ⚠️ Documentazione complessa

### OneSignal

- ✅ Setup semplicissimo (~5 minuti)
- ✅ Un solo App ID da configurare
- ✅ Service Worker gestito automaticamente
- ✅ Dashboard intuitiva per invio notifiche
- ✅ Supporto Safari completo (iOS 16.4+)
- ✅ Gratuito fino a 10,000 utenti
- ✅ Analytics dettagliati inclusi
- ✅ Segmentazione utenti avanzata

## 🔄 Modifiche al Codice

### Prima (FCM)

```typescript
// App.tsx
import * as FCM from "./utils/fcm";

// Setup
const fcmToken = await FCM.requestFCMPermission();
if (fcmToken) {
  console.log("FCM Token:", fcmToken);
  await FCM.sendTokenToServer(fcmToken, userId);

  FCM.onFCMMessage((payload) => {
    console.log("Notifica ricevuta:", payload);
  });
}
```

### Dopo (OneSignal)

```typescript
// App.tsx
import * as OneSignal from "./utils/onesignal";

// Setup
const pushEnabled = await OneSignal.requestPushPermission();
if (pushEnabled) {
  const playerId = await OneSignal.getPlayerId();
  console.log("OneSignal Player ID:", playerId);
  await OneSignal.sendPlayerIdToServer(playerId, userId);

  OneSignal.onNotificationReceived((notification) => {
    console.log("Notifica ricevuta:", notification);
  });
}
```

## 🔑 Equivalenza Terminologia

| FCM                      | OneSignal                 |
| ------------------------ | ------------------------- |
| FCM Token                | Player ID                 |
| VAPID Key                | App ID                    |
| REST API Key             | REST API Key              |
| Service Worker           | Gestito automaticamente   |
| firebase.initializeApp() | OneSignal.init()          |
| getToken()               | getUserId()               |
| onMessage()              | on('notificationDisplay') |

## 📨 Invio Notifiche dal Server

### Prima (FCM)

```javascript
const response = await fetch('https://fcm.googleapis.com/fcm/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `key=${SERVER_KEY}` // Server Key complessa
  },
  body: JSON.stringify({
    to: fcmToken, // Token specifico
    notification: {
      title: 'Nuovo Post',
      body: 'Controlla le novità',
      icon: '/favicon.ico'
    },
    data: { postId: '123' }
  })
});
```

### Dopo (OneSignal)

```javascript
const response = await fetch('https://onesignal.com/api/v1/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${REST_API_KEY}` // Una sola chiave
  },
  body: JSON.stringify({
    app_id: APP_ID, // Un solo ID
    include_player_ids: [playerId], // Player ID specifico
    // Oppure:
    included_segments: ['All'], // Invia a tutti
    headings: { en: 'Nuovo Post' },
    contents: { en: 'Controlla le novità' },
    data: { postId: '123' }
  })
});
```

## 🚀 Come Migrare il Tuo Progetto

### Step 1: Rimuovi Firebase

```bash
# 1. Elimina le dipendenze Firebase (se nel package.json)
npm uninstall firebase

# 2. Rimuovi i file FCM
rm utils/fcm.ts
rm public/firebase-messaging-sw.js
```

### Step 2: Installa OneSignal

Non è necessario installare nulla! OneSignal si carica via CDN automaticamente.

### Step 3: Configura OneSignal

1. Vai su [https://onesignal.com](https://onesignal.com)
2. Crea account gratuito
3. Crea app Web Push
4. Copia App ID
5. Incolla in `/utils/onesignal.ts`:

```typescript
const ONESIGNAL_APP_ID = "IL_TUO_APP_ID_QUI";
```

### Step 4: Aggiorna il Codice

Sostituisci tutti gli import FCM con OneSignal:

```typescript
// Prima
import * as FCM from "./utils/fcm";

// Dopo
import * as OneSignal from "./utils/onesignal";
```

### Step 5: Aggiorna Database (Opzionale)

Se salvavi i token FCM nel database, aggiorna per salvare Player ID:

```sql
-- Rinomina colonna (esempio)
ALTER TABLE users RENAME COLUMN fcm_token TO onesignal_player_id;
```

### Step 6: Testa

1. Apri l'app
2. Consenti notifiche quando richiesto
3. Controlla console: dovresti vedere "OneSignal attivato con successo! ✅"
4. Invia notifica di test dal dashboard OneSignal

## 🐛 Risoluzione Problemi Comuni

### "OneSignal is not defined"

**Causa**: Script OneSignal non caricato  
**Soluzione**: Verifica connessione internet, controlla console per errori

### "Invalid App ID"

**Causa**: App ID errato in `/utils/onesignal.ts`  
**Soluzione**: Verifica App ID nella dashboard OneSignal (Settings > Keys & IDs)

### Le notifiche non arrivano

**Causa**: Permessi non concessi o configurazione errata  
**Soluzione**:

1. Verifica permessi notifiche nel browser
2. Controlla che l'App ID sia corretto
3. Controlla console per errori

### Player ID è null

**Causa**: Utente non ha concesso permessi  
**Soluzione**: Chiama `requestPushPermission()` e assicurati che restituisca true

## 📊 Vantaggi Immediati Dopo la Migrazione

### Per gli Sviluppatori

- ⚡ 80% meno codice da mantenere
- 🎯 Setup in 5 minuti invece di 30+
- 📖 Documentazione più chiara
- 🐛 Meno bug da gestire
- 🔧 Configurazione più semplice

### Per gli Utenti

- 🌍 Supporto più ampio (incluso Safari)
- ⚡ Notifiche più veloci
- 📱 Esperienza migliore su mobile
- 🎨 Notifiche più personalizzabili

### Per gli Admin

- 📊 Dashboard per analytics
- 📨 Invio manuale di notifiche senza codice
- 🎯 Segmentazione utenti avanzata
- 📈 Report dettagliati
- 🔔 A/B testing delle notifiche

## 🎓 Risorse Utili

### Documentazione OneSignal

- [Quickstart Web Push](https://documentation.onesignal.com/docs/web-push-quickstart)
- [REST API](https://documentation.onesignal.com/reference/create-notification)
- [Dashboard Overview](https://documentation.onesignal.com/docs/dashboard-overview)

### Guide Marconi Link

- [Setup OneSignal](/ONESIGNAL_SETUP.md)
- [Esempi Server](/ONESIGNAL_SERVER_EXAMPLES.md)
- [README](/README.md)

## ⚠️ Note Importanti

1. **I token FCM esistenti non sono compatibili** con OneSignal
   - Gli utenti dovranno concedere nuovamente il permesso notifiche
   - Questo succederà automaticamente al prossimo accesso

2. **Service Worker**
   - OneSignal registra automaticamente il proprio service worker
   - Non è necessario creare `/public/firebase-messaging-sw.js`

3. **API Keys**
   - REST API Key di OneSignal è diversa da quella di Firebase
   - Aggiornala nelle variabili d'ambiente del server

4. **Testing**
   - Testa sempre in ambiente di sviluppo prima di deployare
   - Usa "Send to Test User" nel dashboard OneSignal

## 🎉 Conclusione

La migrazione da FCM a OneSignal è stata fatta per semplificare lo sviluppo e migliorare l'esperienza utente. OneSignal offre tutte le funzionalità di FCM con una configurazione molto più semplice e funzionalità aggiuntive gratuite.

**Tempo stimato per migrare**: ~15 minuti  
**Benefici a lungo termine**: Infiniti 🚀

---

**Domande?** Apri una issue su GitHub o consulta la [documentazione OneSignal](https://documentation.onesignal.com).