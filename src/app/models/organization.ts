export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO
  createdByUserId?: string; // opsiyonel
  // İleride: logoUrl, settings vs. eklenebilir
}
