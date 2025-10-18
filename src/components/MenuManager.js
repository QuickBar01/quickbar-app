import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Edit2, Trash2, Save, X, AlertCircle, Coffee, Pizza, Beer, Check } from 'lucide-react';


const MenuManager = ({ etablissementId = 'club-test' }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'plat' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Categories disponibles
  const categories = [
    { id: 'boisson', label: 'Boissons', icon: Beer },
    { id: 'plat', label: 'Plats', icon: Pizza },
    { id: 'dessert', label: 'Desserts', icon: Coffee }
  ];

  // Charger les items du menu
  useEffect(() => {
    const q = query(
      collection(db, 'etablissements', etablissementId, 'menu'),
      orderBy('category'),
      orderBy('name')
    );
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMenuItems(items);
        setLoading(false);
      },
      (error) => {
        console.error('Erreur chargement menu:', error);
        setError('Erreur lors du chargement du menu');
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [etablissementId]);

  // Afficher message temporaire
  const showMessage = (type, message) => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Ajouter un item
  const handleAddItem = async () => {
    if (!newItem.name.trim() || !newItem.price) {
      showMessage('error', 'Nom et prix requis');
      return;
    }

    const price = parseFloat(newItem.price);
    if (isNaN(price) || price < 0) {
      showMessage('error', 'Prix invalide');
      return;
    }

    try {
      await addDoc(collection(db, 'etablissements', etablissementId, 'menu'), {
        name: newItem.name.trim(),
        price: price,
        category: newItem.category,
        available: true,
        createdAt: new Date().toISOString()
      });
      
      setNewItem({ name: '', price: '', category: 'plat' });
      setShowAddForm(false);
      showMessage('success', 'Item ajouté avec succès');
    } catch (error) {
      console.error('Erreur ajout:', error);
      showMessage('error', 'Erreur lors de l\'ajout');
    }
  };

  // Commencer l'édition
  const startEdit = (item) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category || 'plat'
    });
  };

  // Sauvegarder les modifications
  const handleSaveEdit = async () => {
    if (!editingItem.name.trim() || !editingItem.price) {
      showMessage('error', 'Nom et prix requis');
      return;
    }

    const price = parseFloat(editingItem.price);
    if (isNaN(price) || price < 0) {
      showMessage('error', 'Prix invalide');
      return;
    }

    try {
      await updateDoc(doc(db, 'etablissements', etablissementId, 'menu', editingItem.id), {
        name: editingItem.name.trim(),
        price: price,
        category: editingItem.category,
        updatedAt: new Date().toISOString()
      });
      
      setEditingItem(null);
      showMessage('success', 'Modifications sauvegardées');
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      showMessage('error', 'Erreur lors de la sauvegarde');
    }
  };

  // Toggle disponibilité
  const toggleAvailability = async (item) => {
    try {
      await updateDoc(doc(db, 'etablissements', etablissementId, 'menu', item.id), {
        available: !item.available,
        updatedAt: new Date().toISOString()
      });
      
      showMessage('success', `${item.name} ${!item.available ? 'disponible' : 'indisponible'}`);
    } catch (error) {
      console.error('Erreur toggle:', error);
      showMessage('error', 'Erreur lors de la modification');
    }
  };

  // Supprimer un item
  const handleDelete = async (itemId, itemName) => {
    if (!window.confirm(`Supprimer "${itemName}" du menu ?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'etablissements', etablissementId, 'menu', itemId));
      showMessage('success', 'Item supprimé');
    } catch (error) {
      console.error('Erreur suppression:', error);
      showMessage('error', 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-xl font-mono" style={{ color: '#00FF41' }}>
          Chargement du menu...
        </div>
      </div>
    );
  }

  // Grouper les items par catégorie
  const itemsByCategory = categories.reduce((acc, cat) => {
    acc[cat.id] = menuItems.filter(item => (item.category || 'plat') === cat.id);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header avec bouton ajouter */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-mono" style={{ color: '#00FF41' }}>
          GESTION DU MENU ({menuItems.length} items)
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 font-mono font-bold rounded hover:opacity-80 flex items-center gap-2"
          style={{ backgroundColor: '#00FF41', color: '#000' }}
        >
          <Plus size={18} />
          AJOUTER UN ITEM
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 border rounded flex items-center gap-2" 
             style={{ borderColor: '#ff4141', backgroundColor: 'rgba(255, 65, 65, 0.1)' }}>
          <AlertCircle size={18} style={{ color: '#ff4141' }} />
          <span className="font-mono" style={{ color: '#ff4141' }}>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="p-3 border rounded flex items-center gap-2" 
             style={{ borderColor: '#00FF41', backgroundColor: 'rgba(0, 255, 65, 0.1)' }}>
          <Check size={18} style={{ color: '#00FF41' }} />
          <span className="font-mono" style={{ color: '#00FF41' }}>{success}</span>
        </div>
      )}

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="p-4 border rounded-lg" style={{ borderColor: '#00FF41' }}>
          <h3 className="text-lg font-bold mb-4 font-mono" style={{ color: '#00FF41' }}>
            Nouvel Item
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Nom de l'item"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="px-3 py-2 bg-black border font-mono focus:outline-none focus:border-green-300"
              style={{ borderColor: '#00FF41', color: '#00FF41' }}
              autoFocus
            />
            <input
              type="number"
              step="0.01"
              placeholder="Prix (€)"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="px-3 py-2 bg-black border font-mono focus:outline-none focus:border-green-300"
              style={{ borderColor: '#00FF41', color: '#00FF41' }}
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="px-3 py-2 bg-black border font-mono focus:outline-none focus:border-green-300"
              style={{ borderColor: '#00FF41', color: '#00FF41' }}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-mono flex items-center gap-1"
              >
                <Save size={16} />
                Ajouter
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewItem({ name: '', price: '', category: 'plat' });
                }}
                className="px-4 py-2 border rounded hover:bg-gray-900 font-mono flex items-center gap-1"
                style={{ borderColor: '#00FF41', color: '#00FF41' }}
              >
                <X size={16} />
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des items par catégorie */}
      {categories.map(category => {
        const CategoryIcon = category.icon;
        const items = itemsByCategory[category.id];

        return (
          <div key={category.id} className="border rounded-lg" style={{ borderColor: '#00FF41' }}>
            <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: '#00FF41' }}>
              <CategoryIcon size={20} style={{ color: '#00FF41' }} />
              <h3 className="text-lg font-bold font-mono" style={{ color: '#00FF41' }}>
                {category.label} ({items.length})
              </h3>
            </div>

            <div className="p-4">
              {items.length === 0 ? (
                <p className="text-gray-500 italic font-mono">Aucun item dans cette catégorie</p>
              ) : (
                <div className="space-y-2">
                  {items.map(item => (
                    <div 
                      key={item.id} 
                      className={`flex items-center justify-between p-3 rounded border ${
                        !item.available ? 'opacity-50' : ''
                      }`}
                      style={{ borderColor: '#00FF41', backgroundColor: 'rgba(0, 255, 65, 0.02)' }}
                    >
                      {editingItem && editingItem.id === item.id ? (
                        // Mode édition
                        <>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={editingItem.name}
                              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                              className="px-2 py-1 bg-black border font-mono"
                              style={{ borderColor: '#00FF41', color: '#00FF41' }}
                            />
                            <input
                              type="number"
                              step="0.01"
                              value={editingItem.price}
                              onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                              className="px-2 py-1 bg-black border font-mono"
                              style={{ borderColor: '#00FF41', color: '#00FF41' }}
                            />
                            <select
                              value={editingItem.category}
                              onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                              className="px-2 py-1 bg-black border font-mono"
                              style={{ borderColor: '#00FF41', color: '#00FF41' }}
                            >
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={handleSaveEdit}
                              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded"
                              title="Sauvegarder"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="p-2 border rounded hover:bg-gray-900"
                              style={{ borderColor: '#00FF41', color: '#00FF41' }}
                              title="Annuler"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </>
                      ) : (
                        // Mode affichage
                        <>
                          <div className="flex-1">
                            <span className="font-mono text-lg" style={{ color: '#00FF41' }}>
                              {item.name}
                            </span>
                            <span className="ml-4 font-mono" style={{ color: '#00FF41' }}>
                              {item.price.toFixed(2)}€
                            </span>
                            {!item.available && (
                              <span className="ml-4 text-sm font-mono text-red-400">
                                (Indisponible)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Toggle disponibilité */}
                            <button
                              onClick={() => toggleAvailability(item)}
                              className={`px-3 py-1 rounded font-mono text-sm ${
                                item.available 
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'bg-gray-600 hover:bg-gray-700 text-white'
                              }`}
                            >
                              {item.available ? 'Disponible' : 'Indisponible'}
                            </button>
                            {/* Éditer */}
                            <button
                              onClick={() => startEdit(item)}
                              className="p-2 border rounded hover:bg-gray-900"
                              style={{ borderColor: '#00FF41', color: '#00FF41' }}
                              title="Modifier"
                            >
                              <Edit2 size={16} />
                            </button>
                            {/* Supprimer */}
                            <button
                              onClick={() => handleDelete(item.id, item.name)}
                              className="p-2 border rounded hover:bg-red-900"
                              style={{ borderColor: '#ff4141', color: '#ff4141' }}
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Info établissement */}
      <div className="text-center text-sm font-mono" style={{ color: '#00FF41', opacity: 0.5 }}>
        Établissement: {etablissementId} | Modifications en temps réel
      </div>
    </div>
  );
};

export default MenuManager;