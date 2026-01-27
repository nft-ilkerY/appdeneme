import type { Database } from './database';

export type User = Database['public']['Tables']['users']['Row'];
export type Mill = Database['public']['Tables']['mills']['Row'];
export type Separator = Database['public']['Tables']['separators']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Silo = Database['public']['Tables']['silos']['Row'];
export type ProductionSession = Database['public']['Tables']['production_sessions']['Row'];
export type PackagingEntry = Database['public']['Tables']['packaging_entries']['Row'];

export type UserRole = 'admin' | 'operator' | 'worker' | 'viewer';
export type SiloType = 'mill_product' | 'coating_raw' | 'coating_product';
export type PackageType = 'BB' | 'PP' | 'KRAFT';
export type ProductionStatus = 'active' | 'paused' | 'completed' | 'cancelled';

// Extended types with relations
export interface MillWithRelations extends Mill {
  separators?: Separator[];
  silos?: Silo[];
}

export interface SiloWithRelations extends Silo {
  mill?: Mill;
  product?: Product;
  silo_product_rules?: Array<{
    id: string;
    product_id: string;
    product?: Product;
  }>;
}

export interface ProductionSessionWithRelations extends ProductionSession {
  mill?: Mill;
  product?: Product;
  silo?: Silo;
  creator?: User;
}

export interface PackagingEntryWithRelations extends PackagingEntry {
  silo?: Silo;
  product?: Product;
  worker?: User;
  creator?: User;
}
