import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, AlertCircle } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const { login, error: authError, setError } = useAuth();

  // Récupérer le returnUrl depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const returnUrl = urlParams.get('returnUrl');

  // Nettoyer les erreurs au montage du composant
  useEffect(() => {
    setError('');
    setLocalError('');
  }, [setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation basique
    if (!email || !password) {
      setLocalError('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    setLocalError('');

    const result = await login(email, password);

    if (result.success) {
      // Si returnUrl existe, rediriger vers cette URL
      if (returnUrl) {
        window.location.href = returnUrl;
      } else if (onLoginSuccess) {
        // Sinon, utiliser le callback par défaut
        onLoginSuccess();
      }
    } else {
      setLocalError(result.error);
    }

    setIsLoading(false);
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-xl mb-4 font-mono" style={{ color: '#00FF41' }}>
            ╔════════════════════════════════════╗
          </div>
          <div className="text-xl mb-4 font-mono" style={{ color: '#00FF41' }}>
            ║  QUICKBAR ADMIN v1.0              ║
          </div>
          <div className="text-xl mb-4 font-mono" style={{ color: '#00FF41' }}>
            ╚════════════════════════════════════╝
          </div>
          {returnUrl && (
            <div className="mt-4 p-3 border rounded" style={{ borderColor: '#00FF41', backgroundColor: 'rgba(0, 255, 65, 0.1)' }}>
              <div className="text-xs text-gray-400 mb-1">Redirection après connexion :</div>
              <div className="text-sm font-mono" style={{ color: '#00FF41' }}>
                {returnUrl}
              </div>
            </div>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-mono mb-2"
              style={{ color: '#00FF41' }}
            >
              &gt; Email administrateur
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} style={{ color: '#00FF41' }} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-black border font-mono focus:outline-none focus:border-green-300"
                style={{ 
                  borderColor: '#00FF41', 
                  color: '#00FF41'
                }}
                placeholder="admin@quickbar.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-mono mb-2"
              style={{ color: '#00FF41' }}
            >
              &gt; Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} style={{ color: '#00FF41' }} />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-black border font-mono focus:outline-none focus:border-green-300"
                style={{ 
                  borderColor: '#00FF41', 
                  color: '#00FF41'
                }}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Error Message */}
          {displayError && (
            <div 
              className="p-3 border rounded flex items-center gap-2"
              style={{ 
                borderColor: '#ff4141',
                backgroundColor: 'rgba(255, 65, 65, 0.1)'
              }}
            >
              <AlertCircle size={18} style={{ color: '#ff4141' }} />
              <span className="text-sm font-mono" style={{ color: '#ff4141' }}>
                {displayError}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 font-mono font-bold text-black rounded transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: '#00FF41'
            }}
          >
            {isLoading ? 'CONNEXION...' : 'SE CONNECTER'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="text-xs font-mono" style={{ color: '#00FF41', opacity: 0.6 }}>
            Accès réservé aux administrateurs
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;