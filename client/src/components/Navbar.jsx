import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Added Sun and Moon icons!
import {
  Leaf,
  Home,
  PlusCircle,
  PieChart,
  ChefHat,
  Sun,
  Moon,
  ShoppingBag,
} from 'lucide-react';

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };
  useEffect(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-green-600 font-bold text-2xl tracking-tight"
        >
          <Leaf className="w-8 h-8" />
          Waste-Not
        </Link>

        {/* Links and Theme Toggle Container */}
        <div className="flex items-center gap-6 font-medium">
          {user ? (
            // WHAT LOGGED-IN USERS SEE
            <>
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 transition-colors"
              >
                <Home className="w-5 h-5" /> Pantry
              </Link>
              <Link
                to="/add"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 transition-colors"
              >
                <PlusCircle className="w-5 h-5" /> Add Item
              </Link>
              <Link
                to="/finances"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 transition-colors"
              >
                <PieChart className="w-5 h-5" /> Finances
              </Link>
              <Link
                to="/shopping"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" /> Shopping List
              </Link>
              <Link
                to="/inspire"
                className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors"
              >
                <ChefHat className="w-5 h-5" /> Inspire Me
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            // WHAT LOGGED-OUT USERS SEE
            <Link
              to="/auth"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Vertical Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors focus:outline-none"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
