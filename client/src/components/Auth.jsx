import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, LogIn, UserPlus } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true); // Toggles between Login and Register
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin ? { email: formData.email, password: formData.password } : formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // 1. Save the VIP wristband (Token) and User data to the browser
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // 2. Redirect them to the main pantry dashboard
      navigate('/');
      
      // 3. Force a quick reload to update the Navbar state (a simple workaround for now)
      window.location.reload();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      
      <div className="text-center mb-8">
        <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Leaf className="w-8 h-8 text-green-600 dark:text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isLogin ? 'Welcome Back' : 'Join Waste-Not'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
          {isLogin ? 'Enter your details to access your pantry.' : 'Create an account to start tracking.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Only show the Name field if they are registering */}
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input 
              type="text" 
              name="name"
              required={!isLogin}
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Mayank Gaurav"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
          <input 
            type="email" 
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <input 
            type="password" 
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
        >
          {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
          className="text-green-600 dark:text-green-500 font-semibold hover:underline"
        >
          {isLogin ? 'Sign up' : 'Log in'}
        </button>
      </div>

    </div>
  );
}