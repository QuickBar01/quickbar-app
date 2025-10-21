import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ShowUID = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center" style={{ color: '#00FF41' }}>
          <div className="text-2xl mb-4">Non connecté</div>
          <a href="/admin/login" className="text-lg underline">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.uid);
    alert('UID copié dans le presse-papier !');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#00FF41' }}>
            VOS INFORMATIONS ADMIN
          </h1>
        </div>

        <div className="border rounded-lg p-6 mb-4" style={{ borderColor: '#00FF41' }}>
          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-2">Email :</div>
            <div className="text-xl font-mono" style={{ color: '#00FF41' }}>
              {user.email}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-2">UID Firebase :</div>
            <div className="text-lg font-mono break-all bg-gray-900 p-4 rounded" style={{ color: '#00FF41' }}>
              {user.uid}
            </div>
          </div>

          <button
            onClick={copyToClipboard}
            className="w-full py-3 rounded-lg font-bold hover:opacity-80"
            style={{ backgroundColor: '#00FF41', color: '#000000' }}
          >
            📋 COPIER UID
          </button>
        </div>

        <div className="border border-yellow-500 rounded-lg p-6 bg-yellow-900 bg-opacity-10">
          <div className="text-yellow-400 font-bold mb-2">
            📝 ÉTAPE SUIVANTE : Créer votre document Super Admin
          </div>
          <div className="text-gray-300 text-sm space-y-2">
            <p>1. Allez sur Firebase Console → Firestore Database</p>
            <p>2. Créez une collection "users"</p>
            <p>3. Créez un document avec l'ID : <span className="font-mono text-yellow-400">{user.uid}</span></p>
            <p>4. Ajoutez ces champs :</p>
            <div className="bg-black p-3 rounded mt-2 font-mono text-xs">
              email: "{user.email}"<br/>
              role: "super_admin"<br/>
              clubAccess: []<br/>
              createdAt: [Timestamp now]
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/admin" className="text-gray-400 hover:text-gray-300 underline">
            ← Retour admin
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShowUID;
