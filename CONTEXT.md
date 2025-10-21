# 🎯 QUICKBAR - CONTEXTE PROJET POUR CLAUDE CODE

**Date de création** : 20 Octobre 2025
**Version actuelle** : v2.0 (Phase 3 - Multi-établissements complétée)
**Phase en cours** : Phase 3 TERMINÉE - Prêt pour Phase 4

---

## 📊 RÉSUMÉ EXÉCUTIF

QuickBar est une application web de commande pour clubs/bars permettant aux clients de commander via QR code et au personnel de gérer les commandes en temps réel.

**Stack** : React 18 + Firebase (Firestore + Auth) + Tailwind CSS + Vercel

**Statut Production** :
- URL : https://quickbar-app.vercel.app
- Repo : https://github.com/QuickBar01/quickbar-app
- Local : C:\Users\young\quickbar

---

## ✅ CE QUI FONCTIONNE (Phases 1, 2, 2.5, 3 - TERMINÉES)

### 1. Authentification Admin (Phase 1) ✅
- Login/Logout Firebase Auth
- Session persistante
- Routes protégées avec AuthContext
- Fichiers : `src/contexts/AuthContext.js`, `src/components/Login.js`

### 2. Gestion Menu CRUD (Phase 2) ✅
- Create/Read/Update/Delete items
- Catégories : Boissons, Plats, Desserts
- Toggle disponibilité
- Synchronisation temps réel (onSnapshot)
- Fichier : `src/components/MenuManager.js`

### 3. Stop/Start Commandes (Phase 2.5) ✅
- Toggle ON/OFF dans interface tablette
- Écran de blocage client si fermé
- Synchronisation temps réel via `ordersOpen`
- Compteur commandes avec code couleur
- Alerte surcharge (>10 commandes)

### 4. Architecture Multi-Établissements (Phase 3) ✅
- **Système de rôles** : super_admin, club_admin
- **RoleContext** : Gestion permissions granulaires
- **SuperAdminInterface** : Dashboard global à `/admin`
- **ClubAdminInterface** : Interface admin club à `/{club-id}/admin`
- **ClubsManager** : CRUD complet clubs à `/admin/clubs`
- **UsersManager** : CRUD complet utilisateurs à `/admin/users`
- **ShowUID** : Page `/show-uid` pour récupérer UID Firebase
- **Permissions** : Super-admin = tous clubs, Club-admin = clubs assignés

### 5. Interface Client ✅
- Affichage menu depuis Firestore
- Sélection quantités (0-20)
- Système pourboire (0%, 5%, 10%, 15%, 20%, custom)
- Calcul : sous-total + pourboire = total
- Génération numéro commande (6 chiffres)
- Notification "Commande Prête !" (animation néon)
- Blocage nouvelle commande si commande active
- Routes : `/{etablissement-id}`, `/{etablissement-id}/start`

### 6. Interface Tablette ✅
- Vue 2 colonnes : Attente | Prêtes
- Affichage temps réel commandes
- Détails : items, quantités, sous-total, pourboire, total
- Boutons : "Marquer comme prête", "Retirer (Livrée)"
- Toggle Stop/Start commandes
- Synchronisation instantanée
- Route : `/{etablissement-id}/tablette`

---

## 🗄️ STRUCTURE FIRESTORE ACTUELLE

```
firestore/
├── users/ ← NOUVEAU (Phase 3)
│   └── {uid}/ (ex: "ZeV8UmDJUVRDeTZvHB2JzuAA5FX2")
│       ├── email: "admin@example.com" (string)
│       ├── displayName: "Admin Name" (string)
│       ├── role: "super_admin" | "club_admin" (string)
│       ├── clubAccess: ["club1", "club2"] (array, optionnel pour club_admin)
│       ├── createdAt: timestamp (string)
│       └── updatedAt: timestamp (string)
│
└── etablissements/
    └── {clubId}/ (ex: "club-test", "demo")
        ├── Fields:
        │   ├── actif: true (boolean)
        │   ├── nom: "Club Test" (string)
        │   ├── ordersOpen: true (boolean) ← Phase 2.5
        │   ├── wifiSSID: "WiFi-ClubTest" (string)
        │   ├── wifiPassword: "test1234" (string)
        │   ├── createdAt: timestamp (string) ← Phase 3
        │   └── updatedAt: timestamp (string) ← Phase 3
        │
        ├── menu/ (sous-collection)
        │   └── {auto-id}/ (ex: "lMA7bYsOwIRe1KijpVJc")
        │       ├── available: true (boolean)
        │       ├── category: "plats" | "boissons" | "desserts" (string)
        │       ├── createdAt: timestamp (string)
        │       ├── name: "Burger Classic" (string)
        │       └── price: 12.5 (number)
        │
        └── commandes/ (sous-collection)
            └── {auto-id}/
                ├── number: "847392" (string, 6 chiffres)
                ├── items: array[
                │   {
                │     id: "lMA7bYsOwIRe1KijpVJc",
                │     name: "Burger",
                │     price: 12.5,
                │     quantity: 2
                │   }
                │ ]
                ├── subtotal: 27.5 (number)
                ├── tip: 2.0 (number)
                ├── total: 29.5 (number)
                ├── status: "pending" | "ready" (string)
                └── timestamp: "2025-10-20T12:00:00Z" (string)
```

**✅ NOTES** :
- Collection `users/` créée pour gérer les permissions multi-établissements
- Champ `ordersOpen` initialisé automatiquement lors de création club
- Super-admin n'a pas besoin de `clubAccess` (accès à tout)
- Club-admin doit avoir au moins 1 club dans `clubAccess`

---

## 📁 ARCHITECTURE FICHIERS

```
quickbar/
├── src/
│   ├── App.js              ← Routing + ClientInterface + TabletInterface + StartPage (~1000 lignes)
│   ├── firebase.js         ← Config Firebase + exports db, auth
│   ├── index.js            ← Entry point
│   ├── index.css           ← Tailwind imports
│   │
│   ├── contexts/           ← NOUVEAU (Phase 3)
│   │   ├── AuthContext.js  ← Gestion état auth
│   │   └── RoleContext.js  ← Gestion permissions multi-rôles
│   │
│   └── components/
│       ├── Login.js                    ← Page login admin
│       ├── MenuManager.js              ← CRUD menu
│       ├── SuperAdminInterface.js      ← Dashboard super-admin (/admin)
│       ├── ClubAdminInterface.js       ← Interface admin club (/{club}/admin)
│       ├── ClubsManager.js             ← CRUD clubs (/admin/clubs)
│       ├── UsersManager.js             ← CRUD utilisateurs (/admin/users)
│       └── ShowUID.js                  ← Affichage UID Firebase (/show-uid)
│
├── public/
│   └── index.html
│
├── package.json
├── .env                    ← Variables Firebase (NE PAS COMMIT)
├── .gitignore
├── CONTEXT.md              ← Documentation projet (ce fichier)
├── RAPPORT_PHASE3.md       ← Rapport détaillé Phase 3
└── README.md
```

**📊 STATISTIQUES** :
- `src/App.js` : ~1000 lignes (ClientInterface, TabletInterface, StartPage, routing)
- Total composants : 7 fichiers
- Total contexts : 2 fichiers (Auth + Role)
- Architecture modulaire et scalable

---

## 🔧 CONFIGURATION FIREBASE

### Fichier `src/firebase.js`
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: "quickbarsnclub",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### Règles Firestore Actuelles
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Collection users (Phase 3)
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }

    // Collection etablissements
    match /etablissements/{etablissementId} {
      allow read: if true;
      allow write: if request.auth != null;

      match /menu/{menuId} {
        allow read: if true;
        allow write: if request.auth != null;
      }

      match /commandes/{commandeId} {
        allow read: if true;
        allow write: if true;  // Clients non-auth peuvent créer commandes
      }
    }
  }
}
```

**🔐 SÉCURITÉ** :
- Collection `users/` : Read/Write uniquement par l'utilisateur concerné
- Collection `etablissements/` : Lecture publique, écriture auth uniquement
- Collection `commandes/` : Lecture/écriture publique (pour clients non-auth)

---

## 🎨 DESIGN SYSTEM

### Couleurs
- **Fond** : `#000000` (noir pur)
- **Texte principal** : `#00FF41` (vert néon Matrix)
- **Texte secondaire** : `#gray-400`, `#gray-500`
- **Erreur** : `#ff4141` (rouge)
- **Succès** : `#00FF41` (vert)

### Typographie
- **Police** : `font-mono` (monospace pour style terminal)
- **Headers** : Tailles variées selon contexte
- **Body** : Tailles standard responsive

### Animations
- **Notifications** : Pulse/glow effect pour "Commande Prête"
- **Chargement** : États de loading sur boutons
- **Transitions** : Fluides entre états

### Classes Tailwind Communes
```javascript
// Input style terminal
className="bg-black border border-green-400 text-green-400 text-center py-1 font-mono"

// Bouton principal
className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold"

// Texte Matrix vert
className="text-green-400 bg-black font-mono"
style={{ color: '#00FF41' }}
```

---

## 🔄 PATTERNS CODE RÉUTILISABLES

### 1. Lecture Temps Réel Firestore
```javascript
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

useEffect(() => {
  const q = query(
    collection(db, 'etablissements', etablissementId, 'menu'),
    orderBy('name')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setItems(items);
  });
  
  return () => unsubscribe();
}, [etablissementId]);
```

### 2. Ajout Document
```javascript
import { addDoc, collection } from 'firebase/firestore';

const newDoc = await addDoc(
  collection(db, 'etablissements', etablissementId, 'commandes'),
  {
    number: generateOrderNumber(),
    items: orderItems,
    subtotal: subtotal,
    tip: tipAmount,
    total: subtotal + tipAmount,
    status: 'pending',
    timestamp: new Date().toISOString()
  }
);
```

### 3. Mise à Jour Document
```javascript
import { updateDoc, doc } from 'firebase/firestore';

await updateDoc(
  doc(db, 'etablissements', etablissementId, 'commandes', orderId),
  { status: 'ready' }
);
```

### 4. Suppression Document
```javascript
import { deleteDoc, doc } from 'firebase/firestore';

await deleteDoc(
  doc(db, 'etablissements', etablissementId, 'commandes', orderId)
);
```

### 5. Lecture Document Unique (pour ordersOpen)
```javascript
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

// Une seule fois
const docSnap = await getDoc(doc(db, 'etablissements', etablissementId));
const ordersOpen = docSnap.data().ordersOpen;

// Temps réel
useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, 'etablissements', etablissementId),
    (docSnap) => {
      if (docSnap.exists()) {
        setOrdersOpen(docSnap.data().ordersOpen);
      }
    }
  );
  return () => unsubscribe();
}, [etablissementId]);
```

---

## 🐛 BUGS CONNUS RÉSOLUS

1. ✅ Total incorrect (6 Oct) - Calcul sous-total + pourboire corrigé
2. ✅ Noms illisibles tablette (6 Oct) - CSS text overflow corrigé
3. ✅ Retour prématuré menu (6 Oct) - Logique navigation corrigée
4. ✅ Import Check manquant (17 Oct) - `import { Check } from 'lucide-react'` ajouté
5. ✅ Input affiche 01 (6 Oct) - `parseInt()` gestion corrigée

---

## ⚠️ LIMITATIONS & AMÉLIORATIONS POSSIBLES

### Fonctionnalités manquantes (Phase 4+)
- Dashboard analytics/stats avancées
- Historique commandes avec recherche/filtres
- Notifications push (Web Push API)
- Paiement en ligne
- App mobile native
- Mode offline
- Multi-langue (i18n)
- Export données (CSV, PDF)
- Personnalisation visuelle par club (logo, couleurs)

### Optimisations techniques possibles
- Mise en cache des rôles (éviter appel à chaque page)
- Listener temps réel sur document user (si rôle change)
- Pagination pour liste clubs (si > 50 clubs)
- Recherche/filtres dans listes
- Compression images menu
- Service Worker pour PWA

---

## 🚀 COMMANDES UTILES

```bash
# Démarrer en dev
npm start

# Build production
npm run build

# Git workflow
git checkout -b feature/nom-feature
git add .
git commit -m "Message"
git push

# Installer dépendance
npm install [package]
```

---

## 📦 DÉPENDANCES PRINCIPALES

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "firebase": "^10.x.x",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "tailwindcss": "^3.x.x"
  }
}
```

---

## 🎯 ROUTES DE L'APPLICATION

### Routes Publiques
- `/{club-id}` → Interface client (commande)
- `/{club-id}/start` → Page d'accueil WiFi

### Routes Protégées (Auth requise)
- `/admin/login` → Page de connexion
- `/admin` → SuperAdminInterface (super_admin uniquement)
- `/admin/clubs` → ClubsManager (super_admin uniquement)
- `/admin/users` → UsersManager (super_admin uniquement)
- `/{club-id}/admin` → ClubAdminInterface (permissions vérifiées)
- `/{club-id}/tablette` → Interface tablette (auth requise)

### Routes Utilitaires
- `/show-uid` → Affichage UID Firebase (pour setup initial)

---

## 📞 INFORMATIONS DE CONTACT

- **Firebase Console** : https://console.firebase.google.com
- **Projet Firebase** : quickbarsnclub
- **Vercel Dashboard** : https://vercel.com/quickbar01s-projects
- **GitHub Repo** : https://github.com/QuickBar01/quickbar-app

---

## 🔐 SÉCURITÉ

- **Variables d'environnement** : Fichier `.env` (NE PAS COMMIT)
- **Clés Firebase** : Stockées dans Vercel (6 variables)
- **Auth Admin** : Email/Password activé dans Firebase Auth
- **Règles Firestore** : Lecture publique, écriture auth (sauf commandes)

---

## 📝 NOTES IMPORTANTES POUR CLAUDE CODE

1. **Tout le code client/tablette est dans `src/App.js`** - Ne pas chercher de fichiers séparés
2. **Les IDs Firestore auto-générés** (ex: `lMA7bYsOwIRe1KijpVJc`) sont normaux et recommandés
3. **Le champ `ordersOpen`** existe déjà dans Firebase mais pas encore utilisé dans le code
4. **Style Matrix/terminal** : Respecter le design noir + vert néon #00FF41
5. **Mobile-first** : Toutes les interfaces doivent être responsive
6. **Synchronisation temps réel** : Utiliser `onSnapshot` pour toutes les mises à jour
7. **Gestion d'erreurs** : Toujours wrapper les appels Firebase dans try/catch

---

## ✅ CHECKLIST AVANT DE CODER

Avant toute modification :
- [ ] Créer une branche Git : `git checkout -b feature/nom`
- [ ] S'assurer que `npm start` fonctionne
- [ ] Vérifier que Firebase Console est accessible
- [ ] Confirmer que `ordersOpen: true` existe dans `etablissements/club-test`
- [ ] Tester les interfaces existantes (client + tablette)

---

---

## 📈 PROGRESSION PROJET

```
Phase 1 : Authentification Admin         [████████████████████] 100% ✅
Phase 2 : Gestion Menu CRUD              [████████████████████] 100% ✅
Phase 2.5 : Stop/Start Commandes         [████████████████████] 100% ✅
Phase 3 : Multi-Établissements           [████████████████████] 100% ✅
Phase 4 : Analytics & Avancées           [░░░░░░░░░░░░░░░░░░░░]   0% ⏳
```

---

**Dernière mise à jour** : 21 Octobre 2025
**Version** : 2.0 (Phase 3 complétée)
**Pour** : Claude Code
**Branche actuelle** : feature/multi-etablissements