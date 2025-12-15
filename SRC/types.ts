export interface MaintenanceConfig {
  id: string;
  name: string;
  intervalKm: number;
}

export interface ServiceItem {
  itemId: string;
  name: string; // Redundant but useful for history display if config changes
  checked: boolean;
  observation: string;
}

export interface ServiceRecord {
  id: string;
  date: string;
  kilometers: number;
  items: ServiceItem[]; // Only contains items that were checked
  specialWork?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  currentKm: number;
  lastUpdated: string;
  configs: MaintenanceConfig[];
  history: ServiceRecord[];
}

export const DEFAULT_MAINTENANCE_ITEMS = [
  "Aceite motor",
  "Filtro de aceite motor",
  "Filtro de aire",
  "Filtro de combustible",
  "Aceite de caja",
  "Aceite diferenciales y transferencia",
  "Alineación, balanceo y rotación"
];