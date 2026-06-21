import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';

// Specific colors for our Pie Chart pieces
const COLORS = ['#22c55e', '#ef4444']; // Green for Eaten, Red for Wasted

export default function Finances() {
  const [data, setData] = useState({ pieData: [], barData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinances = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/finances');
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch finances:", error);
        setLoading(false);
      }
    };

    fetchFinances();
  }, []);

  if (loading) return <div className="text-center mt-10 dark:text-white">Calculating finances...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Financial Overview</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart Card: Wasted vs Eaten */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingDown className="text-red-500 w-5 h-5" />
            Food Waste Impact
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm font-medium">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div> 
              Money Eaten: ${data.pieData[0]?.value?.toFixed(2) || '0.00'}
            </div>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div> 
              Money Wasted: ${data.pieData[1]?.value?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>

        {/* Bar Chart Card: Category Spending */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-500 w-5 h-5" />
            Spending by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.barData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip cursor={{ fill: 'rgba(156, 163, 175, 0.2)' }} formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}