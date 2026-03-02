
import React, { useState, useEffect } from 'react';
import { User, ViewState } from './types';
import { StorageService } from './services/storageService';
import { Login } from './views/Login';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './views/Dashboard';
import { Settings } from './views/Settings';
import { Events } from './views/Events';
import { ChartOfAccounts } from './views/ChartOfAccounts';
import { Transactions } from './views/Transactions';
import { DRE } from './views/DRE';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = StorageService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    StorageService.clearUser();
    setUser(null);
    setCurrentView('LOGIN');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-black rounded-xl mb-4 shadow-lg"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex text-gray-900 font-sans">
      <Sidebar
        currentView={currentView}
        onChangeView={setCurrentView}
        onLogout={handleLogout}
        userName={user.name}
      />

      <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-10 transition-all duration-300">
        <div className="max-w-7xl mx-auto animate-[fadeIn_0.3s_ease-out]">
          {currentView === 'DASHBOARD' && <Dashboard user={user} onNavigate={setCurrentView} />}
          {currentView === 'MOVEMENTS' && <Transactions />}
          {currentView === 'DRE' && <DRE />}

          {/* Mapeamento de Cadastros */}
          {currentView === 'ACCOUNTS' && <Settings initialTab="accounts" />}
          {currentView === 'CHART_OF_ACCOUNTS' && <Settings initialTab="chart" />}
          {currentView === 'ARTISTS' && <Settings initialTab="artists" />}
          {currentView === 'CATEGORIES' && <Settings initialTab="categories" />}

          {currentView === 'EVENTS' && <Events />}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default App;
