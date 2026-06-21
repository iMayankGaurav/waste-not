import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Tag } from 'lucide-react';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // This runs automatically when the Dashboard loads
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('token'); // Grab token
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/items', {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token
          },
        });
        const data = await response.json();
        setItems(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch items:', error);
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Function to handle clicking "Ate It" or "Wasted It"
  const handleUpdateItem = async (id, statusType) => {
    try {
      const bodyData =
        statusType === 'consumed'
          ? { isConsumed: true, isWasted: false }
          : { isConsumed: false, isWasted: true };

      const token = localStorage.getItem('token'); // Grab token

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Attach token
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        setItems(items.filter((item) => item._id !== id));
      }
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 dark:text-white">
        Loading your pantry...
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Your Digital Pantry
      </h2>

      {items.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            Your pantry is empty. Go add some groceries!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* We map through the data array to create a card for every single item */}
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 capitalize">
                  {item.name}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-500" />
                    {item.category}
                  </p>
                  <p className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />$
                    {item.cost.toFixed(2)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    Expires: {new Date(item.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => handleUpdateItem(item._id, 'consumed')}
                  className="flex-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 py-1.5 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                >
                  Ate It
                </button>
                <button
                  onClick={() => handleUpdateItem(item._id, 'wasted')}
                  className="flex-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 py-1.5 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  Wasted It
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
