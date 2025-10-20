import React, { useState, useEffect } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import AdminInterface from './components/AdminInterface';

// Wrapper pour la logique principale avec auth
const RestaurantOrderSystemWithAuth = () => {
  const { user, loading } = useAuth();
  const pathParts = window.location.pathname.split('/').filter(p => p);
  const firstPart = pathParts[0] || 'demo';
  const secondPart = pathParts[1] || '';
  
  // Routes admin
  if (firstPart === 'admin') {
    // Si loading, afficher un loader
    if (loading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-xl font-mono" style={{ color: '#00FF41' }}>
            Chargement...
          </div>
        </div>
      );
    }
    
    // Route /admin/login
    if (secondPart === 'login') {
      // Si déjà connecté, rediriger vers /admin
      if (user) {
        window.location.href = '/admin';
        return null;
      }
      return <Login onLoginSuccess={() => window.location.href = '/admin'} />;
    }
    
    // Route /admin (et autres sous-routes admin)
    // Si pas connecté, rediriger vers login
    if (!user) {
      window.location.href = '/admin/login';
      return null;
    }
    
    // Si connecté, afficher l'interface admin
    return <AdminInterface />;
  }
  
  // Routes publiques (client/tablette)
  const etablissementId = firstPart;
  const page = secondPart;

  // Route tablette (PROTÉGÉE - nécessite authentification)
  if (page === 'tablette') {
    // Si loading, afficher un loader
    if (loading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-xl font-mono" style={{ color: '#00FF41' }}>
            Chargement...
          </div>
        </div>
      );
    }

    // Si pas connecté, afficher écran d'accès réservé
    if (!user) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-8" style={{ color: '#00FF41' }}>🔒</div>
            <div className="text-3xl font-bold mb-4" style={{ color: '#00FF41' }}>
              Accès Réservé
            </div>
            <div className="text-lg text-gray-400 mb-8">
              Cette page est réservée au personnel.
              <br />
              Veuillez vous connecter pour continuer.
            </div>
            <a
              href="/admin/login"
              className="inline-block px-8 py-4 rounded-lg font-bold text-lg hover:opacity-80"
              style={{ backgroundColor: '#00FF41', color: '#000000' }}
            >
              SE CONNECTER
            </a>
            <div className="mt-6">
              <a
                href={`/${etablissementId}`}
                className="text-gray-500 hover:text-gray-300 text-sm"
              >
                ← Retour au menu client
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Si connecté, afficher la tablette
    return <TabletInterface etablissementId={etablissementId} />;
  }

  if (page === 'start') {
    return <StartPage etablissementId={etablissementId} />;
  }

  return <ClientInterface etablissementId={etablissementId} />;
};

// Composant principal avec AuthProvider
const RestaurantOrderSystem = () => {
  return (
    <AuthProvider>
      <RestaurantOrderSystemWithAuth />
    </AuthProvider>
  );
};

// StartPage Component (inchangé)
const StartPage = ({ etablissementId }) => {
  const [connected, setConnected] = useState(false);
  const [wifiInfo, setWifiInfo] = useState({ ssid: 'Chargement...', password: '...' });
  
  useEffect(() => {
    const loadWifiInfo = async () => {
      const docRef = doc(db, 'etablissements', etablissementId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWifiInfo({ 
          ssid: data.wifi_ssid || 'WiFi non configuré', 
          password: data.wifi_password || '...' 
        });
      } else {
        setWifiInfo({ ssid: 'Établissement non trouvé', password: '...' });
      }
    };
    
    loadWifiInfo();
  }, [etablissementId]);
  
  return (
    <div className="min-h-screen bg-black text-green-400 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-8" style={{ color: '#00FF41' }}>Bienvenue !</h1>
        
        {!connected ? (
          <>
            <p className="text-xl mb-6" style={{ color: '#00FF41' }}>
              Pour commander, connectez-vous d'abord au WiFi
            </p>
            
            <div className="bg-gray-900 border rounded-lg p-6 mb-8" style={{ borderColor: '#00FF41' }}>
              <div className="text-sm text-gray-400 mb-2">Nom du réseau</div>
              <div className="text-2xl font-bold mb-4" style={{ color: '#00FF41' }}>{wifiInfo.ssid}</div>
              
              <div className="text-sm text-gray-400 mb-2">Mot de passe</div>
              <div className="text-xl font-mono" style={{ color: '#00FF41' }}>{wifiInfo.password}</div>
            </div>
            
            <button 
              onClick={() => setConnected(true)}
              className="w-full text-white py-4 rounded-lg font-bold text-lg hover:opacity-80"
              style={{ backgroundColor: '#00FF41', color: '#000000' }}
            >
              C'est fait, je suis connecté
            </button>
          </>
        ) : (
          <>
            <p className="text-xl mb-8" style={{ color: '#00FF41' }}>
              Parfait ! Accédez maintenant au menu
            </p>
            <a 
              href={`/${etablissementId}`}
              className="block w-full text-white py-4 rounded-lg font-bold text-lg hover:opacity-80"
              style={{ backgroundColor: '#00FF41', color: '#000000' }}
            >
              Voir le menu et commander
            </a>
          </>
        )}
      </div>
    </div>
  );
};

// ClientInterface Component (inchangé)
const ClientInterface = ({ etablissementId }) => {
  const [quantities, setQuantities] = useState({});
  const [currentOrderNumber, setCurrentOrderNumber] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [menu, setMenu] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showTipScreen, setShowTipScreen] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [customTip, setCustomTip] = useState('');
  // ============================================
  // PHASE 2.5 : STOP/START COMMANDES
  // ============================================
  const [ordersOpen, setOrdersOpen] = useState(true);
  const [checkingOrdersOpen, setCheckingOrdersOpen] = useState(true);

  // Écoute en temps réel du statut ordersOpen
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'etablissements', etablissementId),
      (docSnap) => {
        if (docSnap.exists()) {
          setOrdersOpen(docSnap.data().ordersOpen ?? true);
        }
        setCheckingOrdersOpen(false);
      },
      (error) => {
        console.error('Erreur écoute ordersOpen:', error);
        setCheckingOrdersOpen(false);
      }
    );

    return () => unsubscribe();
  }, [etablissementId]);

  useEffect(() => {
    const q = query(
      collection(db, 'etablissements', etablissementId, 'menu'),
      orderBy('name')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const menuItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenu(menuItems);
    }, (error) => {
      console.error('Erreur chargement menu:', error);
    });

    return () => unsubscribe();
  }, [etablissementId]);

  useEffect(() => {
    const savedOrderNumber = localStorage.getItem(`currentOrderNumber_${etablissementId}`);
    const savedOrderId = localStorage.getItem(`currentOrderId_${etablissementId}`);
    
    if (savedOrderNumber && savedOrderId) {
      setCurrentOrderNumber(savedOrderNumber);
      setCurrentOrderId(savedOrderId);
      setHasActiveOrder(true);
      setShowCart(true);
    }
  }, [etablissementId]);

  useEffect(() => {
    if (!currentOrderId) return;

    const orderRef = doc(db, 'etablissements', etablissementId, 'commandes', currentOrderId);
    
    const unsubscribe = onSnapshot(orderRef, (docSnap) => {
      if (docSnap.exists()) {
        const orderData = { id: docSnap.id, ...docSnap.data() };
        setCurrentOrder(orderData);
        
        if (orderData.status === 'ready') {
          setShowCart(true);
        }
      } else {
        localStorage.removeItem(`currentOrderNumber_${etablissementId}`);
        localStorage.removeItem(`currentOrderId_${etablissementId}`);
        setCurrentOrder(null);
        setCurrentOrderNumber(null);
        setCurrentOrderId(null);
        setHasActiveOrder(false);
        setShowCart(false);
        setQuantities({});
      }
    }, (error) => {
      console.error('Erreur écoute commande:', error);
    });

    return () => unsubscribe();
  }, [currentOrderId, etablissementId]);

  const handleQuantityChange = (itemId, value) => {
    let numValue = parseInt(value) || 0;
    if (numValue > 20) numValue = 20;
    if (numValue < 0) numValue = 0;
    
    setQuantities(prev => ({
      ...prev,
      [itemId]: numValue
    }));
  };

  const getTotalItems = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(quantities).reduce((sum, [id, qty]) => {
      const item = menu.find(m => m.id === id);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  };

  const selectTipPercentage = (percentage) => {
    const subtotal = getTotalPrice();
    const tip = (subtotal * percentage) / 100;
    setTipAmount(Number(tip.toFixed(2)));
    setCustomTip('');
  };

  const handleCustomTipChange = (value) => {
    setCustomTip(value);
    const numValue = parseFloat(value) || 0;
    setTipAmount(Number(numValue.toFixed(2)));
  };

  const handleValidate = () => {
    const orderItems = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = menu.find(m => m.id === id);
        return { ...item, quantity: qty };
      });

    if (orderItems.length === 0) {
      alert('Panier vide. Ajoutez des articles avant de valider.');
      return;
    }

    setShowTipScreen(true);
  };

  const confirmOrderWithTip = async () => {
    const orderItems = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = menu.find(m => m.id === id);
        return { ...item, quantity: qty };
      });

    const newOrderNumber = Date.now().toString().slice(-6);
    const subtotal = getTotalPrice();
    const total = subtotal + tipAmount;

    const newOrder = {
      number: newOrderNumber,
      items: orderItems,
      subtotal: Number(subtotal.toFixed(2)),
      tip: tipAmount,
      total: Number(total.toFixed(2)),
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(
        collection(db, 'etablissements', etablissementId, 'commandes'),
        newOrder
      );
      
      localStorage.setItem(`currentOrderNumber_${etablissementId}`, newOrderNumber);
      localStorage.setItem(`currentOrderId_${etablissementId}`, docRef.id);

      setCurrentOrderNumber(newOrderNumber);
      setCurrentOrderId(docRef.id);
      setHasActiveOrder(true);
      setShowCart(true);
      setShowTipScreen(false);
    } catch (error) {
      console.error('Erreur création commande:', error);
      alert('Erreur lors de la création de la commande');
    }
  };

  // ÉCRAN DE BLOCAGE SI COMMANDES FERMÉES
  if (checkingOrdersOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse" style={{ color: '#00FF41' }}>
            ⏳
          </div>
          <div className="text-xl font-mono" style={{ color: '#00FF41' }}>
            Vérification disponibilité...
          </div>
        </div>
      </div>
    );
  }

  if (!ordersOpen && !hasActiveOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="max-w-md text-center">
          {/* Icône */}
          <div className="text-6xl mb-8 text-red-500">
            🛑
          </div>

          {/* Message principal */}
          <div className="text-3xl font-bold text-red-500 mb-4">
            Commandes temporairement fermées
          </div>

          {/* Message secondaire */}
          <div className="text-lg text-gray-400 mb-8">
            Nous avons trop de demandes en cours.
            <br />
            Veuillez réessayer dans quelques minutes.
          </div>

          {/* Bouton réessayer */}
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg mb-4"
          >
            RÉESSAYER
          </button>

          {/* Lien retour */}
          <div className="mt-6">
            <a
              href={`/${etablissementId}/start`}
              className="text-gray-500 hover:text-gray-300 text-sm"
            >
              ← Retour
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (showTipScreen) {
    const subtotal = getTotalPrice();
    const total = subtotal + tipAmount;

    return (
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#00FF41' }}>
            Ajouter un pourboire ?
          </h2>

          <div className="bg-gray-900 border rounded-lg p-4 mb-6" style={{ borderColor: '#00FF41' }}>
            <div className="flex justify-between mb-2" style={{ color: '#00FF41' }}>
              <span>Sous-total</span>
              <span className="font-bold">{subtotal.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between mb-2" style={{ color: '#00FF41' }}>
              <span>Pourboire</span>
              <span className="font-bold">{tipAmount.toFixed(2)}€</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between text-xl" style={{ borderColor: '#00FF41', color: '#00FF41' }}>
              <span className="font-bold">TOTAL</span>
              <span className="font-bold">{total.toFixed(2)}€</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => selectTipPercentage(0)}
              className={`py-3 rounded-lg font-bold border ${tipAmount === 0 && customTip === '' ? 'bg-gray-700' : 'bg-gray-900'}`}
              style={{ borderColor: '#00FF41', color: '#00FF41' }}
            >
              Aucun
            </button>
            <button
              onClick={() => selectTipPercentage(5)}
              className="py-3 rounded-lg font-bold bg-gray-900 border hover:bg-gray-700"
              style={{ borderColor: '#00FF41', color: '#00FF41' }}
            >
              5% ({(subtotal * 0.05).toFixed(2)}€)
            </button>
            <button
              onClick={() => selectTipPercentage(10)}
              className="py-3 rounded-lg font-bold bg-gray-900 border hover:bg-gray-700"
              style={{ borderColor: '#00FF41', color: '#00FF41' }}
            >
              10% ({(subtotal * 0.10).toFixed(2)}€)
            </button>
            <button
              onClick={() => selectTipPercentage(15)}
              className="py-3 rounded-lg font-bold bg-gray-900 border hover:bg-gray-700"
              style={{ borderColor: '#00FF41', color: '#00FF41' }}
            >
              15% ({(subtotal * 0.15).toFixed(2)}€)
            </button>
            <button
              onClick={() => selectTipPercentage(20)}
              className="py-3 rounded-lg font-bold bg-gray-900 border hover:bg-gray-700"
              style={{ borderColor: '#00FF41', color: '#00FF41' }}
            >
              20% ({(subtotal * 0.20).toFixed(2)}€)
            </button>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={customTip}
                onChange={(e) => handleCustomTipChange(e.target.value)}
                placeholder="Montant"
                className="w-full bg-black border p-3 rounded-lg text-center font-mono"
                style={{ borderColor: '#00FF41', color: '#00FF41' }}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span style={{ color: '#00FF41' }}>€</span>
              </div>
            </div>
          </div>

          <button
            onClick={confirmOrderWithTip}
            className="w-full py-4 rounded-lg font-bold text-lg mb-3 hover:opacity-80"
            style={{ backgroundColor: '#00FF41', color: '#000000' }}
          >
            CONFIRMER LA COMMANDE
          </button>

          <button
            onClick={() => {
              setShowTipScreen(false);
              setTipAmount(0);
              setCustomTip('');
            }}
            className="w-full py-3 rounded-lg border hover:bg-gray-900"
            style={{ borderColor: '#00FF41', color: '#00FF41' }}
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (hasActiveOrder && !showCart) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="max-w-md text-center">
          <div className="text-xl mb-4" style={{ color: '#00FF41' }}>Commande en cours...</div>
          <div className="text-gray-400 mb-4">
            Votre commande #{currentOrderNumber} est en préparation.
          </div>
          <div className="text-gray-500 text-sm">
            Vous pourrez passer une nouvelle commande une fois celle-ci récupérée.
          </div>
        </div>
      </div>
    );
  }

  if (showCart && currentOrder) {
    const isReady = currentOrder.status === 'ready';

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <style>{`
          @keyframes brightnessGlow {
            0%, 100% {
              opacity: 0.3;
            }
            50% {
              opacity: 1;
            }
          }
          .neon-text-pulse {
            animation: brightnessGlow 0.8s ease-in-out infinite;
            color: #00FF41;
            font-weight: bold;
          }
          .neon-text-static {
            color: #00FF41;
            font-weight: bold;
          }
        `}</style>
        
        <div className="text-center">
          {isReady ? (
            <>
              <div className="text-6xl mb-12 neon-text-pulse">🔔</div>
              <div className="text-5xl font-bold mb-8 neon-text-pulse">Commande Prête !</div>
              <div className="text-3xl mb-6 neon-text-pulse">Numéro: #{currentOrder.number}</div>
              <div className="text-2xl mb-8 neon-text-pulse">Total: {currentOrder.total.toFixed(2)}€</div>
              <div className="text-xl neon-text-pulse">Récupérer au comptoir</div>
            </>
          ) : (
            <>
              <div className="text-6xl mb-12 neon-text-static">✓</div>
              <div className="text-5xl font-bold mb-8 neon-text-static">Commande Envoyée !</div>
              <div className="text-3xl mb-6 neon-text-static">Numéro: #{currentOrder.number}</div>
              <div className="text-2xl mb-8 neon-text-static">Total: {currentOrder.total.toFixed(2)}€</div>
              <div className="text-lg neon-text-static">
                Vous recevrez une notification<br />quand votre commande sera prête
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (menu.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center" style={{ color: '#00FF41' }}>
          <div className="text-2xl mb-4">Chargement du menu...</div>
          <div className="text-sm text-gray-500">Établissement: {etablissementId}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 bg-black border-b p-4 z-10" style={{ borderColor: '#00FF41' }}>
        <div className="max-w-2xl mx-auto">
          {/* Badge status commandes */}
          {!ordersOpen && (
            <div className="mb-3 p-2 bg-red-900 border border-red-500 rounded text-center">
              <span className="text-red-400 text-sm font-bold">
                ⚠️ Commandes fermées - Consultation uniquement
              </span>
            </div>
          )}

          <div className="text-xl font-bold" style={{ color: '#00FF41' }}>MENU</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 pb-32">
        {menu.map(item => (
          <div key={item.id} className="flex items-center py-3 border-b border-gray-800">
            <span className="font-mono flex-1" style={{ color: '#00FF41' }}>{item.name}</span>
            <span className="font-mono w-24 text-right" style={{ color: '#00FF41' }}>{item.price.toFixed(2)}€</span>
            <input
              type="number"
              min="0"
              max="20"
              value={quantities[item.id] || 0}
              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
              onFocus={(e) => e.target.select()}
              disabled={hasActiveOrder || !ordersOpen}
              className="w-16 bg-black border text-center py-1 font-mono ml-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: '#00FF41', color: '#00FF41' }}
            />
          </div>
        ))}
      </div>

      {getTotalItems() > 0 && !hasActiveOrder && (
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 p-4" style={{ borderColor: '#00FF41' }}>
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between mb-3 text-lg" style={{ color: '#00FF41' }}>
              <span>{getTotalItems()} article(s)</span>
              <span className="font-bold">{getTotalPrice().toFixed(2)}€</span>
            </div>
            <button
              onClick={handleValidate}
              className="w-full text-black py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:opacity-80"
              style={{ backgroundColor: '#00FF41' }}
            >
              <ShoppingCart size={24} />
              VALIDER LA COMMANDE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// TabletInterface Component (inchangé)
const TabletInterface = ({ etablissementId }) => {
  const [orders, setOrders] = useState([]);
  // ============================================
  // PHASE 2.5 : STOP/START COMMANDES
  // ============================================
  const [ordersOpen, setOrdersOpen] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Écoute en temps réel du statut ordersOpen + initialisation
  useEffect(() => {
    const initializeOrdersOpen = async () => {
      const etablissementRef = doc(db, 'etablissements', etablissementId);
      const docSnap = await getDoc(etablissementRef);

      // Si le document existe mais n'a pas le champ ordersOpen, l'initialiser
      if (docSnap.exists() && docSnap.data().ordersOpen === undefined) {
        try {
          await updateDoc(etablissementRef, { ordersOpen: true });
          console.log('Champ ordersOpen initialisé à true');
        } catch (error) {
          console.error('Erreur initialisation ordersOpen:', error);
        }
      }
    };

    initializeOrdersOpen();

    const unsubscribe = onSnapshot(
      doc(db, 'etablissements', etablissementId),
      (docSnap) => {
        if (docSnap.exists()) {
          setOrdersOpen(docSnap.data().ordersOpen ?? true);
        }
      },
      (error) => {
        console.error('Erreur écoute ordersOpen:', error);
      }
    );

    return () => unsubscribe();
  }, [etablissementId]);

  useEffect(() => {
    const q = query(
      collection(db, 'etablissements', etablissementId, 'commandes'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp || new Date().toISOString()
      }));
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, [etablissementId]);

  const markAsReady = async (orderId) => {
    try {
      await updateDoc(
        doc(db, 'etablissements', etablissementId, 'commandes', orderId),
        { status: 'ready' }
      );
    } catch (error) {
      console.error('Erreur marquage prêt:', error);
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await deleteDoc(
        doc(db, 'etablissements', etablissementId, 'commandes', orderId)
      );
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  // Toggle pour ouvrir/fermer les commandes
  const toggleOrdersOpen = async () => {
    setIsUpdating(true);

    try {
      const etablissementRef = doc(db, 'etablissements', etablissementId);

      // Vérifier que le document existe
      const docSnap = await getDoc(etablissementRef);
      if (!docSnap.exists()) {
        throw new Error(`L'établissement ${etablissementId} n'existe pas`);
      }

      await updateDoc(etablissementRef, {
        ordersOpen: !ordersOpen,
        lastUpdated: new Date().toISOString()
      });

      console.log(`Commandes ${!ordersOpen ? 'ouvertes' : 'fermées'} avec succès`);
    } catch (error) {
      console.error('Erreur toggle ordersOpen:', error);
      console.error('Détails erreur:', error.message);
      alert(`Erreur lors du changement de statut: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <div className="min-h-screen bg-black p-8" style={{ color: '#00FF41' }}>
      <div className="mb-4 border-b pb-2" style={{ borderColor: '#00FF41' }}>
        <div className="text-xl">TABLETTE RESTAURANT - {etablissementId}</div>
      </div>

      {/* HEADER AVEC TOGGLE ORDERSOPEN */}
      <div className="mb-6 p-4 border rounded" style={{ borderColor: '#00FF41' }}>
        <div className="flex items-center justify-between mb-4">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <div className={`text-2xl ${ordersOpen ? 'text-green-400' : 'text-red-500'}`}>
              {ordersOpen ? '🟢' : '🔴'}
            </div>
            <div>
              <div className={`text-lg font-bold ${ordersOpen ? 'text-green-400' : 'text-red-500'}`}>
                Commandes {ordersOpen ? 'OUVERTES' : 'FERMÉES'}
              </div>
              <div className="text-xs text-gray-500">
                {ordersOpen ? 'Les clients peuvent commander' : 'Nouvelles commandes bloquées'}
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={toggleOrdersOpen}
            disabled={isUpdating}
            className={`px-6 py-3 rounded font-bold transition-colors ${
              ordersOpen
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isUpdating ? 'Chargement...' : (ordersOpen ? 'FERMER LES COMMANDES' : 'OUVRIR LES COMMANDES')}
          </button>
        </div>

        {/* Compteur de commandes avec code couleur */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Commandes en attente :</span>
          <span className={`text-xl font-bold ${
            pendingOrders.length < 5 ? 'text-white' :
            pendingOrders.length < 10 ? 'text-yellow-500' :
            'text-red-500 animate-pulse'
          }`}>
            {pendingOrders.length}
          </span>
          {pendingOrders.length >= 10 && (
            <span className="text-red-500 text-sm font-bold">⚠️ ALERTE SURCHARGE</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-lg mb-4 border-b pb-2" style={{ borderColor: '#00FF41' }}>
            ═══ COMMANDES EN ATTENTE ({pendingOrders.length}) ═══
          </div>
          {pendingOrders.length === 0 ? (
            <div className="text-gray-500 italic">Aucune commande en attente</div>
          ) : (
            pendingOrders.map(order => (
              <div key={order.id} className="mb-4 p-4 border rounded bg-gray-900" style={{ borderColor: '#00FF41' }}>
                <div className="text-yellow-400 font-bold mb-2">COMMANDE #{order.number}</div>
                <div className="text-sm text-gray-400 mb-2">
                  {new Date(order.timestamp).toLocaleTimeString('fr-FR')}
                </div>
                {order.items.map((item, i) => (
                  <div key={i} className="text-sm mb-1">
                    • {item.quantity}x {item.name} - {(item.price * item.quantity).toFixed(2)}€
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t font-bold" style={{ borderColor: '#00FF41' }}>
                  TOTAL: {order.total.toFixed(2)}€
                  {order.tip > 0 && (
                    <div className="text-xs text-gray-400 font-normal mt-1">
                      (dont {order.tip.toFixed(2)}€ de pourboire)
                    </div>
                  )}
                </div>
                <button
                  onClick={() => markAsReady(order.id)}
                  className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  MARQUER COMME PRÊTE
                </button>
              </div>
            ))
          )}
        </div>

        <div>
          <div className="text-lg mb-4 border-b pb-2" style={{ borderColor: '#00FF41' }}>
            ═══ COMMANDES PRÊTES ({readyOrders.length}) ═══
          </div>
          {readyOrders.length === 0 ? (
            <div className="text-gray-500 italic">Aucune commande prête</div>
          ) : (
            readyOrders.map(order => (
              <div key={order.id} className="mb-4 p-4 border rounded bg-gray-900" style={{ borderColor: '#00FF41' }}>
                <div className="font-bold mb-2 flex items-center gap-2" style={{ color: '#00FF41' }}>
                  <Check size={16} />
                  COMMANDE #{order.number}
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  {new Date(order.timestamp).toLocaleTimeString('fr-FR')}
                </div>
                {order.items.map((item, i) => (
                  <div key={i} className="text-sm mb-1">
                    • {item.quantity}x {item.name}
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t font-bold" style={{ borderColor: '#00FF41' }}>
                  TOTAL: {order.total.toFixed(2)}€
                  {order.tip > 0 && (
                    <div className="text-xs text-gray-400 font-normal mt-1">
                      (dont {order.tip.toFixed(2)}€ de pourboire)
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteOrder(order.id)}
                  className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
                >
                  RETIRER (Livrée)
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantOrderSystem;