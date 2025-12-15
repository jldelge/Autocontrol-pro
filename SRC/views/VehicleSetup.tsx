import React, { useState } from 'react';
import { DEFAULT_MAINTENANCE_ITEMS, Vehicle, MaintenanceConfig } from '../types';
import { generateId, formatKmInput, parseKmInput } from '../utils';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ArrowLeft, Check, Trash2, Plus } from 'lucide-react';

interface Props {
  onSave: (vehicle: Vehicle) => void;
  onCancel: () => void;
  isFirst: boolean;
}

export default function VehicleSetup({ onSave, onCancel, isFirst }: Props) {
  const [name, setName] = useState('');
  const [currentKm, setCurrentKm] = useState('');
  
  // Initialize configs with default items and default values (standard averages)
  const [configs, setConfigs] = useState<MaintenanceConfig[]>(
    DEFAULT_MAINTENANCE_ITEMS.map(item => ({
      id: generateId(),
      name: item,
      intervalKm: item.includes('Aceite motor') ? 10000 : 
                  item.includes('Filtro de aire') ? 20000 :
                  item.includes('Alineación') ? 10000 : 30000
    }))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !currentKm) return;
    
    // Filter out items with empty names to avoid issues
    const validConfigs = configs.filter(c => c.name.trim() !== '');

    const newVehicle: Vehicle = {
      id: generateId(),
      name,
      currentKm: parseKmInput(currentKm),
      lastUpdated: new Date().toISOString(),
      configs: validConfigs,
      history: []
    };

    onSave(newVehicle);
  };

  const handleCurrentKmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentKm(formatKmInput(e.target.value));
  };

  const handleIntervalChange = (id: string, value: string) => {
    const num = parseKmInput(value);
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, intervalKm: num } : c));
  };

  const handleNameChange = (id: string, newName: string) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  const handleDeleteItem = (id: string) => {
    setConfigs(prev => prev.filter(c => c.id !== id));
  };

  const handleAddItem = () => {
    setConfigs(prev => [
      ...prev,
      { id: generateId(), name: '', intervalKm: 10000 }
    ]);
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-800 text-white p-4 shadow-md sticky top-0 z-10 flex items-center">
        {!isFirst && (
          <button onClick={onCancel} className="mr-3 p-1 rounded-full hover:bg-blue-700 dark:hover:bg-blue-600">
            <ArrowLeft size={24} />
          </button>
        )}
        <h2 className="text-xl font-bold flex-1">Nuevo Vehículo</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-6 flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b dark:border-gray-700 pb-2">Datos Básicos</h3>
          <Input 
            label="Nombre del Vehículo (ej. Ford Ranger)" 
            value={name} 
            onChange={e => setName(e.target.value)}
            placeholder="Ingrese nombre"
            required
            className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <Input 
            label="Kilometraje Actual" 
            type="text" 
            value={currentKm} 
            onChange={handleCurrentKmChange}
            placeholder="0"
            required
            className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Configuración de Frecuencias</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Defina cada cuántos km se debe realizar cada mantenimiento.</p>
          
          <div className="space-y-4 pb-20">
            {configs.map(config => (
              <div key={config.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col relative group">
                <button 
                  type="button" 
                  onClick={() => handleDeleteItem(config.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-2 opacity-50 group-hover:opacity-100 transition-opacity"
                  title="Eliminar ítem"
                >
                  <Trash2 size={18} />
                </button>
                
                <div className="mb-2 pr-8">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Nombre del ítem</label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => handleNameChange(config.id, e.target.value)}
                    placeholder="Ej. Correa de distribución"
                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none font-medium text-gray-800 dark:text-gray-200 pb-1"
                  />
                </div>
                
                <div className="flex items-center">
                  <span className="text-gray-500 dark:text-gray-400 mr-2 text-sm">Cada</span>
                  <input
                    type="text"
                    value={formatKmInput(config.intervalKm)}
                    onChange={(e) => handleIntervalChange(config.id, e.target.value)}
                    className="flex-1 border dark:border-gray-600 rounded px-3 py-2 text-center font-bold text-blue-700 dark:text-blue-400 bg-white dark:bg-gray-700"
                  />
                  <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm">Km</span>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-3 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg text-blue-500 dark:text-blue-400 font-medium flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Agregar Item
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t dark:border-gray-700 p-4 -mx-6 mt-4">
          <Button type="submit" fullWidth disabled={!name || !currentKm}>
            <div className="flex items-center justify-center gap-2">
              <Check size={20} />
              Guardar Vehículo
            </div>
          </Button>
        </div>
      </form>
    </div>
  );
}