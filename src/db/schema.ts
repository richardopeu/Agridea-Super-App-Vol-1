import { integer, pgTable, serial, text, timestamp, doublePrecision, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (maps to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('Super Admin'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Facility Networks Table
export const facilityNetworks = pgTable('facility_networks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'pabrik' | 'mitra_tani' | 'hq_hub' | 'mitra_supplier' | 'mitra_lahan'
  phone: text('phone'),
  rawMaterial: text('raw_material'),
  harvestCapacity: text('harvest_capacity'),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  landArea: text('land_area'),
  harvestMonths: text('harvest_months'),
  pricePerKg: doublePrecision('price_per_kg'),
  pic: text('pic'),
  city: text('city'),
  province: text('province'),
  address: text('address'),
  status: text('status').default('Operasional'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Production Batch Tracing & COGS Table
export const batchTracking = pgTable('batch_tracking', {
  id: text('id').primaryKey(),
  batchNumber: text('batch_number').notNull().unique(),
  fruitVariant: text('fruit_variant').notNull(),
  productionDate: text('production_date').notNull(),
  lokasiId: text('lokasi_id'),
  inputRawKg: doublePrecision('input_raw_kg').default(0),
  outputFinishedKg: doublePrecision('output_finished_kg').default(0),
  yieldPercent: doublePrecision('yield_percent').default(0),
  totalCogsRp: doublePrecision('total_cogs_rp').default(0),
  costPerKgRp: doublePrecision('cost_per_kg_rp').default(0),
  qcGrade: text('qc_grade').default('A'),
  status: text('status').default('Selesai'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Workspace Sync Logs (Google Drive & Google Sheets operations)
export const workspaceSyncLogs = pgTable('workspace_sync_logs', {
  id: serial('id').primaryKey(),
  syncType: text('sync_type').notNull(), // 'google_drive_backup' | 'google_sheets_export' | 'google_sheets_import'
  resourceId: text('resource_id'), // Google Drive fileId or Google Sheet ID
  resourceName: text('resource_name'),
  recordsCount: integer('records_count').default(0),
  status: text('status').notNull(),
  userEmail: text('user_email'),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({}));
