# Sprint 3 - Récapitulatif Complet 🚀

**Date**: 2025-11-20
**Statut**: ✅ **TERMINÉ** (100%)

---

## 🎯 Objectifs du Sprint 3

Ajouter les fonctionnalités avancées : Realtime, Export PDF, QR Codes, et Toast Notifications.

### Checklist

- [x] Supabase Realtime (live updates)
- [x] Export PDF (bracket + full report)
- [x] QR Codes + Social Sharing
- [x] Toast Notifications
- [x] Hooks Realtime (useRealtimeMatches, etc.)

---

## ✅ Réalisations

### 1. Supabase Realtime ✅

#### **realtimeService.js**
**Fichier**: `src/services/tournament/realtimeService.js` (250+ lignes)

**Fonctions disponibles**:

| Fonction | Description | Use Case |
|----------|-------------|----------|
| `subscribeToMatches()` | Subscribe aux MAJ de matchs | Bracket live updates |
| `subscribeToTournament()` | Subscribe aux MAJ du tournoi | Status changes |
| `subscribeToPlayers()` | Subscribe aux MAJ stats joueurs | Standings live |
| `subscribeToTournamentData()` | All-in-one subscription | Dashboard complet |
| `subscribeToPresence()` | Qui regarde le tournoi | Viewers count |

**Exemple Usage**:
```javascript
import realtimeService from '../services/tournament/realtimeService'

// Subscribe to match updates
const unsubscribe = realtimeService.subscribeToMatches(tournamentId, {
  onMatchUpdate: (newMatch, oldMatch) => {
    console.log('Match updated!', newMatch)
    // Update UI
  },
  onMatchInsert: (newMatch) => {
    console.log('New match created!', newMatch)
  },
  onMatchDelete: (oldMatch) => {
    console.log('Match deleted!', oldMatch)
  }
})

// Cleanup
return () => unsubscribe()
```

**Features**:
- ✅ Automatic reconnection
- ✅ Event filtering (UPDATE, INSERT, DELETE)
- ✅ Console logging pour debugging
- ✅ Channel management
- ✅ Presence tracking (qui regarde)

---

#### **useRealtime.js** (React Hooks)
**Fichier**: `src/hooks/useRealtime.js` (200+ lignes)

**Hooks disponibles**:

| Hook | Description | Auto-invalidation |
|------|-------------|-------------------|
| `useRealtimeMatches()` | Live match updates | ✅ matches, players queries |
| `useRealtimeTournament()` | Live tournament updates | ✅ tournament queries |
| `useRealtimePlayers()` | Live player stats | ✅ players, standings queries |
| `useRealtimeTournamentData()` | All-in-one hook | ✅ All queries |
| `useRealtimePresence()` | Viewers tracking | - |

**Exemple complet**:
```jsx
import { useTournament } from '../hooks/useTournament'
import { useMatches } from '../hooks/useMatches'
import { useRealtimeMatches } from '../hooks/useRealtime'
import { tournamentToasts } from '../utils/toast'

function TournamentBracket({ urlCode }) {
  const { data: tournament } = useTournament(urlCode)
  const { data: matches } = useMatches(tournament?.id)

  // Enable realtime updates
  useRealtimeMatches(tournament?.id, {
    enabled: true,
    onUpdate: (newMatch, oldMatch) => {
      // React Query auto-invalide les queries
      // Mais on peut aussi afficher un toast
      if (newMatch?.status === 'completed') {
        tournamentToasts.matchUpdated()
      }
    }
  })

  return <SingleEliminationBracket matches={matches} />
}
```

**Avantages**:
- 🚀 **Automatic React Query invalidation** : Pas besoin de refetch manuellement
- 🔄 **Real-time sync** : Tous les spectateurs voient les MAJ instantanément
- 🧹 **Auto cleanup** : Unsubscribe automatique au unmount
- 🎯 **Selective updates** : Subscribe uniquement aux données nécessaires

---

### 2. Export PDF ✅

#### **exportPDF.js**
**Fichier**: `src/utils/exportPDF.js` (250+ lignes)

**Fonctions disponibles**:

| Fonction | Description | Output |
|----------|-------------|--------|
| `exportBracketToPDF()` | Export bracket seul | PDF du bracket (landscape) |
| `exportTournamentToPDF()` | Export bracket + metadata | Multi-page PDF |
| `printBracket()` | Impression navigateur | Print dialog |

**Usage**:
```javascript
import { exportBracketToPDF, exportTournamentToPDF, printBracket } from '../utils/exportPDF'

// Export bracket only
const bracketElement = document.getElementById('bracket')
await exportBracketToPDF(bracketElement, 'my-tournament-bracket.pdf', {
  orientation: 'landscape',
  format: 'a4',
  quality: 0.95,
  scale: 2
})

// Export full report
await exportTournamentToPDF(bracketElement, tournament, 'full-report.pdf')

// Print
printBracket(bracketElement)
```

**Features**:
- 📄 **Multi-page support** : Metadata page + bracket
- 🎨 **High quality** : 95% quality, 2x scale
- 🖨️ **Print-friendly** : CSS @media print optimized
- 🚫 **Smart hiding** : Hide `.no-print` elements automatiquement
- 📐 **Auto-sizing** : PDF dimensions adaptées au contenu

---

#### **ExportPanel Component**
**Fichier**: `src/components/tournament/molecules/ExportPanel.jsx`

**Features**:
- 3 boutons : Export Bracket, Export Full, Print
- Loading state avec spinner
- Success/Error status messages
- Info tooltips
- Responsive design

**Usage**:
```jsx
import ExportPanel from '../components/tournament/molecules/ExportPanel'

function TournamentDashboard() {
  const bracketRef = useRef(null)

  return (
    <div>
      <div ref={bracketRef}>
        <SingleEliminationBracket {...props} />
      </div>

      <ExportPanel
        bracketRef={bracketRef}
        tournament={tournament}
      />
    </div>
  )
}
```

**UI/UX**:
- ✅ Status messages (success/error)
- ✅ Loading spinner pendant export
- ✅ Info section explicative
- ✅ Responsive mobile
- ✅ Disabled state pendant export

---

### 3. QR Codes + Social Sharing ✅

#### **SharePanel Component**
**Fichier**: `src/components/tournament/molecules/SharePanel.jsx` (180+ lignes)

**Features**:

**QR Code** 📱:
- Génération automatique du QR code (URL tournoi)
- Size: 200x200px, Level: H (high error correction)
- Download QR as PNG
- Affiché dans un cadre stylé

**Copy Link** 📋:
- Input read-only avec URL complète
- Bouton "Copy" avec animation
- Feedback "✓ Copied!" (2 secondes)
- Fallback pour anciens navigateurs

**Social Sharing** 🌐:
- Twitter (avec text + URL)
- Facebook (share dialog)
- WhatsApp (mobile-friendly)
- Email (mailto: link)
- Couleurs brandées par plateforme

**Usage**:
```jsx
import SharePanel from '../components/tournament/molecules/SharePanel'

function TournamentView({ tournament }) {
  const tournamentUrl = `${window.location.origin}/tournament/${tournament.unique_url_code}`

  return (
    <SharePanel
      tournamentUrl={tournamentUrl}
      tournamentName={tournament.name}
    />
  )
}
```

**UI/UX**:
- ✅ QR code avec border stylé
- ✅ Boutons sociaux avec icônes SVG
- ✅ Hover effects (lift + shadow)
- ✅ Responsive grid (2 cols mobile, 4 cols desktop)
- ✅ Copy feedback instantané

---

### 4. Toast Notifications ✅

#### **toast.js Utility**
**Fichier**: `src/utils/toast.js` (250+ lignes)

**Fonctions génériques**:

| Fonction | Description | Duration |
|----------|-------------|----------|
| `showSuccess(message)` | Toast succès | 3s |
| `showError(message)` | Toast erreur | 5s |
| `showInfo(message)` | Toast info | 4s |
| `showLoading(message)` | Toast loading | ∞ |
| `showPromise(promise, messages)` | Auto success/error | Auto |
| `dismissToast(id)` | Dismiss un toast | - |
| `dismissAllToasts()` | Dismiss tous | - |

**Fonctions spécifiques tournois** 🎾:
```javascript
import { tournamentToasts } from '../utils/toast'

// Match updates
tournamentToasts.matchUpdated()
tournamentToasts.matchUndone()
tournamentToasts.matchError('Invalid score')

// Tournament operations
tournamentToasts.tournamentCreated()
tournamentToasts.tournamentUpdated()
tournamentToasts.tournamentDeleted()

// Players
tournamentToasts.playerAdded('Alice')
tournamentToasts.playerRemoved('Bob')

// Seeding
tournamentToasts.seedingUpdated()

// Rounds (Swiss)
tournamentToasts.roundGenerated(3)

// Export
tournamentToasts.exportSuccess()
tournamentToasts.exportError('Failed to render')

// Sharing
tournamentToasts.linkCopied()

// Realtime
tournamentToasts.realtimeConnected()
tournamentToasts.realtimeDisconnected()
```

**Configuration**:
```javascript
export const toastConfig = {
  duration: 4000,
  position: 'bottom-right',
  style: {
    background: '#363636',
    color: '#fff',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  }
}
```

**Custom toast avec action** 🎯:
```javascript
import { showToastWithAction } from '../utils/toast'

showToastWithAction(
  'Match result saved',
  'Undo',
  () => {
    undoMatch()
  }
)
```

**Promise toast** ⏳:
```javascript
import { showPromise } from '../utils/toast'

showPromise(
  updateMatchResult(matchId, winnerId, score),
  {
    loading: 'Saving match result...',
    success: 'Match saved successfully!',
    error: 'Failed to save match'
  }
)
```

---

## 📊 Statistiques du Sprint 3

| Catégorie | Quantité | Détails |
|-----------|----------|---------|
| **Services créés** | 2 | realtimeService, exportPDF |
| **Components créés** | 2 | SharePanel, ExportPanel |
| **Hooks créés** | 1 | useRealtime (5 hooks inside) |
| **Utilities créés** | 1 | toast.js |
| **Packages installés** | 4 | jspdf, html2canvas, qrcode.react, react-hot-toast |
| **Lignes de code** | ~1500 | Services + Components + Utils + CSS |

---

## 🚀 Integration Guide

### Setup React Hot Toast (Required)

Éditez `src/main.jsx` :
```jsx
import { Toaster } from 'react-hot-toast'
import { toastConfig } from './utils/toast'

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster
      position={toastConfig.position}
      toastOptions={{
        style: toastConfig.style,
        success: toastConfig.success,
        error: toastConfig.error
      }}
    />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
)
```

### Example: Complete Tournament Page with All Features

```jsx
import React, { useRef } from 'react'
import { useTournament } from '../hooks/useTournament'
import { useMatches, useUpdateMatchResult } from '../hooks/useMatches'
import { useRealtimeMatches } from '../hooks/useRealtime'
import { tournamentToasts, showPromise } from '../utils/toast'
import SingleEliminationBracket from '../components/tournament/organisms/brackets/SingleEliminationBracket'
import ExportPanel from '../components/tournament/molecules/ExportPanel'
import SharePanel from '../components/tournament/molecules/SharePanel'

function TournamentPage({ urlCode }) {
  const bracketRef = useRef(null)

  // Data fetching
  const { data: tournament, isLoading } = useTournament(urlCode)
  const { data: matches } = useMatches(tournament?.id)
  const updateMatch = useUpdateMatchResult()

  // Realtime updates
  useRealtimeMatches(tournament?.id, {
    enabled: true,
    onUpdate: (newMatch) => {
      if (newMatch?.status === 'completed') {
        tournamentToasts.matchUpdated()
      }
    }
  })

  // Handle match update
  const handleMatchUpdate = async (matchId, winnerId, score) => {
    await showPromise(
      updateMatch.mutateAsync({ matchId, winnerId, score }),
      {
        loading: 'Saving match result...',
        success: 'Match saved!',
        error: 'Failed to save match'
      }
    )
  }

  if (isLoading) return <Spinner />

  const tournamentUrl = `${window.location.origin}/tournament/${tournament.unique_url_code}`

  return (
    <div className="tournament-page">
      <h1>{tournament.name}</h1>

      {/* Bracket */}
      <div ref={bracketRef}>
        <SingleEliminationBracket
          matches={matches}
          onUpdateMatch={handleMatchUpdate}
        />
      </div>

      {/* Export & Share */}
      <div className="tournament-actions">
        <ExportPanel
          bracketRef={bracketRef}
          tournament={tournament}
        />

        <SharePanel
          tournamentUrl={tournamentUrl}
          tournamentName={tournament.name}
        />
      </div>
    </div>
  )
}
```

---

## 🎯 Use Cases par Feature

### Realtime

**Use Case 1**: Live bracket updates pour spectateurs
```jsx
// Page de spectateur (read-only)
function SpectatorBracket({ urlCode }) {
  const { data: tournament } = useTournament(urlCode)
  const { data: matches } = useMatches(tournament?.id)

  // Enable realtime (pas d'édition)
  useRealtimeMatches(tournament?.id, {
    onUpdate: () => {
      // Auto-refetch, rien à faire !
    }
  })

  return <SingleEliminationBracket matches={matches} canEdit={false} />
}
```

**Use Case 2**: Presence tracking
```jsx
function TournamentDashboard({ tournament, userId }) {
  const [viewers, setViewers] = useState(0)

  useRealtimePresence(tournament.id, userId, {
    onSync: (state) => {
      setViewers(Object.keys(state).length)
    }
  })

  return <div>👁️ {viewers} viewers online</div>
}
```

---

### Export PDF

**Use Case 1**: Export pour impression sur site
```jsx
function OrganizerDashboard({ tournament }) {
  const bracketRef = useRef(null)

  const handlePrintForVenue = async () => {
    await exportBracketToPDF(bracketRef.current, 'venue-bracket.pdf', {
      orientation: 'landscape',
      format: 'a3', // Large format pour affichage
      scale: 3 // Haute qualité
    })
  }

  return (
    <div>
      <div ref={bracketRef}>
        <Bracket />
      </div>
      <button onClick={handlePrintForVenue}>
        Print for Venue Display
      </button>
    </div>
  )
}
```

**Use Case 2**: Export rapport complet
```jsx
function ExportFullReport({ tournament }) {
  const handleExportReport = async () => {
    const bracketElement = document.getElementById('bracket')

    await exportTournamentToPDF(bracketElement, tournament, 'report.pdf')
    // PDF inclut :
    // - Page 1 : Tournament metadata (name, date, location, format, players)
    // - Page 2+ : Bracket complet
  }

  return <button onClick={handleExportReport}>Export Full Report</button>
}
```

---

### QR Code + Sharing

**Use Case 1**: Affichage QR code sur site
```jsx
function VenueDisplay({ tournament }) {
  const tournamentUrl = `${window.location.origin}/tournament/${tournament.unique_url_code}`

  return (
    <div className="venue-display">
      <h1>{tournament.name}</h1>
      <h2>Scan to follow results live!</h2>
      <QRCode value={tournamentUrl} size={400} />
    </div>
  )
}
```

**Use Case 2**: Social sharing campaign
```jsx
function ShareTournament({ tournament }) {
  const tournamentUrl = `${window.location.origin}/tournament/${tournament.unique_url_code}`

  return (
    <SharePanel
      tournamentUrl={tournamentUrl}
      tournamentName={tournament.name}
    />
  )
  // Users peuvent :
  // - Télécharger QR code
  // - Partager sur Twitter, Facebook, WhatsApp
  // - Copier le lien
  // - Envoyer par email
}
```

---

### Toast Notifications

**Use Case 1**: Feedback utilisateur
```jsx
import { useUpdateMatchResult } from '../hooks/useMatches'
import { tournamentToasts } from '../utils/toast'

function MatchCard({ match }) {
  const updateMatch = useUpdateMatchResult()

  const handleUpdate = async (winnerId, score) => {
    try {
      await updateMatch.mutateAsync({ matchId: match.id, winnerId, score })
      tournamentToasts.matchUpdated()
    } catch (err) {
      tournamentToasts.matchError(err.message)
    }
  }

  return <MatchCardV2 match={match} onUpdateResult={handleUpdate} />
}
```

**Use Case 2**: Undo avec action toast
```jsx
import { showToastWithAction } from '../utils/toast'

function UndoableMatchUpdate({ match }) {
  const updateMatch = useUpdateMatchResult()
  const undoMatch = useUndoMatchResult()

  const handleUpdate = async (winnerId) => {
    await updateMatch.mutateAsync({ matchId: match.id, winnerId })

    showToastWithAction(
      'Match result saved',
      'Undo',
      () => {
        undoMatch.mutate({ matchId: match.id })
      }
    )
  }

  return <MatchCardV2 match={match} onUpdateResult={handleUpdate} />
}
```

---

## ✨ Conclusion Sprint 3

**Achievements** 🏆 :
- ✅ **Supabase Realtime** : Live updates pour tous les spectateurs
- ✅ **Export PDF** : Brackets imprimables (venue display, reports)
- ✅ **QR Codes** : Easy sharing avec download PNG
- ✅ **Social Sharing** : Twitter, Facebook, WhatsApp, Email
- ✅ **Toast Notifications** : Feedback instantané avec 15+ messages prédéfinis

**Code Quality** 📈 :
- Services modulaires et testables
- Components réutilisables (ExportPanel, SharePanel)
- Hooks React Query intégrés
- Error handling robuste
- Documentation complète

**UX Improvements** 🎨 :
- Realtime : Spectateurs voient les MAJ instantanément
- Export : Organisateurs peuvent imprimer pour affichage sur site
- QR Code : Players scannent pour suivre le tournoi
- Toasts : Feedback clair sur chaque action

**Performance** ⚡ :
- Realtime : Subscriptions optimisées (pas de polling)
- Export : Canvas rendering optimisé (scale 2x)
- QR Code : Génération instantanée
- Toasts : Non-blocking UI

Le Sprint 3 complète la stack de features avancées ! 🚀

**Next : Sprint 4** (Polish + Production)
- Error boundaries
- Analytics
- Performance optimization
- Tests E2E
- Production deployment

Voulez-vous démarrer le Sprint 4 ou préférez-vous d'abord tester l'intégration des Sprints 2-3 ?
