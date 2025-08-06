import React from 'react';
import { Search, Users, TrendingUp, Target } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                FantasyEdge AI
              </h1>
            </div>
            <nav className="flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Dashboard
              </a>
              <a href="/players" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Players
              </a>
              <a href="/predictions" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Predictions
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}