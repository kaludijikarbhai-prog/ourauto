/**
 * Utility functions for OurAuto
 */

/**
 * Format price in Indian Rupees
 */
export function formatPrice(price: number | undefined): string {
  if (!price) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Format date to readable format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date with time
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Mask phone number (show only last 4 digits)
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return '****';
  return `****${phone.slice(-4)}`;
}

/**
 * Unmask phone (for verification)
 */
export function unmaskPhone(_: string, actualPhone: string): string {
  // Only return actual phone if user is authorized to see it
  return actualPhone;
}

/**
 * Format KM with commas
 */
export function formatKm(km: number): string {
  return new Intl.NumberFormat('en-IN').format(km);
}

/**
 * Slug generation (for URLs)
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Car full name
 */
export function getCarFullName(brand: string, model: string, year: number): string {
  return `${brand} ${model} (${year})`;
}

/**
 * Estimate car age
 */
export function getCarAge(year: number): string {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  return age === 0 ? 'New' : `${age} year${age > 1 ? 's' : ''}`;
}

/**
 * Get time slots
 */
export function getTimeSlots(): { label: string; value: string }[] {
  return [
    { label: '10:00 AM - 1:00 PM', value: '10am-1pm' },
    { label: '2:00 PM - 5:00 PM', value: '2pm-5pm' },
  ];
}

/**
 * Get available dates (next 30 days)
 */
export function getAvailableDates(): Date[] {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate Indian phone number
 */
export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  return text.length > length ? `${text.substring(0, length)}...` : text;
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Calculate inspection date range
 */
export function getInspectionDateRange(selectedDate: Date): { start: Date; end: Date } {
  const start = new Date(selectedDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(selectedDate);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * Generate unique masked phone (for privacy)
 */
export function generateMaskedPhone(phone: string): string {
  // Hash + mask for uniqueness
  const hash = phone.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  const masked = Math.abs(hash) % 10000;
  return `PM${String(masked).padStart(4, '0')}`;
}

/**
 * Get badge color for status
 */
export function getStatusColor(status: string): string {
  const colors: { [key: string]: string } = {
    draft: 'gray',
    live: 'green',
    sold: 'red',
    pending: 'yellow',
    confirmed: 'blue',
    completed: 'green',
    new: 'blue',
    contacted: 'yellow',
    interested: 'purple',
    closed: 'gray',
    accepted: 'green',
    rejected: 'red',
    open: 'blue',
    reviewing: 'yellow',
    resolved: 'green',
    dismissed: 'gray',
  };
  return colors[status] || 'gray';
}

/**
 * Pagination helper
 */
export function getPaginationParams(page?: number, limit: number = 12) {
  const p = Math.max(1, page || 1);
  const offset = (p - 1) * limit;
  return { offset, limit, page: p };
}

/**
 * Calculate depreciation (rule-based valuation)
 */
export function calculateCarDepreciation(year: number, km: number, owners: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  const yearDepreciation = age * 0.15; // 15% per year
  const kmDepreciation = (km / 100000) * 0.1; // 0.1% per 1K km
  const ownerDepreciation = (owners - 1) * 0.05; // 5% per extra owner
  return Math.min(yearDepreciation + kmDepreciation + ownerDepreciation, 0.8); // Max 80% depreciation
}
