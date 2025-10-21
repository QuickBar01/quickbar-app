import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [clubAccess, setClubAccess] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reloadRole = async () => {
    if (!user) {
      console.log('⚠️ Impossible de recharger : pas d\'utilisateur connecté');
      return;
    }

    console.log('🔄 Rechargement manuel du rôle...');
    setLoading(true);
    setError(null);

    try {
      await loadUserRole(0);
      console.log('✅ Rechargement terminé');
    } catch (err) {
      console.error('❌ Erreur lors du rechargement:', err);
      setError(err.message);
    }
  };

  const loadUserRole = async (retryCount = 0) => {
    if (!user) {
      setUserRole(null);
      setClubAccess([]);
      setDisplayName('');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      console.log('🔥 Project ID:', db.app.options.projectId);
      console.log('🆔 UID recherché:', user.uid);
      console.log('📄 Chemin document:', `users/${user.uid}`);
      console.log('🔍 Tentative de chargement du rôle pour UID:', user.uid);
      const userDocRef = doc(db, 'users', user.uid);
      console.log('🔗 Référence complète:', userDocRef.path);
      console.log('📄 Référence document créée:', userDocRef.path);
      const userDocSnap = await getDoc(userDocRef);
      console.log('📥 Réponse reçue. Document existe?', userDocSnap.exists());

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData.role || null;

        setUserRole(role);
        setDisplayName(userData.displayName || userData.email || 'Utilisateur');

        // Super-admin n'a pas besoin de clubAccess (accès à tout)
        if (role === 'super_admin') {
          setClubAccess([]);
          console.log('✅ Super Admin chargé:', userData.displayName || user.email);
        } else if (role === 'club_admin') {
          setClubAccess(userData.clubAccess || []);
          console.log('✅ Admin Club chargé:', userData.displayName, 'Accès:', userData.clubAccess);
        } else {
          setClubAccess([]);
          console.log('✅ Utilisateur chargé:', userData.displayName, 'Rôle:', role || 'aucun');
        }
        setLoading(false);
      } else {
        // Si le document n'existe pas, considérer comme pas de rôle
        console.warn('⚠️ Document users/' + user.uid + ' n\'existe pas dans Firestore');
        setUserRole(null);
        setClubAccess([]);
        setDisplayName('');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Erreur chargement rôle utilisateur (tentative ' + (retryCount + 1) + '):', error);

      // Retry jusqu'à 3 fois en cas d'erreur réseau
      if (retryCount < 3) {
        console.log('🔄 Nouvelle tentative dans 2 secondes...');
        setTimeout(() => loadUserRole(retryCount + 1), 2000);
      } else {
        console.error('❌ Échec après 3 tentatives. Vérifiez votre connexion.');
        setUserRole(null);
        setClubAccess([]);
        setDisplayName('');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadUserRole(0);
  }, [user]);

  // Fonctions utilitaires
  const isSuperAdmin = () => userRole === 'super_admin';

  const isClubAdmin = (clubId = null) => {
    if (userRole === 'super_admin') return true; // Super admin a accès à tout
    if (userRole !== 'club_admin') return false;
    if (!clubId) return true; // Vérifie juste qu'il est club_admin
    return clubAccess.includes(clubId);
  };

  const canAccessClub = (clubId) => {
    return isSuperAdmin() || isClubAdmin(clubId);
  };

  const value = {
    userRole,
    clubAccess,
    displayName,
    loading,
    error,
    isSuperAdmin,
    isClubAdmin,
    canAccessClub,
    reloadRole
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};
