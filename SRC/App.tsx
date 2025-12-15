import React, { useState, useEffect } from 'react';
import { Vehicle } from './types';
import { generateId } from './utils';
import { Plus, Car, Settings, Calendar, PenTool, Moon, Sun } from 'lucide-react';
import VehicleSetup from './views/VehicleSetup';
import Dashboard from './views/Dashboard';
import AddService from './views/AddService';
import History from './views/History';
import { Button } from './components/Button';

// Mock views enum
enum View {
  HOME = 'HOME',
  SETUP = 'SETUP',
  DASHBOARD = 'DASHBOARD',
  ADD_SERVICE = 'ADD_SERVICE',
  HISTORY = 'HISTORY'
}

export default function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [darkMode, setDarkMode] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('autocontrol_vehicles');
    if (saved) {
      try {
        setVehicles(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading data", e);
      }
    }
    
    // Load theme preference
    const savedTheme = localStorage.getItem('autocontrol_theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('autocontrol_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  // Apply Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('autocontrol_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('autocontrol_theme', 'light');
    }
  }, [darkMode]);

  const activeVehicle = vehicles.find(v => v.id === activeVehicleId);

  const handleSaveVehicle = (vehicle: Vehicle) => {
    if (activeVehicleId && vehicles.find(v => v.id === activeVehicleId)) {
      // Edit mode (not fully implemented in this flow, but structure supports it)
      setVehicles(prev => prev.map(v => v.id === vehicle.id ? vehicle : v));
    } else {
      // New mode
      setVehicles(prev => [...prev, vehicle]);
    }
    setActiveVehicleId(vehicle.id);
    setCurrentView(View.DASHBOARD);
  };

  const updateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
  };

  const handleSelectVehicle = (id: string) => {
    setActiveVehicleId(id);
    setCurrentView(View.DASHBOARD);
  };

  const handleEditService = (serviceId: string) => {
    setEditingServiceId(serviceId);
    setCurrentView(View.ADD_SERVICE);
  };

  const renderContent = () => {
    if (currentView === View.SETUP) {
      return (
        <VehicleSetup 
          onSave={handleSaveVehicle} 
          onCancel={() => setCurrentView(vehicles.length > 0 ? View.HOME : View.SETUP)}
          isFirst={vehicles.length === 0}
        />
      );
    }

    if (currentView === View.DASHBOARD && activeVehicle) {
      return (
        <Dashboard 
          vehicle={activeVehicle} 
          onUpdateVehicle={updateVehicle}
          onAddService={() => {
            setEditingServiceId(null);
            setCurrentView(View.ADD_SERVICE);
          }}
          onViewHistory={() => setCurrentView(View.HISTORY)}
          onBack={() => {
            setActiveVehicleId(null);
            setCurrentView(View.HOME);
          }}
        />
      );
    }

    if (currentView === View.ADD_SERVICE && activeVehicle) {
      return (
        <AddService 
          vehicle={activeVehicle}
          serviceId={editingServiceId}
          onSave={(updatedVehicle) => {
            updateVehicle(updatedVehicle);
            setEditingServiceId(null);
            setCurrentView(View.HISTORY); // Go back to history if editing, otherwise could go dashboard
          }}
          onCancel={() => {
            setEditingServiceId(null);
            setCurrentView(View.DASHBOARD);
          }}
        />
      );
    }

    if (currentView === View.HISTORY && activeVehicle) {
      return (
        <History 
          vehicle={activeVehicle}
          onBack={() => setCurrentView(View.DASHBOARD)}
          onEditService={handleEditService}
        />
      );
    }

    // HOME VIEW (Vehicle Selector)
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex flex-col items-center justify-center max-w-md mx-auto transition-colors duration-300">
        <div className="mb-8 text-center">
          <div className="bg-blue-600 text-white p-4 rounded-full inline-block mb-4 shadow-lg">
            <Car size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">AutoControl</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestión de mantenimiento vehicular</p>
        </div>

        <div className="w-full space-y-4">
          {vehicles.map(v => (
            <button
              key={v.id}
              onClick={() => handleSelectVehicle(v.id)}
              className="w-full bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-between group border-l-4 border-blue-500 dark:border-blue-600"
            >
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors">{v.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{v.history.length} servicios registrados</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-gray-600 transition-colors">
                <Settings size={20} className="text-gray-600 dark:text-gray-300 group-hover:text-blue-600" />
              </div>
            </button>
          ))}

          {vehicles.length < 3 ? (
            <button
              onClick={() => setCurrentView(View.SETUP)}
              className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 rounded-xl flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors bg-gray-50 dark:bg-gray-800/50"
            >
              <Plus size={32} className="mb-2" />
              <span className="font-medium">Agregar Vehículo</span>
            </button>
          ) : (
            <p className="text-center text-xs text-gray-400 mt-4">Máximo de 3 vehículos alcanzado.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300 relative">
      <button 
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg text-gray-800 dark:text-yellow-400 transition-all hover:scale-110"
        title="Toggle Dark Mode"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      {renderContent()}
    </div>
  );
}