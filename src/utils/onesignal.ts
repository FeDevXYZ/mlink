// OneSignal - Sistema di notifiche push per Web e Mobile
// Molto più semplice di FCM e funziona perfettamente su GitHub Pages

// CONFIGURAZIONE ONESIGNAL
// 1. Vai su https://onesignal.com e crea un account gratuito
// 2. Crea una nuova app Web Push
// 3. Segui il wizard di configurazione (ti chiederà il dominio del tuo sito)
// 4. Sostituisci YOUR_ONESIGNAL_APP_ID con il tuo App ID
const ONESIGNAL_APP_ID = "c8b1aa7c-66f2-4778-9749-1a11d4c2a670"; // Es: "12345678-1234-1234-1234-123456789012"

// Se stai usando un Safari Web ID (opzionale, solo per Safari su iOS/macOS)
const SAFARI_WEB_ID = ""; // Lascia vuoto se non usi Safari Web Push

let oneSignalInitialized = false;

// Inizializza OneSignal
export async function initializeOneSignal(): Promise<boolean> {
  try {
    // Controlla se OneSignal è già caricato
    if (oneSignalInitialized) {
      console.log('OneSignal già inizializzato');
      return true;
    }

    // Verifica che siamo in un ambiente browser
    if (typeof window === 'undefined') {
      console.log('OneSignal richiede un ambiente browser');
      return false;
    }

    // Carica lo script OneSignal
    if (!(window as any).OneSignal) {
      await loadOneSignalScript();
    }

    const OneSignal = (window as any).OneSignal;
    
    // Inizializza OneSignal
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      safari_web_id: SAFARI_WEB_ID || undefined,
      notifyButton: {
        enable: false, // Non mostrare il pulsante di notifica di default
      },
      allowLocalhostAsSecureOrigin: true, // Permette di testare su localhost
    });

    oneSignalInitialized = true;
    console.log('OneSignal inizializzato con successo!');
    
    // Log dello stato delle notifiche
    const isPushSupported = await OneSignal.isPushNotificationsSupported();
    console.log('Push notifications supportate:', isPushSupported);
    
    return true;
  } catch (error) {
    console.error('Errore inizializzazione OneSignal:', error);
    return false;
  }
}

// Carica lo script OneSignal dinamicamente
function loadOneSignalScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).OneSignal) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Script OneSignal caricato');
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Errore nel caricamento dello script OneSignal'));
    };
    
    document.head.appendChild(script);
  });
}

// Richiedi permesso e sottoscrivi l'utente alle notifiche push
export async function requestPushPermission(): Promise<boolean> {
  try {
    const initialized = await initializeOneSignal();
    if (!initialized) {
      console.log('OneSignal non inizializzato');
      return false;
    }

    const OneSignal = (window as any).OneSignal;
    
    // Controlla se le notifiche push sono supportate
    const isSupported = await OneSignal.isPushNotificationsSupported();
    if (!isSupported) {
      console.log('Le notifiche push non sono supportate in questo browser');
      return false;
    }

    // Controlla lo stato attuale del permesso
    const permissionState = await OneSignal.getNotificationPermission();
    console.log('Stato permesso notifiche:', permissionState);

    if (permissionState === 'granted') {
      console.log('Permesso già concesso');
      return true;
    }

    if (permissionState === 'denied') {
      console.log('Permesso negato dall\'utente');
      return false;
    }

    // Richiedi permesso all'utente
    await OneSignal.showSlidedownPrompt();
    
    // Aspetta che l'utente risponda
    const newPermission = await OneSignal.getNotificationPermission();
    
    if (newPermission === 'granted') {
      console.log('Permesso concesso! ✅');
      
      // Ottieni e salva il Player ID (identificativo univoco dell'utente)
      const playerId = await OneSignal.getUserId();
      if (playerId) {
        localStorage.setItem('onesignal_player_id', playerId);
        console.log('Player ID:', playerId);
      }
      
      return true;
    } else {
      console.log('Permesso non concesso');
      return false;
    }
  } catch (error) {
    console.error('Errore richiesta permesso OneSignal:', error);
    return false;
  }
}

// Ottieni il Player ID dell'utente (identificativo univoco)
export async function getPlayerId(): Promise<string | null> {
  try {
    const initialized = await initializeOneSignal();
    if (!initialized) return null;

    const OneSignal = (window as any).OneSignal;
    const playerId = await OneSignal.getUserId();
    
    if (playerId) {
      localStorage.setItem('onesignal_player_id', playerId);
    }
    
    return playerId;
  } catch (error) {
    console.error('Errore ottenimento Player ID:', error);
    return null;
  }
}

// Ottieni il Player ID salvato in localStorage
export function getSavedPlayerId(): string | null {
  return localStorage.getItem('onesignal_player_id');
}

// Aggiungi tag all'utente (utile per segmentazione)
export async function setUserTags(tags: Record<string, string>): Promise<void> {
  try {
    const initialized = await initializeOneSignal();
    if (!initialized) return;

    const OneSignal = (window as any).OneSignal;
    await OneSignal.sendTags(tags);
    console.log('Tag utente aggiornati:', tags);
  } catch (error) {
    console.error('Errore impostazione tag:', error);
  }
}

// Rimuovi tag dall'utente
export async function removeUserTags(tagKeys: string[]): Promise<void> {
  try {
    const initialized = await initializeOneSignal();
    if (!initialized) return;

    const OneSignal = (window as any).OneSignal;
    await OneSignal.deleteTags(tagKeys);
    console.log('Tag rimossi:', tagKeys);
  } catch (error) {
    console.error('Errore rimozione tag:', error);
  }
}

// Ascolta quando arrivano notifiche (foreground)
export function onNotificationReceived(callback: (notification: any) => void): void {
  if (typeof window === 'undefined') return;
  
  const OneSignal = (window as any).OneSignal;
  if (!OneSignal) return;

  OneSignal.push(() => {
    OneSignal.on('notificationDisplay', (event: any) => {
      console.log('Notifica ricevuta in foreground:', event);
      callback(event);
    });
  });
}

// Ascolta quando l'utente clicca su una notifica
export function onNotificationClicked(callback: (notification: any) => void): void {
  if (typeof window === 'undefined') return;
  
  const OneSignal = (window as any).OneSignal;
  if (!OneSignal) return;

  OneSignal.push(() => {
    OneSignal.on('notificationOpened', (event: any) => {
      console.log('Notifica cliccata:', event);
      callback(event);
    });
  });
}

// Verifica se l'utente è sottoscritto alle notifiche
export async function isUserSubscribed(): Promise<boolean> {
  try {
    const initialized = await initializeOneSignal();
    if (!initialized) return false;

    const OneSignal = (window as any).OneSignal;
    const isPushEnabled = await OneSignal.isPushNotificationsEnabled();
    return isPushEnabled;
  } catch (error) {
    console.error('Errore verifica sottoscrizione:', error);
    return false;
  }
}

// Disiscriviti dalle notifiche
export async function unsubscribe(): Promise<void> {
  try {
    const initialized = await initializeOneSignal();
    if (!initialized) return;

    const OneSignal = (window as any).OneSignal;
    await OneSignal.setSubscription(false);
    console.log('Utente disiscritto dalle notifiche');
  } catch (error) {
    console.error('Errore disiscrizione:', error);
  }
}

// Sottoscrivi alle notifiche
export async function subscribe(): Promise<void> {
  try {
    const initialized = await initializeOneSignal();
    if (!initialized) return;

    const OneSignal = (window as any).OneSignal;
    await OneSignal.setSubscription(true);
    console.log('Utente sottoscritto alle notifiche');
  } catch (error) {
    console.error('Errore sottoscrizione:', error);
  }
}

// Invia il Player ID al server per salvarlo (opzionale)
export async function sendPlayerIdToServer(playerId: string, userId: string): Promise<void> {
  try {
    console.log('Player ID da inviare al server:', playerId, 'per user:', userId);
    
    // Implementa qui la chiamata al tuo backend per salvare il Player ID
    // associato all'userId. Questo ti permetterà di inviare notifiche
    // mirate a specifici utenti.
    
    // Esempio:
    // await fetch('https://your-api.com/save-player-id', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId, playerId })
    // });
  } catch (error) {
    console.error('Errore invio Player ID al server:', error);
  }
}

// ========== FUNZIONI PER IL SERVER ==========
// Queste funzioni sono esempi di come inviare notifiche dal server
// NOTA: Devi chiamarle dal tuo backend, non dal client!

// Esempio di payload per inviare una notifica a tutti gli utenti
export function createNotificationPayload(
  title: string,
  message: string,
  url?: string,
  data?: Record<string, any>
) {
  return {
    app_id: ONESIGNAL_APP_ID,
    included_segments: ['All'], // Invia a tutti gli utenti sottoscritti
    headings: { en: title },
    contents: { en: message },
    url: url || undefined,
    data: data || undefined,
  };
}

// Esempio di payload per inviare una notifica a specifici utenti
export function createTargetedNotificationPayload(
  playerIds: string[], // Array di Player IDs
  title: string,
  message: string,
  url?: string,
  data?: Record<string, any>
) {
  return {
    app_id: ONESIGNAL_APP_ID,
    include_player_ids: playerIds,
    headings: { en: title },
    contents: { en: message },
    url: url || undefined,
    data: data || undefined,
  };
}

// Esempio di funzione per inviare notifica dal server (da implementare nel backend)
// async function sendNotificationFromServer(payload: any) {
//   const response = await fetch('https://onesignal.com/api/v1/notifications', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': 'Basic YOUR_REST_API_KEY', // Ottienila da OneSignal Dashboard
//     },
//     body: JSON.stringify(payload),
//   });
//   return response.json();
// }
