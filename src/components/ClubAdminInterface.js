import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../contexts/RoleContext';
import MenuManager from './MenuManager';

const ClubAdminInterface = ({ clubId }) => {
  const { user } = useAuth();
  const { canAccessClub, isSuperAdmin, loading } = useRole();

  const handleLogout = () => {
    if (window.confirm('Voulez-vous vous déconnecter ?')) {
      window.location.href = '/admin/login';
    }
  };

  // Vérification permissions
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl font-mono" style={{ color: '#00FF41' }}>
          Chargement...
        </div>
      </div>
    );
  }

  if (!canAccessClub(clubId)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <div className="text-2xl font-bold mb-4" style={{ color: '#00FF41' }}>
            Accès Refusé
          </div>
          <div className="text-gray-400 mb-6">
            Vous n'avez pas les permissions pour accéder à ce club.
          </div>
          <button
            onClick={() => window.location.href = '/admin'}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded font-bold"
          >
            Retour Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black" style={{ color: '#00FF41' }}>
      {/* HEADER */}
      <div className="border-b p-4" style={{ borderColor: '#00FF41' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="text-2xl font-bold">ADMIN - {clubId.toUpperCase()}</div>
              <div className="text-sm text-gray-400">
                {user?.email} {isSuperAdmin() && <span className="text-yellow-400">• Super Admin</span>}
              </div>
            </div>
            <div className="flex gap-2">
              {isSuperAdmin() && (
                <a
                  href="/admin"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                >
                  ← Super Admin
                </a>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Déconnexion
              </button>
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="flex gap-4 mt-4 text-sm">
            <a
              href={`/${clubId}/admin`}
              className="px-3 py-2 bg-gray-800 rounded font-bold"
            >
              Menu
            </a>
            <a
              href={`/${clubId}/tablette`}
              className="px-3 py-2 hover:bg-gray-800 rounded"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tablette →
            </a>
            <a
              href={`/${clubId}`}
              className="px-3 py-2 hover:bg-gray-800 rounded"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vue Client →
            </a>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div className="max-w-7xl mx-auto p-6">
        <MenuManager etablissementId={clubId} />
      </div>
    </div>
  );
};

export default ClubAdminInterface;
