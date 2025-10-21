# Configuration des Variables d'Environnement sur Vercel

## ⚠️ IMPORTANT - À FAIRE IMMÉDIATEMENT

Votre application ne fonctionnera PAS sur Vercel tant que vous n'aurez pas configuré les variables d'environnement.

## Étapes de Configuration

### 1. Accéder aux Paramètres Vercel

1. Allez sur https://vercel.com/quickbar01s-projects/quickbar-app
2. Cliquez sur l'onglet **Settings**
3. Dans le menu latéral, cliquez sur **Environment Variables**

### 2. Ajouter les Variables Firebase

Pour chaque variable ci-dessous, cliquez sur **Add New** et remplissez :

| Name | Value | Environment |
|------|-------|-------------|
| `REACT_APP_FIREBASE_API_KEY` | `AIzaSyBxcUWhfCubVScAN2jyL3AVrwW1dhX7mZ4` | Production, Preview, Development |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | `quickbarsnclub.firebaseapp.com` | Production, Preview, Development |
| `REACT_APP_FIREBASE_PROJECT_ID` | `quickbarsnclub` | Production, Preview, Development |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | `quickbarsnclub.firebasestorage.app` | Production, Preview, Development |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | `856351316525` | Production, Preview, Development |
| `REACT_APP_FIREBASE_APP_ID` | `1:856351316525:web:03d208f1a30731aa5176a4` | Production, Preview, Development |

**Note:** Cochez les 3 cases (Production, Preview, Development) pour chaque variable.

### 3. Redéployer l'Application

Une fois toutes les variables ajoutées :

1. Allez dans l'onglet **Deployments**
2. Cliquez sur les 3 points `...` du dernier déploiement
3. Cliquez sur **Redeploy**
4. Attendez 2-3 minutes que le déploiement se termine

### 4. Vérifier que ça Fonctionne

Testez ces URLs :
- https://quickbar-app.vercel.app/admin
- https://quickbar-app.vercel.app/test-club/admin

Si tout est configuré correctement, vous devriez voir l'interface d'administration.

---

## 🔐 Après Configuration Vercel - Révoquer les Anciennes Clés

### ⚠️ CRITIQUE : Vos clés Firebase ont été exposées publiquement sur GitHub !

**Historique GitHub conserve toutes les anciennes versions** où les clés étaient visibles.

### Actions à Prendre

#### 1. Générer de Nouvelles Clés Firebase

1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet **quickbarsnclub**
3. Allez dans **Project Settings** (⚙️ en haut à gauche)
4. Descendez à **Your apps** → Section **SDK setup and configuration**
5. Cliquez sur **Config** pour voir vos clés actuelles

**Pour créer une nouvelle app :**
1. Cliquez sur **Add app** → Sélectionnez **Web** (icône `</>`
2. Donnez un nom : `QuickBar Web App v2`
3. Cochez **Firebase Hosting**
4. Cliquez sur **Register app**
5. Copiez les nouvelles clés de configuration

#### 2. Supprimer l'Ancienne App Firebase

1. Dans **Project Settings** → **Your apps**
2. Trouvez l'ancienne app (celle avec les clés exposées)
3. Cliquez sur les 3 points `...` → **Delete app**

#### 3. Mettre à Jour les Variables

**Local (.env) :**
```bash
# Remplacez les valeurs dans votre fichier .env local
REACT_APP_FIREBASE_API_KEY=nouvelle_clé_ici
REACT_APP_FIREBASE_AUTH_DOMAIN=quickbarsnclub.firebaseapp.com
# ... etc
```

**Vercel :**
1. Retournez sur https://vercel.com/quickbar01s-projects/quickbar-app/settings/environment-variables
2. Pour chaque variable, cliquez sur les 3 points → **Edit**
3. Remplacez par les nouvelles valeurs
4. Cliquez sur **Save**
5. Redéployez l'application

#### 4. Nettoyer l'Historique GitHub (Avancé)

**Option A : Créer un Nouveau Repository (Recommandé pour débutants)**
1. Créer un nouveau repo GitHub
2. Pousser le code actuel (sans les clés) vers le nouveau repo
3. Configurer Vercel pour utiliser le nouveau repo
4. Supprimer l'ancien repo

**Option B : Utiliser BFG Repo-Cleaner (Avancé)**
```bash
# Télécharger BFG : https://rtyley.github.io/bfg-repo-cleaner/
# Nettoyer l'historique
bfg --replace-text passwords.txt quickbar-app.git
cd quickbar-app.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

---

## 📋 Checklist de Sécurité

- [ ] Variables d'environnement configurées sur Vercel
- [ ] Application redéployée sur Vercel
- [ ] Application fonctionne en production
- [ ] Nouvelles clés Firebase générées
- [ ] Anciennes clés révoquées/app supprimée
- [ ] .env local mis à jour avec nouvelles clés
- [ ] Variables Vercel mises à jour avec nouvelles clés
- [ ] Application redéployée avec nouvelles clés
- [ ] Ancien repository supprimé ou historique nettoyé

---

## 🆘 En Cas de Problème

Si votre compte Google/Firebase est toujours désactivé :
1. Vérifiez vos emails Google pour la raison
2. Contactez le support Firebase : https://firebase.google.com/support
3. Expliquez que vous avez exposé accidentellement vos clés API
4. Montrez que vous les avez révoquées et sécurisées
