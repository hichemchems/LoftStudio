# 📤 Guide Complet d'Upload LoftBarber Frontend vers o2switch

## 🎯 Objectif
Uploader les fichiers React compilés depuis votre machine locale vers o2switch pour remplacer la page de maintenance par l'application complète.

## 📋 Prérequis
- ✅ Frontend compilé localement (`frontend/dist/` existe)
- ✅ Accès à cPanel o2switch
- ✅ Accès FTP ou File Manager

---

## 📁 Fichiers à Uploader

### Structure des fichiers :
```
frontend/dist/
├── index.html          (455 octets)
├── vite.svg           (1.5 Ko)
└── assets/
    ├── index-CgW4wrZc.css  (37.3 Ko)
    └── index-CgcuMKXJ.js   (546.9 Ko)
```

### Emplacement cible sur o2switch :
```
~/public_html/loftbarber/frontend/dist/
```

---

## 🚀 Méthode 1: Upload via cPanel File Manager (Recommandé)

### Étape 1: Accéder à cPanel
1. Connectez-vous à votre cPanel o2switch
2. Cherchez **"File Manager"** dans la section **"Files"**
3. Cliquez sur **"File Manager"**

### Étape 2: Naviguer vers le dossier cible
1. Dans File Manager, allez dans `public_html`
2. Ouvrez le dossier `loftbarber`
3. Ouvrez le dossier `frontend`
4. **Vérifiez** si le dossier `dist` existe :
   - ✅ **S'il existe** : Ouvrez-le et videz son contenu
   - ❌ **S'il n'existe pas** : Créez-le

### Étape 3: Uploader les fichiers
1. Cliquez sur **"Upload"** en haut
2. **Sélectionnez tous les fichiers** depuis `frontend/dist/` :
   - `index.html`
   - `vite.svg`
   - Le dossier `assets` complet
3. Cliquez sur **"Upload"**

### Étape 4: Vérifier l'upload
1. Rafraîchissez File Manager
2. Vérifiez que tous les fichiers sont présents :
   ```
   dist/
   ├── index.html
   ├── vite.svg
   └── assets/
       ├── index-CgW4wrZc.css
       └── index-CgcuMKXJ.js
   ```

---

## 🚀 Méthode 2: Upload via FTP

### Étape 1: Connexion FTP
1. Utilisez un client FTP (FileZilla, Cyberduck, etc.)
2. **Serveur** : Votre domaine (ex: `ftp.loft-barber.com`)
3. **Utilisateur** : Votre nom d'utilisateur cPanel
4. **Mot de passe** : Votre mot de passe cPanel
5. **Port** : 21

### Étape 2: Naviguer vers le dossier cible
1. Allez dans `/public_html/loftbarber/frontend/`
2. Si `dist` existe, videz-le
3. Sinon, créez le dossier `dist`

### Étape 3: Uploader les fichiers
1. Depuis votre machine locale : `frontend/dist/`
2. Vers le serveur : `/public_html/loftbarber/frontend/dist/`
3. Uploadez **tous les fichiers** :
   - `index.html`
   - `vite.svg`
   - Dossier `assets/` complet

---

## 🔄 Redémarrage de l'Application Node.js

### Étape 1: Accéder au Node.js Selector
1. Retournez dans cPanel
2. Cherchez **"Node.js Selector"** dans la section **"Software"**
3. Cliquez sur **"Node.js Selector"**

### Étape 2: Redémarrer l'application
1. Trouvez votre application **"loftbarber"**
2. Cliquez sur **"Restart"**
3. Attendez que le statut passe à **"Running"**

---

## ✅ Vérification Finale

### Étape 1: Tester l'application
1. Ouvrez votre navigateur
2. Allez sur `https://loft-barber.com`
3. **Vous devriez voir** :
   - ❌ Plus la page de maintenance
   - ✅ Votre application React complète

### Étape 2: Vérifier les fonctionnalités
1. Testez la navigation
2. Vérifiez que les images se chargent
3. Testez les formulaires si présents

---

## 🔧 Dépannage

### Problème: Page de maintenance toujours affichée
**Solution** :
1. Vérifiez que tous les fichiers sont uploadés
2. Redémarrez l'application Node.js
3. Videz le cache de votre navigateur (Ctrl+F5)

### Problème: Erreur 404
**Solution** :
1. Vérifiez les chemins dans File Manager
2. Assurez-vous que `dist/index.html` existe
3. Vérifiez les permissions des fichiers (devraient être 644)

### Problème: Application ne démarre pas
**Solution** :
1. Vérifiez les logs dans cPanel > Node.js Selector > Logs
2. Assurez-vous que l'environnement virtuel est activé
3. Vérifiez la configuration de l'application

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs d'erreur dans cPanel
2. Contactez le support o2switch si nécessaire
3. Fournissez les détails de l'erreur pour diagnostic

---

## 🎉 Résultat Attendu

Après upload réussi :
- ✅ Application React complète chargée
- ✅ Performance optimisée (fichiers statiques)
- ✅ Interface utilisateur moderne
- ✅ Toutes les fonctionnalités disponibles

**Temps estimé** : 10-15 minutes
