import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, CheckCircle, Trash2 } from 'lucide-react';

export default function ShoppingList() {
  const [list, setList] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const fetchShoppingList = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/shopping', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setList(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching shopping list:", error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/shopping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newItemName })
      });
      if (response.ok) {
        const newItem = await response.json();
        setList([...list, newItem]);
        setNewItemName('');
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shopping/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setList(list.filter(item => item._id !== id));
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  if (loading) return <div className="text-center mt-10 dark:text-white">Loading your list...</div>;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <ShoppingBag className="text-green-600" /> Smart Shopping List
      </h2>

      {/* Manual Input Form */}
      <form onSubmit={handleAddItem} className="flex gap-2">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add an item manually..."
          className="flex-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
        />
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-lg flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* List Display */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        {list.length === 0 ? (
          <p className="p-6 text-center text-gray-500 dark:text-gray-400">Your shopping list is clear!</p>
        ) : (
          list.map((item) => (
            <div key={item._id} className="p-4 flex items-center justify-between group">
              <span className="text-gray-800 dark:text-gray-200 capitalize font-medium">{item.name}</span>
              <button 
                onClick={() => handleRemoveItem(item._id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Bought / Remove"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}