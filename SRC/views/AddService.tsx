import React, { useState, useEffect } from 'react';
import { Vehicle, ServiceItem, ServiceRecord } from '../types';
import { generateId, formatKmInput, parseKmInput } from '../utils';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ArrowLeft, Check } from 'lucide-react';

interface Props {
  vehicle: Vehicle;
  onSave: (updatedVehicle: Vehicle) => void;
  onCancel: () => void;
  serviceId?: string | null;
}

export default function AddService({ vehicle, onSave, onCancel, serviceId }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [km, setKm] = useState(formatKmInput(vehicle.currentKm));
  const [specialWork, setSpecialWork] = useState('');
  
  // Initialize items state based on vehicle config
  const [items, setItems] = useState<ServiceItem[]>(
    vehicle.configs.map(c => ({
      itemId: c.id,
      name: c.name,
      checked: false,
      observation: ''
    }))
  );

  // Load existing data if editing
  useEffect(() => {
    if (serviceId) {
      const existingService = vehicle.history.find(r => r.id === serviceId);
      if (existingService) {
        setDate(existingService.date);
        setKm(formatKmInput(existingService.kilometers));
        setSpecialWork(existingService.specialWork || '');
        
        // Merge existing checked items with current configs
        setItems(prevItems => prevItems.map(item => {
          const found = existingService.items.find(i => i.itemId === item.itemId);
          if (found) {
            return {
              ...item,
              checked: true,
              observation: found.observation
            };
          }
          return item;
        }));
      }
    }
  }, [serviceId, vehicle.history]);

  const toggleItem = (index: number) => {
    const newItems = [...items];
    newItems[index].checked = !newItems[index].checked;
    setItems(newItems);
  };

  const updateObservation = (index: number, text: string) => {
    const newItems = [...items];
    newItems[index].observation = text;
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceKm = parseKmInput(km);
    
    // Filter only checked items
    const checkedItems = items.filter(i => i.checked);
    
    if (checkedItems.length === 0 && !specialWork.trim()) {
      alert("Debe seleccionar al menos un ítem o ingresar un trabajo especial.");
      return;
    }

    const newRecord: ServiceRecord = {
      id: serviceId || generateId(),
      date,
      kilometers: serviceKm,
      items: checkedItems,
      specialWork: specialWork.trim() || undefined
    };

    let updatedHistory;
    if (serviceId) {
      // Replace existing
      updatedHistory = vehicle.history.map(r => r.id === serviceId ? newRecord : r);
    } else {
      // Add new
      updatedHistory = [...vehicle.history, newRecord];
    }
    
    // Sort logic: "Ordenado de lo mas antiguo o menor kilometraje a lo actual"
    updatedHistory.sort((a, b) => a.kilometers - b.kilometers);

    // Determine if we need to update currentKm (only if this service is newer/higher than current, or if we edited the latest one)
    // Simple logic: Max of all history + current? Or just max(current, serviceKm).
    // If we edit a past service, we shouldn't lower currentKm.
    // If we edit the LATEST service and increase KM, update current.
    
    const maxHistoryKm = Math.max(...updatedHistory.map(h => h.kilometers), 0);
    const newCurrentKm = Math.max(vehicle.currentKm, maxHistoryKm);

    const updatedVehicle: Vehicle = {
      ...vehicle,
      currentKm: newCurrentKm,
      history: updatedHistory
    };

    onSave(updatedVehicle);
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen flex flex-col transition-colors duration-300">
      <div className="bg-blue-600 dark:bg-blue-800 text-white p-4 shadow-md flex items-center sticky top-0 z-20">
        <button onClick={onCancel} className="mr-3 p-1 rounded-full hover:bg-blue-700 dark:hover:bg-blue-600">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">{serviceId ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-5 overflow-y-auto pb-24">
        
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Input 
            label="Fecha" 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            required
            className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
          <Input 
            label="Kilometraje" 
            type="text" 
            value={km} 
            onChange={e => setKm(formatKmInput(e.target.value))}
            required
            className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>

        {/* Maintenance Items */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 border-b dark:border-gray-700 pb-1">Mantenimiento Realizado</h3>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.itemId} className={`border rounded-lg p-3 transition-colors ${item.checked ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700 dark:bg-gray-800'}`}>
                <div className="flex items-start mb-2">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleItem(index)}
                    className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                  <div className="ml-3 flex-1">
                    <label 
                      className={`font-medium block cursor-pointer ${item.checked ? 'text-blue-800 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}
                      onClick={() => toggleItem(index)}
                    >
                      {item.name}
                    </label>
                  </div>
                </div>
                
                {item.checked && (
                  <div className="ml-8 mt-2 animate-fadeIn">
                    <input 
                      type="text" 
                      placeholder="Observación (ej. Aceite 5W30 Shell)"
                      value={item.observation}
                      onChange={(e) => updateObservation(index, e.target.value)}
                      className="w-full text-sm border-b border-blue-300 dark:border-blue-700 bg-transparent px-1 py-1 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 placeholder-blue-300 dark:placeholder-blue-700 text-blue-800 dark:text-blue-300"
                    />
                  </div>
                )}
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm italic">No hay ítems configurados. Puede agregar trabajos especiales abajo.</p>
            )}
          </div>
        </div>

        {/* Special Work */}
        <div className="mb-6">
           <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 border-b dark:border-gray-700 pb-1">Trabajos Especiales</h3>
           <textarea
             rows={3}
             className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
             placeholder="Describa cualquier otro trabajo realizado (frenos, amortiguadores, etc)..."
             value={specialWork}
             onChange={e => setSpecialWork(e.target.value)}
           />
        </div>

      </form>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-700 max-w-md mx-auto shadow-lg transition-colors">
        <Button onClick={handleSubmit} fullWidth className="flex justify-center items-center gap-2">
          <Check size={20} />
          {serviceId ? 'Actualizar Servicio' : 'Guardar Servicio'}
        </Button>
      </div>
    </div>
  );
}