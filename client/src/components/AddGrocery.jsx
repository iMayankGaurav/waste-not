import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

export default function AddGrocery() {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Produce',
    cost: '',
    expiryDate: '',
  });
  const [status, setStatus] = useState(''); // To show success/error messages

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    setStatus('Saving...');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('Item added successfully!');
        setFormData({
          name: '',
          category: 'Produce',
          cost: '',
          expiryDate: '',
        }); 
        setTimeout(() => setStatus(''), 3000); 
      } else {
        setStatus('Failed to add item.');
      }
    } catch (error) {
      console.error(error);
      setStatus('Server error. Is your backend running?');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Log Groceries
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4"
      >
        {/* Item Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Item Name
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Organic Milk"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Category & Cost Row */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option>Produce</option>
              <option>Dairy</option>
              <option>Meat</option>
              <option>Pantry</option>
              <option>Spices</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cost ($)
            </label>
            <input
              type="number"
              name="cost"
              required
              step="0.01"
              value={formData.cost}
              onChange={handleChange}
              placeholder="4.99"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expiry Date
          </label>
          <input
            type="date"
            name="expiryDate"
            required
            value={formData.expiryDate}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Add to Pantry
        </button>

        {/* Status Message */}
        {status && (
          <p
            className={`text-center text-sm font-medium mt-2 ${status.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
          >
            {status}
          </p>
        )}
      </form>
    </div>
  );
}
