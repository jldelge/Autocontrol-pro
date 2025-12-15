import React from 'react';
import { Vehicle } from '../types';
import { formatKm, formatDate } from '../utils';
import { ArrowLeft, Calendar, Wrench, MessageSquare, Edit2 } from 'lucide-react';

interface Props {
  vehicle: Vehicle;
  onBack: () => void;
  onEditService?: (serviceId: string) => void;
}

export default function History({ vehicle, onBack, onEditService }: Props) {
  // Sort: Oldest (lowest KM) to Newest (highest KM) as requested
  const sortedHistory = [...vehicle.history].sort((a, b) => a.kilometers - b.kilometers);

  return (
    <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="bg-blue-600 dark:bg-blue-800 text-white p-4 shadow-md flex items-center sticky top-0 z-10">
        <button onClick={onBack} className="mr-3 p-1 rounded-full hover:bg-blue-700 dark:hover:bg-blue-600">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-xl font-bold">Historial</h2>
          <p className="text-blue-100 dark:text-blue-200 text-xs">{vehicle.name}</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {sortedHistory.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">
            <div className="bg-gray-200 dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Calendar size={40} />
            </div>
            <p>No hay servicios registrados.</p>
          </div>
        ) : (
          sortedHistory.map((record) => (
            <div key={record.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative transition-colors group">
              {/* Timeline connector visual (optional, simplified here for cleaner UI) */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 dark:bg-blue-600"></div>
              
              {/* Edit Button */}
              {onEditService && (
                <button 
                  onClick={() => onEditService(record.id)}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full transition-all"
                  title="Editar Servicio"
                >
                  <Edit2 size={16} />
                </button>
              )}
              
              <div className="p-4 pl-6">
                <div className="flex justify-between items-start mb-3 border-b border-dashed border-gray-200 dark:border-gray-700 pb-2">
                   <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                     <Calendar size={16} />
                     <span className="font-medium text-sm">{formatDate(record.date)}</span>
                   </div>
                   <div className="font-bold text-lg text-blue-700 dark:text-blue-400 mr-8">
                     {formatKm(record.kilometers)} km
                   </div>
                </div>

                <div className="space-y-3">
                  {record.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col text-sm">
                      <div className="flex items-center text-gray-800 dark:text-gray-200 font-medium">
                        <CheckIcon />
                        <span className="ml-2">{item.name}</span>
                      </div>
                      {item.observation && (
                        <div className="ml-6 mt-1 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-xs flex items-start">
                           <MessageSquare size={12} className="mr-1 mt-0.5 shrink-0" />
                           {item.observation}
                        </div>
                      )}
                    </div>
                  ))}

                  {record.specialWork && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center text-purple-700 dark:text-purple-400 font-semibold text-sm mb-1">
                        <Wrench size={14} className="mr-2" />
                        Trabajo Especial
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm ml-6 italic">{record.specialWork}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
  </svg>
);