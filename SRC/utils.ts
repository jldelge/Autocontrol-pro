export const formatKm = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return Math.floor(value).toLocaleString('es-AR'); // Uses dots for thousands
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const parseKmInput = (value: string): number => {
  return parseInt(value.replace(/\./g, '').replace(/\D/g, '')) || 0;
};

export const formatKmInput = (value: string | number): string => {
  if (value === '' || value === undefined || value === null) return '';
  const str = value.toString();
  const clean = str.replace(/\./g, '').replace(/\D/g, '');
  if (!clean) return '';
  return parseInt(clean).toLocaleString('es-AR');
};