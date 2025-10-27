# Changelog - Marconi Link

## Versione Attuale

### 🎉 Migrazione a OneSignal (Sostituzione FCM)
**Data**: Novembre 2024
**Tipo**: Migrazione tecnologica

#### Perché il Cambio?
- OneSignal è **molto più semplice** da configurare (5 minuti vs 30+ minuti con FCM)
- **Non richiede service worker custom** (lo gestisce automaticamente)
- **Funziona perfettamente su GitHub Pages** senza configurazioni complesse
- **Gratuito fino a 10,000 utenti** (vs FCM più limitato)
- **Dashboard intuitiva** per inviare notifiche manualmente
- **Supporto Safari** completo (anche iOS 16.4+)

#### Cosa è Cambiato:
- ❌ Rimosso `/utils/fcm.ts`
- ❌ Rimosso `/public/firebase-messaging-sw.js`
- ❌ Rimossi file documentazione FCM
- ✅ Aggiunto `/utils/onesignal.ts` - Sistema OneSignal completo
- ✅ Aggiunto `/ONESIGNAL_SETUP.md` - Guida setup semplificata
- ✅ Aggiunto `/ONESIGNAL_SERVER_EXAMPLES.md` - Esempi server
- ✅ Aggiornato `/App.tsx` per usare OneSignal
- ✅ Aggiornato README con nuove istruzioni

#### Setup Rapido:
1. Vai su [OneSignal.com](https://onesignal.com) e crea account gratuito
2. Crea app Web Push
3. Copia App ID
4. Incolla in `/utils/onesignal.ts`
5. **Fatto!** Funziona tutto automaticamente

#### Funzionalità OneSignal:
- 🔔 Notifiche push Web + Mobile
- 🎯 Segmentazione utenti con tag
- 📊 Analytics dettagliati
- 🌍 Supporto multilingua
- 📱 Compatibilità universale
- ⚡ Performance ottimizzate

---

## Versioni Precedenti

### ✅ 1. Post Eventi - Risolto Blank Page
**Problema**: I post di tipo "eventi" causavano una pagina bianca quando aperti
**Soluzione**: 
- Aggiunto supporto completo per il tipo "eventi" in PostDetailDialog
- Aggiunta visualizzazione di data e ora eventi con icone Calendar e Clock
- Configurazione colore distintivo per badge eventi (rosa)

### ✅ 2. Sistema Notifiche Push (Ora OneSignal)
**Implementazione completa** per notifiche push reali compatibili con Web e Mobile:

#### Caratteristiche:
- ✅ Notifiche push funzionanti anche a sito chiuso
- ✅ Compatibile con GitHub Pages
- ✅ Setup semplicissimo (5 minuti)
- ✅ Supporto Web e Mobile (Chrome, Firefox, Edge, Safari)
- ✅ Gratuito fino a 10,000 utenti
- ✅ Dashboard intuitiva per invio manuale

#### Notifiche Supportate:
- 📢 Nuovi annunci
- 📋 Nuove comunicazioni
- 🆕 Nuovi post pubblicati
- ❤️ Nuovi like ricevuti
- 💬 Nuovi commenti
- 📊 Cambiamenti in classifica

### ✅ 3. Aggiornamento Real-Time dei Post
**Implementazione**: Sistema di polling intelligente per aggiornamenti automatici

#### Caratteristiche:
- ✅ Controllo automatico ogni 5 secondi (prima era 10)
- ✅ Rilevamento intelligente di nuovi post
- ✅ Notifiche automatiche quando ci sono nuovi contenuti
- ✅ Aggiornamento silenzioso in background
- ✅ Toast notification per nuovi post disponibili
- ✅ Contatore automatico dei post

#### Funzionamento:
```
Ogni 5 secondi:
1. Controlla se ci sono nuovi post
2. Se ci sono nuovi post → Mostra notifica
3. Aggiorna automaticamente il feed
4. Aggiorna le statistiche
```

### ✅ 4. Descrizioni Facoltative - Sistema Codice Speciale
**Problema**: Quando la descrizione era vuota, appariva "No required parameters"
**Soluzione**: Implementato sistema di codice speciale `__EMPTY_DESCRIPTION__`

#### Come Funziona:
1. **Client**: Se l'utente non inserisce descrizione → invia stringa vuota
2. **Server**: Se riceve stringa vuota → salva `__EMPTY_DESCRIPTION__` su Supabase
3. **Server (lettura)**: Se legge `__EMPTY_DESCRIPTION__` → restituisce stringa vuota al client
4. **Client (render)**: Se riceve stringa vuota → non mostra nulla

#### Vantaggi:
- ✅ Descrizione veramente facoltativa per tutti i tipi di post
- ✅ Nessun errore "required parameters"
- ✅ Database pulito con codice identificabile
- ✅ Compatibile con post esistenti
- ✅ Funziona per creazione e modifica post

#### File Modificati:
- `/supabase/functions/server/index.tsx` - Gestione codice speciale
- `/components/CreatePostDialog.tsx` - Validazione aggiornata
- `/components/EditPostDialog.tsx` - Validazione aggiornata
- `/components/PostDetailDialog.tsx` - Rendering condizionale
- `/components/FeedCard.tsx` - Supporto descrizioni vuote

## Miglioramenti Tecnici

### Performance
- ⚡ Polling ridotto da 10s a 5s per aggiornamenti più rapidi
- ⚡ Sistema di notifiche ottimizzato
- ⚡ Caricamento intelligente con silent mode

### User Experience
- 🎨 Notifiche più informative e contestuali
- 🎨 Toast automatici per nuovi contenuti
- 🎨 Visualizzazione migliorata eventi con data/ora
- 🎨 Descrizioni facoltative senza errori

### Compatibilità
- 🌐 Funziona su GitHub Pages
- 🌐 Compatibile con tutti i browser moderni
- 🌐 Supporto mobile completo (tranne Safari iOS per FCM)
- 🌐 Service Worker per funzionalità offline

## Istruzioni di Configurazione

### Firebase Cloud Messaging
1. Leggi `/FCM_SETUP.md` per la guida completa
2. Crea progetto Firebase gratuito
3. Configura le credenziali
4. Le notifiche funzioneranno automaticamente

### Deploy su GitHub Pages
L'applicazione è completamente compatibile con GitHub Pages:
- ✅ Service Worker funziona
- ✅ FCM funziona
- ✅ Notifiche push funzionano
- ✅ HTTPS automatico

## Nota Importante

Le notifiche push FCM richiedono:
- HTTPS (automatico su GitHub Pages)
- Browser compatibile (Chrome, Firefox, Edge)
- Permessi notifiche dell'utente
- Configurazione Firebase (vedi FCM_SETUP.md)

Per Safari iOS: Le notifiche push web non sono supportate da Apple (limitazione del sistema operativo).

## Prossimi Passi Suggeriti

1. Configura Firebase seguendo `FCM_SETUP.md`
2. Testa le notifiche in vari scenari
3. Personalizza i messaggi di notifica
4. (Opzionale) Implementa backend per notifiche dal server
5. (Opzionale) Aggiungi analytics per tracciare engagement

## Supporto

Per problemi o domande:
- Controlla la console del browser (F12)
- Verifica Firebase Console
- Leggi la documentazione in `FCM_SETUP.md`
