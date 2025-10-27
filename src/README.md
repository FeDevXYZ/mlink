# Marconi Link 🎓

Piattaforma social/feed moderna per la condivisione di risorse, annunci ed eventi nella comunità scolastica dell'I.C. Pace del Mela.

## ✨ Caratteristiche Principali

### 📱 Tipi di Contenuti
- **📚 Appunti** - Condividi materiale didattico
- **🙋 Richieste** - Chiedi aiuto alla community
- **🚀 Progetti** - Mostra i tuoi lavori
- **📢 Annunci** - Comunicazioni importanti (solo admin)
- **🔔 Comunicazioni** - Avvisi ufficiali (solo admin)
- **📅 Eventi** - Organizza e condividi eventi con data/ora

### 🔥 Funzionalità Avanzate

#### 🔔 Notifiche Push Real-Time (OneSignal)
- Notifiche push anche a sito chiuso
- Compatibile con Web e Mobile
- Setup semplicissimo (5 minuti)
- Aggiornamenti automatici ogni 5 secondi
- Notifiche per nuovi post, like, commenti, annunci
- Gratuito fino a 10,000 utenti

#### 🎨 Design Moderno
- Stile ispirato ad Apple (pulito, minimalista, sofisticato)
- Modalità chiara/scura automatica
- Animazioni fluide con Motion
- Responsive design
- Tipografia curata
- Spazio bianco ottimizzato

#### 👥 Sistema Sociale
- Like e commenti sui post
- Classifica utenti
- Profili personalizzabili con avatar
- Statistiche in tempo reale
- Sistema di codici per contenuti privati

#### 📎 Media e Allegati
- Upload multiplo file (max 5)
- Galleria immagini/video interattiva
- Drag & drop con animazioni
- Anteprima media inline
- Download allegati

#### 🔐 Controllo Accessi
- Sistema di codici admin
- Codici categoria per post privati
- Permessi granulari
- Modalità super admin per gestione

## 🚀 Setup e Installazione

### Prerequisiti
- Node.js 18+ (per sviluppo locale)
- Account Supabase (gratuito)
- Account OneSignal (opzionale, per notifiche push - gratuito)

### 1. Configurazione Base

L'applicazione è già configurata e pronta per GitHub Pages. Basta deployare su GitHub Pages e funzionerà!

### 2. Configurazione OneSignal (Opzionale ma Consigliata)

Per abilitare le notifiche push:

1. **Leggi la guida completa**: Apri `/ONESIGNAL_SETUP.md`
2. **Crea account gratuito**: Vai su [OneSignal](https://onesignal.com)
3. **Crea app Web Push**: Segui il wizard guidato (super semplice!)
4. **Copia App ID**: Vai su Settings > Keys & IDs
5. **Configura file**: Modifica `/utils/onesignal.ts` e inserisci il tuo App ID

💡 **Setup completo in soli 5 minuti!** Molto più semplice di Firebase.

### 3. Deploy su GitHub Pages

```bash
# 1. Fai il push del codice su GitHub
git add .
git commit -m "Deploy Marconi Link"
git push origin main

# 2. Abilita GitHub Pages nelle impostazioni del repository
# Settings > Pages > Source: main branch

# 3. L'app sarà disponibile su:
# https://[username].github.io/[repository-name]
```

## 📖 Utilizzo

### Per Studenti

1. **Primo accesso**: Inserisci nome e cognome, scegli un avatar
2. **Sfoglia contenuti**: Usa i filtri per categoria (Appunti, Progetti, ecc.)
3. **Cerca**: Usa la barra di ricerca per trovare contenuti specifici
4. **Interagisci**: Metti like, commenta, condividi
5. **Crea contenuti**: Clicca il pulsante "+" per pubblicare

### Per Admin

1. **Inserisci codice admin**: Nel profilo, aggiungi il codice `J`
2. **Accedi a funzionalità extra**: Potrai creare Annunci, Comunicazioni, Eventi
3. **Gestisci contenuti**: Modifica/elimina qualsiasi post
4. **Visualizza statistiche**: Accedi a dati avanzati

### Codici Speciali

- **Codice Admin**: `J` (per creare annunci/comunicazioni/eventi)
- **Codice Super Admin**: `SUPERADMIN2024` (accesso completo a tutto)
- **Codici Categoria**: Personalizzati per post privati (es. `CLASSETERZA`)

## 🛠️ Personalizzazione

### Modifica Testi e Branding

Apri `/App.tsx` e modifica le costanti all'inizio del file:

```typescript
const ADMIN_CODE = "J";
const SUPERADMIN_CODE = "SUPERADMIN2024";
const APP_NAME = "Marconi Link";
const APP_SUBTITLE = "I.C. Pace del Mela";
const WELCOME_TITLE = "Benvenuto su Marconi Link 👋";
const WELCOME_DESCRIPTION = "La tua descrizione...";
```

### Modifica Materie

Modifica l'array `MATERIE` in:
- `/components/CreatePostDialog.tsx`
- `/components/EditPostDialog.tsx`

### Modifica Colori e Stili

Tutti gli stili sono in `/styles/globals.css` utilizzando Tailwind CSS v4.

## 📊 Struttura Progetto

```
├── App.tsx                     # Componente principale
├── components/
│   ├── Header.tsx             # Intestazione app
│   ├── FilterBar.tsx          # Barra filtri
│   ├── FeedCard.tsx           # Card post
│   ├── CreatePostDialog.tsx   # Dialog creazione post
│   ├── EditPostDialog.tsx     # Dialog modifica post
│   ├── PostDetailDialog.tsx   # Dialog dettagli post
│   ├── CommentSection.tsx     # Sezione commenti
│   ├── MediaGallery.tsx       # Galleria media
│   ├── ProfileDialog.tsx      # Dialog profilo
│   ├── LeaderboardDialog.tsx  # Classifica
│   ├── StatsBar.tsx           # Barra statistiche
│   └── ui/                    # Componenti UI (shadcn)
├── utils/
│   ├── onesignal.ts           # OneSignal Push Notifications
│   ├── notifications.ts       # Notifiche native browser
│   ├── avatarUtils.ts         # Gestione avatar
│   └── supabase/              # Configurazione Supabase
├── public/
│   └── manifest.json          # PWA manifest
├── supabase/functions/server/ # Backend Supabase
└── styles/globals.css         # Stili globali
```

## 🔧 Tecnologie Utilizzate

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Motion (Framer Motion)** - Animazioni
- **shadcn/ui** - Componenti UI
- **Lucide React** - Icone
- **Sonner** - Toast notifications

### Backend
- **Supabase** - Database e Edge Functions
- **Deno KV** - Key-Value store

### Notifiche
- **OneSignal** - Push notifications (Web + Mobile)
- **Notification API** - Notifiche native browser

## 📱 Compatibilità Browser

### Desktop
- ✅ Chrome 90+ (notifiche push ✅)
- ✅ Firefox 88+ (notifiche push ✅)
- ✅ Edge 90+ (notifiche push ✅)
- ✅ Safari 16+ (notifiche push ✅)

### Mobile
- ✅ Chrome Android (notifiche push ✅)
- ✅ Firefox Android (notifiche push ✅)
- ✅ Samsung Internet (notifiche push ✅)
- ✅ Safari iOS 16.4+ (notifiche push ✅)

## 🔒 Privacy e Sicurezza

- ✅ Nessun dato personale sensibile raccolto
- ✅ ID utente generato localmente
- ✅ Nessun tracciamento analytics (opzionale)
- ✅ Dati su Supabase con encryption
- ✅ HTTPS obbligatorio (automatico su GitHub Pages)

## 📝 Changelog

Vedi `/CHANGELOG.md` per la lista completa delle modifiche recenti.

### Ultime Novità
- ✅ Migrazione a OneSignal (più semplice di Firebase!)
- ✅ Sistema notifiche push universale (Web + Mobile)
- ✅ Aggiornamento real-time ogni 5s
- ✅ Descrizioni post completamente facoltative
- ✅ Fix blank page su post eventi
- ✅ Design modernizzato stile Apple

## 🤝 Contributi

Questa è un'iniziativa degli studenti dell'I.C. Pace del Mela.

Per contribuire:
1. Fai un fork del progetto
2. Crea un branch per la tua feature
3. Commit le modifiche
4. Apri una Pull Request

## 📄 Licenza

Progetto open source per uso educativo.

## 🆘 Supporto

### Problemi Comuni

**Le notifiche non funzionano**
- Controlla di aver configurato OneSignal (vedi `/ONESIGNAL_SETUP.md`)
- Verifica permessi notifiche nel browser (Impostazioni > Notifiche)
- Controlla console per errori (F12)
- Verifica che il tuo App ID sia corretto in `/utils/onesignal.ts`

**I post non si aggiornano**
- Controlla connessione internet
- Verifica che Supabase sia configurato
- Controlla la console per errori API

**Blank page**
- Svuota cache del browser
- Controlla console per errori JavaScript
- Verifica configurazione Supabase

### Debug

Apri console browser (F12) e cerca:
- Messaggio "OneSignal attivato con successo! ✅" - Se lo vedi, funziona!
- Messaggio "OneSignal Player ID: ..." - Mostra l'ID univoco dell'utente
- Errori rossi - Indica problemi di configurazione
- Network tab - Verifica chiamate API

## 🎯 Roadmap Futura

- [ ] Chat privata tra utenti
- [ ] Sistema di badges e achievement
- [ ] Export PDF dei post
- [ ] Calendario eventi integrato
- [ ] App mobile nativa (React Native)
- [ ] Integrazione Google Classroom
- [ ] Sistema di votazioni
- [ ] Editor markdown avanzato

## 📞 Contatti

Marconi Link - Iniziativa studenti I.C. Pace del Mela

---

**Made with ❤️ by students, for students**
