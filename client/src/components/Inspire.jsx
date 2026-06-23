import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, ShoppingCart, Utensils, Sparkles } from 'lucide-react';

export default function Inspire() {
  const [pantryItems, setPantryItems] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('token'); 

        const response = await fetch(
          import.meta.env.VITE_API_URL + '/api/items',
          {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          }
        );

        const data = await response.json();
        if (response.ok) {
          setPantryItems(data);
        } else {
          console.error('Backend rejected request:', data);
          setPantryItems([]);
        }
      } catch (error) {
        console.error('Failed to fetch pantry items:', error);
        setPantryItems([]);
      }
    };
    fetchItems();
  }, []);

  const handleGenerateRecipe = async () => {
    const ingredientNames = Array.isArray(pantryItems)
      ? pantryItems.map((item) => item.name)
      : [];

    if (ingredientNames.length === 0) {
      setMessage('Your pantry is empty! Log some groceries first.');
      return;
    }

    setLoading(true);
    setMessage('Brainstorming a recipe with your ingredients...');
    setRecipe(null);

    try {
      const token = localStorage.getItem('token'); // Retrieve JWT token

      const response = await fetch(
        import.meta.env.VITE_API_URL + '/api/inspire',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Send token to protected AI route
          },
          body: JSON.stringify({ ingredients: ingredientNames }),
        }
      );

      if (!response.ok) throw new Error('Failed to reach AI');

      const data = await response.json();
      setRecipe(data);
      setMessage('');
    } catch (error) {
      console.error(error);
      setMessage('The AI chef hit a snag. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <ChefHat className="w-12 h-12 mx-auto text-amber-500 mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Zero-Waste Chef
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Let AI create a custom recipe using the ingredients currently in your
          digital pantry.
        </p>

        <button
          onClick={handleGenerateRecipe}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-3 px-6 rounded-lg inline-flex items-center gap-2 transition-colors"
        >
          {loading ? (
            <span className="animate-pulse">Cooking up ideas...</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Inspire Me
            </>
          )}
        </button>

        {message && (
          <p className="mt-4 text-sm font-medium text-amber-600 dark:text-amber-400">
            {message}
          </p>
        )}
      </div>

      {/* Recipe Display Section */}
      {recipe && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {recipe.title}
          </h3>

          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium mb-8 pb-4 border-b border-gray-100 dark:border-gray-700">
            <Clock className="w-5 h-5" />
            Prep & Cook Time: {recipe.prepTime}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Ingredients List */}
            <div className="md:col-span-1 bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-500" />
                Ingredients
              </h4>
              <ul className="space-y-3">
                {recipe.ingredientsNeeded?.map((ing, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-600 dark:text-gray-300 text-sm"
                  >
                    <span className="mt-1 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-blue-500" />
                Instructions
              </h4>
              <div className="space-y-4">
                {recipe.instructions?.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
