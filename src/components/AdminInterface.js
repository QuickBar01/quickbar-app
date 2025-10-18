import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Settings, Menu, Home, Check } from 'lucide-react';
import MenuManager from './MenuManager';

const AdminInterface = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      // La redirection sera gérée par App.js
      console.log('Déconnexion réussie');
    }
  };

  return (
    <div className="min-h-screen bg-black" style={{ color: '#00FF41' }}>
      {/* Header avec déconnexion */}
      <div className="border-b" style={{ borderColor: '#00FF41' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold font-mono">QUICKBAR ADMIN</h1>
            </div>
            
            <div className="flex items-center gap-6">
              {/* User info */}
              <div className="flex items-center gap-2 text-sm font-mono">
                <User size={16} />
                <span className="hidden sm:inline">{user?.email}</span>
              </div>
              
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-900 transition-colors font-mono"
                style={{ borderColor: '#00FF41' }}
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="border-b" style={{ borderColor: '#00FF41' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 py-2">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`px-4 py-2 font-mono flex items-center gap-2 border-b-2 transition-colors ${
                activeSection === 'dashboard' 
                  ? 'border-green-400' 
                  : 'border-transparent hover:border-gray-600'
              }`}
              style={{ color: '#00FF41' }}
            >
              <Home size={18} />
              TABLEAU DE BORD
            </button>
            <button
              onClick={() => setActiveSection('menu')}
              className={`px-4 py-2 font-mono flex items-center gap-2 border-b-2 transition-colors ${
                activeSection === 'menu' 
                  ? 'border-green-400' 
                  : 'border-transparent hover:border-gray-600'
              }`}
              style={{ color: '#00FF41' }}
            >
              <Menu size={18} />
              GESTION MENU
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'dashboard' && (
          <>
            {/* Welcome Section */}
            <div className="mb-8 p-6 border rounded-lg" style={{ borderColor: '#00FF41' }}>
              <h2 className="text-xl font-bold mb-4 font-mono flex items-center gap-2">
                <Settings size={20} />
                TABLEAU DE BORD
              </h2>
              <p className="text-gray-400 mb-4">
                Bienvenue dans l'interface d'administration QuickBar. 
                Vous êtes connecté en tant que : <span style={{ color: '#00FF41' }}>{user?.email}</span>
              </p>
              <p className="text-sm text-gray-500">
                Session authentifiée • ID: {user?.uid?.substring(0, 8)}...
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gestion Menu */}
              <div className="border rounded-lg p-6" style={{ borderColor: '#00FF41' }}>
                <h3 className="text-lg font-bold mb-4 font-mono flex items-center gap-2">
                  <Menu size={18} />
                  GESTION DU MENU
                </h3>
                <p className="text-gray-400 mb-4">
                  Gérez les items de votre menu, modifiez les prix et la disponibilité.
                </p>
                <button 
                  onClick={() => setActiveSection('menu')}
                  className="w-full py-2 font-mono border rounded hover:bg-gray-900 transition-colors"
                  style={{ borderColor: '#00FF41', backgroundColor: 'rgba(0, 255, 65, 0.1)' }}
                >
                  ACCÉDER AU MENU
                </button>
              </div>

              {/* Statistiques */}
              <div className="border rounded-lg p-6" style={{ borderColor: '#00FF41' }}>
                <h3 className="text-lg font-bold mb-4 font-mono">📊 STATISTIQUES</h3>
                <p className="text-gray-400 mb-4">
                  Consultez vos statistiques de vente et analysez les performances.
                </p>
                <button 
                  className="w-full py-2 font-mono border rounded hover:bg-gray-900 transition-colors"
                  style={{ borderColor: '#00FF41' }}
                  disabled
                >
                  BIENTÔT DISPONIBLE
                </button>
              </div>

              {/* Paramètres établissement */}
              <div className="border rounded-lg p-6" style={{ borderColor: '#00FF41' }}>
                <h3 className="text-lg font-bold mb-4 font-mono">⚙️ PARAMÈTRES</h3>
                <p className="text-gray-400 mb-4">
                  Configurez les informations de votre établissement.
                </p>
                <button 
                  className="w-full py-2 font-mono border rounded hover:bg-gray-900 transition-colors"
                  style={{ borderColor: '#00FF41' }}
                  disabled
                >
                  BIENTÔT DISPONIBLE
                </button>
              </div>

              {/* Historique commandes */}
              <div className="border rounded-lg p-6" style={{ borderColor: '#00FF41' }}>
                <h3 className="text-lg font-bold mb-4 font-mono">📋 HISTORIQUE</h3>
                <p className="text-gray-400 mb-4">
                  Consultez l'historique des commandes passées.
                </p>
                <button 
                  className="w-full py-2 font-mono border rounded hover:bg-gray-900 transition-colors"
                  style={{ borderColor: '#00FF41' }}
                  disabled
                >
                  BIENTÔT DISPONIBLE
                </button>
              </div>
            </div>

            {/* Info Section */}
            <div className="mt-8 p-4 border rounded-lg" style={{ borderColor: '#00FF41', opacity: 0.5 }}>
              <p className="text-sm text-center font-mono">
                Phase 1 - Authentification ✅ | Phase 2 - Menu CRUD ✅
              </p>
            </div>
          </>
        )}

        {activeSection === 'menu' && (
          <MenuManager etablissementId="club-test" />
        )}
      </div>
    </div>
  );
};

export default AdminInterface;