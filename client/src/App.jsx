import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AddGrocery from './components/AddGrocery';
import Dashboard from './components/Dashboard';
import Finances from './components/Finances';
import Inspire from './components/Inspire';
import Auth from './components/Auth';
import ShoppingList from './components/ShoppingList';

// --- TEMPORARY DUMMY PAGES ---
// const Dashboard = () => <h2 className="text-3xl font-bold dark:text-white">Your Pantry Dashboard</h2>;
// const AddGrocery = () => <h2 className="text-3xl font-bold dark:text-white">Add a Grocery Item</h2>;
// const Finances = () => (
//   <h2 className="text-3xl font-bold dark:text-white">Financial Overview</h2>
// );
// const Inspire = () => (
//   <h2 className="text-3xl font-bold dark:text-white">AI Recipe Generator</h2>
// );

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 font-sans transition-colors duration-200">
        <Navbar />
        <main className="max-w-6xl mx-auto mt-8 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 min-h-[60vh] transition-colors duration-200">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddGrocery />} />
            <Route path="/shopping" element={<ShoppingList />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/inspire" element={<Inspire />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
