import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../contexts/RoleContext';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const SuperAdminInterface = () => {
  const { user, logout } = useAuth();
  const { isSuperAdmin, userRole, displayName, loading: roleLoading, reloadRole } = useRole();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClubs: 0,
    activeClubs: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      const q = query(collection(db, 'etablissements'), orderBy('nom'));
      const snapshot = await getDocs(q);

      const clubsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setClubs(clubsData);

      // Calculer stats basiques
      setStats({
        totalClubs: clubsData.length,
        activeClubs: clubsData.filter(c => c.actif).length,
        totalRevenue: 0 // TODO: Phase 4
      });
    } catch (error) {
      console.error('Erreur chargement clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Voulez-vous vous déconnecter ?')) {
      const result = await logout();
      if (result.success) {
        window.location.href = '/admin/login';
      } else {
        alert('Erreur lors de la déconnexion');
      }
    }
  };

  // Vérification permissions
  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl font-mono" style={{ color: '#00FF41' }}>
          Chargement...
        </div>
      </div>
    );
  }

  if (!isSuperAdmin()) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <div className="text-2xl font-bold mb-4" style={{ color: '#00FF41' }}>
            Accès Refusé
          </div>
          <div className="text-gray-400 mb-6">
            Vous devez être Super Admin pour accéder à cette page.
            <br />
            <span className="text-sm">Rôle actuel : {userRole || 'aucun'}</span>
            <br />
            <span className="text-xs text-gray-500">UID : {user?.uid}</span>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={reloadRole}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
            >
              🔄 Recharger les permissions
            </button>
            <button
              onClick={async () => {
                await logout();
                window.location.href = '/admin/login';
              }}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded font-bold"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black" style={{ color: '#00FF41' }}>
      {/* HEADER */}
      <div className="border-b p-4" style={{ borderColor: '#00FF41' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold">SUPER ADMIN DASHBOARD</div>
            <div className="text-sm text-gray-400">
              {displayName} • {user?.email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="border-b" style={{ borderColor: '#00FF41' }}>
        <div className="max-w-7xl mx-auto flex gap-4 p-4">
          <a
            href="/admin"
            className="px-4 py-2 bg-gray-800 rounded font-bold"
          >
            Dashboard
          </a>
          <a
            href="/admin/clubs"
            className="px-4 py-2 hover:bg-gray-800 rounded"
          >
            Clubs
          </a>
          <a
            href="/admin/users"
            className="px-4 py-2 hover:bg-gray-800 rounded"
          >
            Utilisateurs
          </a>
        </div>
      </div>

      {/* STATS GLOBALES */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border rounded p-6" style={{ borderColor: '#00FF41' }}>
            <div className="text-gray-400 text-sm mb-2">Total Clubs</div>
            <div className="text-4xl font-bold">{stats.totalClubs}</div>
          </div>
          <div className="border rounded p-6" style={{ borderColor: '#00FF41' }}>
            <div className="text-gray-400 text-sm mb-2">Clubs Actifs</div>
            <div className="text-4xl font-bold">{stats.activeClubs}</div>
          </div>
          <div className="border rounded p-6" style={{ borderColor: '#00FF41' }}>
            <div className="text-gray-400 text-sm mb-2">CA Total (Phase 4)</div>
            <div className="text-4xl font-bold text-gray-600">-</div>
          </div>
        </div>

        {/* LISTE CLUBS */}
        <div className="border rounded p-6" style={{ borderColor: '#00FF41' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Établissements</h2>
            <a
              href="/admin/clubs"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold"
            >
              + Gérer les clubs
            </a>
          </div>

          <div className="space-y-2">
            {clubs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                Aucun établissement trouvé
              </div>
            ) : (
              clubs.map(club => (
                <div
                  key={club.id}
                  className="flex items-center justify-between p-4 bg-gray-900 rounded"
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl ${club.actif ? 'text-green-400' : 'text-gray-600'}`}>
                      {club.actif ? '🟢' : '⚫'}
                    </div>
                    <div>
                      <div className="font-bold">{club.nom}</div>
                      <div className="text-sm text-gray-400">ID: {club.id}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/${club.id}/admin`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                    >
                      Admin Club
                    </a>
                    <a
                      href={`/${club.id}`}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Vue Client
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminInterface;
