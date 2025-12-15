import React, { useState } from 'react';
import { Vehicle } from '../types';
import { formatKm, formatKmInput, parseKmInput } from '../utils';
import { ArrowLeft, History, PenTool, CheckCircle } from 'lucide-react';

interface Props {
  vehicle: Vehicle;
  onUpdateVehicle: (v: Vehicle) => void;
  onAddService: () => void;
  onViewHistory: () => void;
  onBack: () => void;
}

export default function Dashboard({ vehicle, onUpdateVehicle, onAddService, onViewHistory, onBack }: Props) {
  const [editingKm, setEditingKm] = useState(false);
  const [newKm, setNewKm] = useState(formatKmInput(vehicle.currentKm));

  const handleUpdateKm = () => {
    const km = parseKmInput(newKm);
    if (!isNaN(km)) {
      onUpdateVehicle({
        ...vehicle,
        currentKm: km,
        lastUpdated: new Date().toISOString()
      });
      setEditingKm(false);
    }
  };

  // Helper to find last service for a config item
  const getStatus = (configId: string, interval: number) => {
    let lastServiceKm = 0;
    
    // We iterate backwards to find the most recent
    for (let i = vehicle.history.length - 1; i >= 0; i--) {
      const record = vehicle.history[i];
      const hasItem = record.items.some(item => item.itemId === configId);
      if (hasItem) {
        lastServiceKm = record.kilometers;
        break;
      }
    }

    const nextServiceKm = lastServiceKm > 0 ? lastServiceKm + interval : vehicle.currentKm + interval; 
    const remaining = nextServiceKm - vehicle.currentKm;
    
    let status: 'good' | 'warning' | 'bad' = 'good';
    if (remaining < 0) status = 'bad';
    else if (remaining < 1000) status = 'warning';

    return { lastServiceKm, nextServiceKm, remaining, status };
  };

  return (
    <div className="max-w-md mx-auto bg-gray-100 dark:bg-gray-900 min-h-screen pb-24 relative transition-colors duration-300">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-800 text-white p-6 rounded-b-[2rem] shadow-lg mb-6">
        <div className="flex justify-between items-start mb-4">
          <button onClick={onBack} className="p-2 bg-blue-700 dark:bg-blue-900 rounded-full hover:bg-blue-800 transition">
            <ArrowLeft size={20} />
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold">{vehicle.name}</h1>
            <p className="opacity-80 text-sm">Estado del Vehículo</p>
          </div>
        </div>

        {/* Odometer Card */}
        <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl p-4 shadow-sm flex flex-col items-center">
          <div className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Kilometraje Actual</div>
          
          {editingKm ? (
            <div className="flex items-center gap-2 w-full">
              <input 
                type="text" 
                value={newKm} 
                onChange={(e) => setNewKm(formatKmInput(e.target.value))}
                className="flex-1 text-center text-3xl font-bold border-b-2 border-blue-500 focus:outline-none bg-transparent"
                autoFocus
              />
              <button onClick={handleUpdateKm} className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600">
                <CheckCircle size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setNewKm(formatKmInput(vehicle.currentKm)); setEditingKm(true); }}>
              <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{formatKm(vehicle.currentKm)}</span>
              <span className="text-sm text-gray-400">km</span>
              <PenTool size={16} className="text-gray-300 dark:text-gray-500 ml-2" />
            </div>
          )}
          
          <div className="w-full bg-blue-50 dark:bg-blue-900/30 mt-3 p-2 rounded text-center text-xs text-blue-800 dark:text-blue-300">
             Actualizar semanalmente
          </div>
        </div>
      </div>

      {/* Status List */}
      <div className="px-3 space-y-3">
        {vehicle.configs.map(config => {
          const { lastServiceKm, nextServiceKm, remaining, status } = getStatus(config.id, config.intervalKm);
          
          const statusColors = {
            good: "border-l-4 border-green-500 dark:border-green-600",
            warning: "border-l-4 border-yellow-400 dark:border-yellow-500",
            bad: "border-l-4 border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
          };

          const textColors = {
            good: "text-green-700 dark:text-green-400",
            warning: "text-yellow-700 dark:text-yellow-400",
            bad: "text-red-700 dark:text-red-400"
          };

          return (
            <div key={config.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 ${statusColors[status]} relative overflow-hidden transition-colors`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate pr-2 flex-1">{config.name}</h3>
                <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${status === 'good' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                  {status === 'good' ? 'OK' : status === 'warning' ? 'Pronto' : 'Vencido'}
                </div>
              </div>
              
              <div className="flex justify-between items-end text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
                <div className="flex flex-col">
                  <span>Próximo: <span className="font-medium text-gray-700 dark:text-gray-300">{formatKm(nextServiceKm)}</span></span>
                  <span className="text-[10px] opacity-75">Ult: {lastServiceKm > 0 ? formatKm(lastServiceKm) : '-'}</span>
                </div>
                <div className="text-right">
                   Faltan: <span className={`font-bold text-base ml-1 ${textColors[status]}`}>{formatKm(remaining)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-around max-w-md mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20 transition-colors">
        <button 
          onClick={onViewHistory}
          className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <History size={24} />
          <span className="text-[10px] mt-1">Historial</span>
        </button>
        
        <button 
          onClick={onAddService}
          className="flex items-center justify-center bg-blue-600 dark:bg-blue-700 text-white rounded-full w-12 h-12 -mt-6 shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition transform hover:scale-105 border-4 border-gray-100 dark:border-gray-900"
        >
          <PenTool size={20} />
        </button>

        <div className="flex flex-col items-center text-blue-600 dark:text-blue-400">
          <CheckCircle size={24} />
          <span className="text-[10px] mt-1 font-medium">Estado</span>
        </div>
      </div>
    </div>
  );
}