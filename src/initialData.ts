/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  Lokasi,
  FruitVariant,
  ChipVariant,
  Karyawan,
  Supplier,
  CustomerToko,
  ProdukSKU,
  BOMProduk,
  Mesin,
  PurchaseOrder,
  PenerimaanBahanBaku,
  PengupasanLog,
  PembekuanLog,
  VacuumFryingLog,
  QualityControlLog,
  PengemasanLog,
  BatchProduksi,
  StockOpname,
  StockAdjustment,
  PettyCashEntry,
  Penjualan,
  COGSBatch,
  MachineMaintenanceLog,
  QualityComplianceLog,
  AppNotification,
  AuditLog
} from './types';

// Central preseeded Fruit and Vegetable master variants (No duplicates allowed)
export const SEED_FRUIT_VARIANTS: FruitVariant[] = [
  // Fruits
  { id: 'FV-01', nama: 'Nanas', category: 'Fruit', status: 'Active', notes: 'Bahan nanas madu / cayenne' },
  { id: 'FV-02', nama: 'Nangka', category: 'Fruit', status: 'Active', notes: 'Nangka salak manis gurih' },
  { id: 'FV-03', nama: 'Salak', category: 'Fruit', status: 'Active', notes: 'Salak Pondoh' },
  { id: 'FV-04', nama: 'Apel', category: 'Fruit', status: 'Active', notes: 'Apel Manalagi Malang' },
  { id: 'FV-05', nama: 'Pisang', category: 'Fruit', status: 'Active', notes: 'Pisang Raja' },
  { id: 'FV-06', nama: 'Labu', category: 'Fruit', status: 'Active', notes: 'Labu Kuning' },
  { id: 'FV-07', nama: 'Mangga', category: 'Fruit', status: 'Active', notes: 'Mangga Gadung/Arumanis' },
  { id: 'FV-08', nama: 'Pepaya', category: 'Fruit', status: 'Active', notes: 'Pepaya California' },
  { id: 'FV-09', nama: 'Rambutan', category: 'Fruit', status: 'Active', notes: 'Rambutan Binjai' },
  { id: 'FV-10', nama: 'Buah Naga', category: 'Fruit', status: 'Active', notes: 'Buah naga merah' },
  { id: 'FV-11', nama: 'Jambu', category: 'Fruit', status: 'Active', notes: 'Jambu kristal' },
  { id: 'FV-12', nama: 'Melon', category: 'Fruit', status: 'Active', notes: 'Melon sky rocket' },
  { id: 'FV-13', nama: 'Kelapa', category: 'Fruit', status: 'Active', notes: 'Daging kelapa tua' },
  
  // Vegetables
  { id: 'FV-14', nama: 'Brokoli', category: 'Vegetable', status: 'Active', notes: 'Kuntum brokoli hijau' },
  { id: 'FV-15', nama: 'Wortel', category: 'Vegetable', status: 'Active', notes: 'Wortel organik' },
  { id: 'FV-16', nama: 'Edamame', category: 'Vegetable', status: 'Active', notes: 'Edamame jepang manis' },
  { id: 'FV-17', nama: 'Jamur', category: 'Mushroom', status: 'Active', notes: 'Jamur tiram / kancing' },
  { id: 'FV-18', nama: 'Okra', category: 'Vegetable', status: 'Active', notes: 'Okra hijau' },

  // Root Crops
  { id: 'FV-19', nama: 'Ubi Ungu', category: 'Root Crop', status: 'Active', notes: 'Ubi ungu gunung' },
  { id: 'FV-20', nama: 'Ubi Oren', category: 'Root Crop', status: 'Active', notes: 'Ubi cilembu/oren' },
  { id: 'FV-21', nama: 'Singkong', category: 'Root Crop', status: 'Active', notes: 'Singkong mentega' },
  { id: 'FV-22', nama: 'Kentang', category: 'Root Crop', status: 'Active', notes: 'Kentang Dieng' },
  { id: 'FV-23', nama: 'Talas', category: 'Root Crop', status: 'Active', notes: 'Talas bogor gurih' }
];

// Chip Variants referencing Fruit Master
export const SEED_CHIP_VARIANTS: ChipVariant[] = [
  { id: 'PRD-01', nama: 'Keripik Apel Standar Agridea 100g', fruitVariantId: 'FV-04', grade: 'A', brand: 'AGRIDEA', packagingSize: '100g', status: 'Active', notes: 'Standard 100g pack' },
  { id: 'PRD-02', nama: 'Keripik Pisang Crunchy Agridea 150g', fruitVariantId: 'FV-05', grade: 'A', brand: 'AGRIDEA', packagingSize: '150g', status: 'Active', notes: 'Crispy banana 150g' },
  { id: 'PRD-03', nama: 'Keripik Nangka Super Agridea 100g', fruitVariantId: 'FV-02', grade: 'A', brand: 'AGRIDEA', packagingSize: '100g', status: 'Active', notes: 'Nangka super 100g' },
  { id: 'PRD-04', nama: 'Crispify Salak Pondoh Premium 100g', fruitVariantId: 'FV-03', grade: 'A', brand: 'CRISPIFY', packagingSize: '100g', status: 'Active', notes: 'Salak Pondoh pack' },
  { id: 'PRD-05', nama: 'Keripik Apel BigPack Agridea 250g', fruitVariantId: 'FV-04', grade: 'A', brand: 'AGRIDEA', packagingSize: '250g', status: 'Active', notes: 'Large family size' },
  { id: 'PRD-06', nama: 'Keripik Nanas Original 100g', fruitVariantId: 'FV-01', grade: 'A', brand: 'AGRIDEA', packagingSize: '100g', status: 'Active', notes: 'Pineapple sweet snack' },
  { id: 'PRD-07', nama: 'Keripik Nanas Premium 250g', fruitVariantId: 'FV-01', grade: 'A', brand: 'AGRIDEA', packagingSize: '250g', status: 'Active', notes: 'Large size pineapple' },
  { id: 'PRD-08', nama: 'Keripik Salak Original 100g', fruitVariantId: 'FV-03', grade: 'A', brand: 'AGRIDEA', packagingSize: '100g', status: 'Active', notes: 'Standard salak' }
];

// Factory Locations conforming to specifications
export const SEED_LOKASI: Lokasi[] = [
  { id: 'JKT', kode: 'JKT', nama: 'Jakarta HQ', tipe: 'Head Office', alamat: 'Kuningan, Jakarta Selatan', status: 'Active' },
  { id: 'MPD', kode: 'MPD', nama: 'Wonosobo factory', tipe: 'Production Factory', alamat: 'Kawasan Dieng Km 4, Wonosobo', status: 'Active' },
  { id: 'SSP', kode: 'SSP', nama: 'Sipahutar factory', tipe: 'Production Factory', alamat: 'Sipahutar, Tapanuli Utara', status: 'Active' },
  { id: 'KKI', kode: 'KKI', nama: 'Jakarta Branch', tipe: 'Branch Office', alamat: 'Kelapa Gading, Jakarta Utara', status: 'Active' },
  { id: 'AGDN', kode: 'AGDN', nama: 'Jakarta Kemas Facility', tipe: 'Packaging Facility', alamat: 'Cikarang Industrial Estate, Bekasi', status: 'Active' }
];

// Active Users
export const SEED_USERS: User[] = [
  { id: 'U-00', username: 'richardopeu', role: 'Super Admin', lokasiId: 'JKT', status: 'active', namaLengkap: 'Richardo Utoyo', pass: '016210276', needsPasswordChange: true } as any,
  { id: 'U-01', username: 'richard_admin', role: 'Kepala Pabrik HQ', lokasiId: 'JKT', status: 'active', namaLengkap: 'Richard Petricius' },
  { id: 'U-02', username: 'budi_malang', role: 'Kepala Pabrik Cabang', lokasiId: 'JKT', status: 'active', namaLengkap: 'Budi Hartono' },
  { id: 'U-03', username: 'siti_peeler', role: 'Kupas', lokasiId: 'JKT', status: 'active', namaLengkap: 'Siti Aminah' },
  { id: 'U-04', username: 'eko_fryer', role: 'Frying', lokasiId: 'JKT', status: 'active', namaLengkap: 'Eko Sulistyo' },
  { id: 'U-05', username: 'dian_qc', role: 'QC', lokasiId: 'MPD', status: 'active', namaLengkap: 'Dian Sastro' },
  { id: 'U-06', username: 'rina_packer', role: 'Kemas', lokasiId: 'JKT', status: 'active', namaLengkap: 'Rina Herawati' },
  { id: 'U-07', username: 'agus_sales', role: 'Sales', lokasiId: 'JKT', status: 'active', namaLengkap: 'Agus Purnomo' },
  { id: 'U-08', username: 'hendra_finance', role: 'Finance', lokasiId: 'JKT', status: 'active', namaLengkap: 'Hendra Wijaya' },
  { id: 'U-09', username: 'mamat_operator', role: 'Operator', lokasiId: 'JKT', status: 'active', namaLengkap: 'Mamat Surahmat' },
  { id: 'U-10', username: 'tomi_batu', role: 'Kepala Pabrik Cabang', lokasiId: 'MPD', status: 'active', namaLengkap: 'Tomi Budiseno' }
];

export const SEED_PENDING_USERS: User[] = [
  { id: 'U-91', username: 'wati_pasuruan', role: 'Operator', lokasiId: 'SSP', status: 'pending_approval', namaLengkap: 'Wati Susilowati' },
  { id: 'U-92', username: 'fajar_sales', role: 'Sales', lokasiId: 'JKT', status: 'pending_approval', namaLengkap: 'Fajar Shiddiq' }
];

// Employees list (Karyawan)
export const SEED_KARYAWAN: Karyawan[] = [
  // WONOSOBO (MPD)
  { id: 'EMP-MPD-01', nama: 'Stefanus', nik: '330701010101', role: 'Branch Manager', department: 'Management', position: 'Branch Manager', lokasiId: 'MPD', tarifDasar: 0, tarifInsentif: 0, targetHarian: 0, status: 'Aktif', gajiBulanan: 7500000 },
  { id: 'EMP-MPD-02', nama: 'Slamet', nik: '330701010102', role: 'Production Operator', department: 'Vacuum Frying', position: 'Vacuum Frying Operator', lokasiId: 'MPD', tarifDasar: 25000, tarifInsentif: 5000, targetHarian: 6, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-MPD-03', nama: 'Samsul', nik: '330701010103', role: 'Production Operator', department: 'Vacuum Frying', position: 'Vacuum Frying Operator', lokasiId: 'MPD', tarifDasar: 25000, tarifInsentif: 5000, targetHarian: 6, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-MPD-04', nama: 'Ponida', nik: '330701010104', role: 'Peeling Operator', department: 'Raw Material Processing', position: 'Peeling Worker', lokasiId: 'MPD', tarifDasar: 1500, tarifInsentif: 300, targetHarian: 40, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-MPD-05', nama: 'Kasini', nik: '330701010105', role: 'Peeling Operator', department: 'Raw Material Processing', position: 'Peeling Worker', lokasiId: 'MPD', tarifDasar: 1500, tarifInsentif: 300, targetHarian: 40, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-MPD-06', nama: 'Wahyuti', nik: '330701010106', role: 'Peeling Operator', department: 'Raw Material Processing', position: 'Peeling Worker', lokasiId: 'MPD', tarifDasar: 1500, tarifInsentif: 300, targetHarian: 40, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-MPD-07', nama: 'Mila', nik: '330701010107', role: 'Peeling Operator', department: 'Raw Material Processing', position: 'Peeling Worker', lokasiId: 'MPD', tarifDasar: 1500, tarifInsentif: 300, targetHarian: 40, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-MPD-08', nama: 'Suryati', nik: '330701010108', role: 'Peeling Operator', department: 'Raw Material Processing', position: 'Peeling Worker', lokasiId: 'MPD', tarifDasar: 1500, tarifInsentif: 300, targetHarian: 40, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-MPD-09', nama: 'Tumpuk', nik: '330701010109', role: 'Peeling Operator', department: 'Raw Material Processing', position: 'Peeling Worker', lokasiId: 'MPD', tarifDasar: 1500, tarifInsentif: 300, targetHarian: 40, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-MPD-10', nama: 'Giyatmi', nik: '330701010110', role: 'Peeling Operator', department: 'Raw Material Processing', position: 'Peeling Worker', lokasiId: 'MPD', tarifDasar: 1500, tarifInsentif: 300, targetHarian: 40, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-MPD-11', nama: 'Fatma', nik: '330701010111', role: 'Peeling Operator', department: 'Raw Material Processing', position: 'Peeling Worker', lokasiId: 'MPD', tarifDasar: 1500, tarifInsentif: 300, targetHarian: 40, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-MPD-12', nama: 'Yanti', nik: '330701010112', role: 'Peeling Operator', department: 'Raw Material Processing', position: 'Peeling Worker', lokasiId: 'MPD', tarifDasar: 1500, tarifInsentif: 300, targetHarian: 40, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-MPD-13', nama: 'Dwika', nik: '330701010113', role: 'Peeling Operator', department: 'Raw Material Processing', position: 'Peeling Worker', lokasiId: 'MPD', tarifDasar: 1500, tarifInsentif: 300, targetHarian: 40, status: 'Aktif', gajiBulanan: 0 },

  // SIPAHUTAR (SSP)
  { id: 'EMP-SSP-01', nama: 'Pahotan Manurung', nik: '120101010101', role: 'Branch Manager', department: 'Management', position: 'Branch Manager', lokasiId: 'SSP', tarifDasar: 0, tarifInsentif: 0, targetHarian: 0, status: 'Aktif', gajiBulanan: 7500000 },
  { id: 'EMP-SSP-02', nama: 'Parlinggoman Silitonga', nik: '120101010102', role: 'Production Supervisor', department: 'Production', position: 'Production Supervisor', lokasiId: 'SSP', tarifDasar: 0, tarifInsentif: 0, targetHarian: 0, status: 'Aktif', gajiBulanan: 5000000 },
  { id: 'EMP-SSP-03', nama: 'Nanda Siburian', nik: '120101010103', role: 'Production Operator', department: 'Vacuum Frying', position: 'Vacuum Frying Operator', lokasiId: 'SSP', tarifDasar: 25000, tarifInsentif: 5000, targetHarian: 6, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-SSP-04', nama: 'Idalan', nik: '120101010104', role: 'Peeling Operator', department: 'Raw Material Processing', position: 'Peeling Worker', lokasiId: 'SSP', tarifDasar: 1500, tarifInsentif: 300, targetHarian: 40, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-SSP-05', nama: 'Dermawati', nik: '120101010105', role: 'Peeling Operator', department: 'Raw Material Processing', position: 'Peeling Worker', lokasiId: 'SSP', tarifDasar: 1500, tarifInsentif: 300, targetHarian: 40, status: 'Aktif', gajiBulanan: 0 },

  // JAKARTA (KKI)
  { id: 'EMP-KKI-01', nama: 'Ariyanto', nik: '310101010101', role: 'Branch Manager', department: 'Management', position: 'Branch Manager', lokasiId: 'KKI', tarifDasar: 0, tarifInsentif: 0, targetHarian: 0, status: 'Aktif', gajiBulanan: 8000000 },
  { id: 'EMP-KKI-02', nama: 'Renita', nik: '310101010102', role: 'Branch Admin', department: 'Administration', position: 'Branch Admin', lokasiId: 'KKI', tarifDasar: 0, tarifInsentif: 0, targetHarian: 0, status: 'Aktif', gajiBulanan: 4500000 },
  { id: 'EMP-KKI-03', nama: 'Angga', nik: '310101010103', role: 'Peeling Operator', department: 'Raw Material Processing', position: 'Peeling Worker', lokasiId: 'KKI', tarifDasar: 1500, tarifInsentif: 300, targetHarian: 40, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-KKI-04', nama: 'Rado', nik: '310101010104', role: 'Peeling Operator', department: 'Raw Material Processing', position: 'Peeling Worker', lokasiId: 'KKI', tarifDasar: 1500, tarifInsentif: 300, targetHarian: 40, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-KKI-05', nama: 'Noval', nik: '310101010105', role: 'Peeling Operator', department: 'Raw Material Processing', position: 'Peeling Worker', lokasiId: 'KKI', tarifDasar: 1500, tarifInsentif: 300, targetHarian: 40, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-KKI-06', nama: 'Tegar', nik: '310101010106', role: 'Production Operator', department: 'Production', position: 'Production Operator', lokasiId: 'KKI', tarifDasar: 25000, tarifInsentif: 5000, targetHarian: 6, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-KKI-07', nama: 'Ari', nik: '310101010107', role: 'Production Operator', department: 'Production', position: 'Production Operator', lokasiId: 'KKI', tarifDasar: 25000, tarifInsentif: 5000, targetHarian: 6, status: 'Aktif', gajiBulanan: 0 },

  // JAKARTA KEMAS (AGDN)
  { id: 'EMP-AGDN-01', nama: 'Nur', nik: '320101010101', role: 'Packaging Operator', department: 'Packaging', position: 'Packaging Worker', lokasiId: 'AGDN', tarifDasar: 15000, tarifInsentif: 50, targetHarian: 300, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-AGDN-02', nama: 'Wina', nik: '320101010102', role: 'Packaging Operator', department: 'Packaging', position: 'Packaging Worker', lokasiId: 'AGDN', tarifDasar: 15000, tarifInsentif: 50, targetHarian: 300, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-AGDN-03', nama: 'Nabila', nik: '320101010103', role: 'Packaging Operator', department: 'Packaging', position: 'Packaging Worker', lokasiId: 'AGDN', tarifDasar: 15000, tarifInsentif: 50, targetHarian: 300, status: 'Aktif', gajiBulanan: 0 },
  { id: 'EMP-AGDN-04', nama: 'Renita AGDN', nik: '320101010104', role: 'Branch Admin', department: 'Administration', position: 'Branch Admin', lokasiId: 'AGDN', tarifDasar: 0, tarifInsentif: 0, targetHarian: 0, status: 'Aktif', gajiBulanan: 4500000 },

  // JAKARTA HQ (JKT)
  { id: 'EMP-JKT-01', nama: 'Richardo', nik: '317101010101', role: 'Director', department: 'Management', position: 'Director', lokasiId: 'JKT', tarifDasar: 0, tarifInsentif: 0, targetHarian: 0, status: 'Aktif', gajiBulanan: 15000000 },
  { id: 'EMP-JKT-02', nama: 'Afi', nik: '317101010102', role: 'Director', department: 'Management', position: 'Director', lokasiId: 'JKT', tarifDasar: 0, tarifInsentif: 0, targetHarian: 0, status: 'Aktif', gajiBulanan: 15000000 },
  { id: 'EMP-JKT-03', nama: 'Jefri Sirait', nik: '317101010103', role: 'Director', department: 'Management', position: 'Director', lokasiId: 'JKT', tarifDasar: 0, tarifInsentif: 0, targetHarian: 0, status: 'Aktif', gajiBulanan: 15000000 },
  { id: 'EMP-JKT-04', nama: 'Afi HR', nik: '317101010104', role: 'HR & Procurement', department: 'HR & Procurement', position: 'HR & Procurement Manager', lokasiId: 'JKT', tarifDasar: 0, tarifInsentif: 0, targetHarian: 0, status: 'Aktif', gajiBulanan: 8500000 },
  { id: 'EMP-JKT-05', nama: 'Nadya', nik: '317101010105', role: 'Finance HQ', department: 'Finance', position: 'Finance HQ', lokasiId: 'JKT', tarifDasar: 0, tarifInsentif: 0, targetHarian: 0, status: 'Aktif', gajiBulanan: 8000000 }
];

// Suppliers
export const SEED_SUPPLIER: Supplier[] = [
  { id: 'SUP-01', kode: 'SUP-APL-MLG', nama: 'Koperasi Tani Makmur Batu', alamat: 'Jl. Terusan Sultan Agung No. 5, Batu', telepon: '08123456789', jenisBahan: ['Apel', 'Nangka'], rating: 5 },
  { id: 'SUP-02', kode: 'SUP-PSG-MLG', nama: 'CV Pisang Jaya Dampit', alamat: 'Jl. Trans Dampit Km 12, Malang', telepon: '08233445566', jenisBahan: ['Pisang'], rating: 4 },
  { id: 'SUP-03', kode: 'SUP-SLK-YGY', nama: 'Agro Salak Pondoh Sleman', alamat: 'Jl. Kaliurang Km 18, Yogyakarta', telepon: '08119988776', jenisBahan: ['Salak'], rating: 5 },
  { id: 'SUP-04', kode: 'SUP-PKG-MLG', nama: 'PT Surya Kemas Indonesia', alamat: 'Kawasan Industri SIER Kav. 4, Surabaya', telepon: '031-8987654', jenisBahan: ['Pouch', 'Kartons', 'Minyak Goreng'], rating: 4 }
];

// Supermarket supermarkets & shops (CustomerToko)
export const SEED_CUSTOMER: CustomerToko[] = [
  { id: 'CUST-01', kode: 'CST-IND-NAT', nama: 'Indogrosir Cabang Malang', alamat: 'Jl. Ahmad Yani No. 100, Malang', telepon: '0341-456000', tipe: 'Distributor', komisiSalesPercent: 1 },
  { id: 'CUST-02', kode: 'CST-HYP-MLG', nama: 'Hypermart Malang Town Square', alamat: 'Jl. Veteran No. 2, Malang', telepon: '0341-551122', tipe: 'Supermarket', komisiSalesPercent: 0 },
  { id: 'CUST-03', kode: 'CST-OLE-MLG', nama: 'Pusat Oleh-Oleh Lancar Jaya Batu', alamat: 'Jl. Diponegoro No. 21, Batu', telepon: '0851002233', tipe: 'Konsinyasi', komisiSalesPercent: 5 },
  { id: 'CUST-04', kode: 'CST-BRL-SUB', nama: 'Brawijaya Group Oleh-Oleh Surabaya', alamat: 'Jl. Genteng Besar No. 58, Surabaya', telepon: '031-534567', tipe: 'Distributor', komisiSalesPercent: 2.5 }
];

// Product Models & SKUs
export const SEED_PRODUK: ProdukSKU[] = [
  { id: 'PRD-01', sku: 'AGR-APL-100', nama: 'Keripik Apel Standar Agridea 100g', brand: 'AGRIDEA', varian: 'Apel', gramasi: 100, jenisKemasan: 'Standing Pouch', hargaJualStandar: 18000, hppStandar: 11200, barcode: '8991234901001' },
  { id: 'PRD-02', sku: 'AGR-PSG-150', nama: 'Keripik Pisang Crunchy Agridea 150g', brand: 'AGRIDEA', varian: 'Pisang', gramasi: 150, jenisKemasan: 'Standing Pouch', hargaJualStandar: 16500, hppStandar: 9800, barcode: '8991234901002' },
  { id: 'PRD-03', sku: 'AGR-NGK-100', nama: 'Keripik Nangka Super Agridea 100g', brand: 'AGRIDEA', varian: 'Nangka', gramasi: 100, jenisKemasan: 'Standing Pouch', hargaJualStandar: 22000, hppStandar: 13500, barcode: '8991234901003' },
  { id: 'PRD-04', sku: 'CRT-SLK-100', nama: 'Crispify Salak Pondoh Premium 100g', brand: 'CRISPIFY', varian: 'Salak', gramasi: 100, jenisKemasan: 'Standing Pouch', hargaJualStandar: 20000, hppStandar: 12100, barcode: '8991234902004' },
  { id: 'PRD-05', sku: 'AGR-APL-250', nama: 'Keripik Apel BigPack Agridea 250g', brand: 'AGRIDEA', varian: 'Apel', gramasi: 250, jenisKemasan: 'Standing Pouch', hargaJualStandar: 42000, hppStandar: 26000, barcode: '8991234901005' }
];

// Bill of Materials (BOM) per Product SKU
export const SEED_BOM: BOMProduk[] = [
  { id: 'BOM-01', produkId: 'PRD-01', bahanBakuKg: 1.2, minyakLiter: 0.15, lpgKg: 0.2, kemasanPcs: 1, outerBoxFraction: 0.0417 }, // 1 box contains 24 pouches
  { id: 'BOM-02', produkId: 'PRD-02', bahanBakuKg: 0.9, minyakLiter: 0.18, lpgKg: 0.18, kemasanPcs: 1, outerBoxFraction: 0.0417 },
  { id: 'BOM-03', produkId: 'PRD-03', bahanBakuKg: 1.5, minyakLiter: 0.12, lpgKg: 0.22, kemasanPcs: 1, outerBoxFraction: 0.0417 },
  { id: 'BOM-04', produkId: 'PRD-04', bahanBakuKg: 1.1, minyakLiter: 0.10, lpgKg: 0.19, kemasanPcs: 1, outerBoxFraction: 0.0417 }
];

// Machines
export const SEED_MESIN: Mesin[] = [
  { id: 'M-01', nama: 'Vacuum Fryer V-01 (Agrowindo 50kg)', tipe: 'Vacuum Frying', locationsId: 'JKT', status: 'Operational', kapasitas: '50 kg/batch' } as any,
  { id: 'M-02', nama: 'Vacuum Fryer V-02 (Agrowindo 25kg)', tipe: 'Vacuum Frying', locationsId: 'JKT', status: 'Operational', kapasitas: '25 kg/batch' } as any,
  { id: 'M-03', nama: 'Semi-Auto Peeler P-01', tipe: 'Peeling Machine', locationsId: 'JKT', status: 'Operational', kapasitas: '100 kg/jam' } as any,
  { id: 'M-04', nama: 'Continuous Band Sealer K-01', tipe: 'Packaging Machine', locationsId: 'JKT', status: 'Operational', kapasitas: '2000 pcs/jam' } as any,
  { id: 'M-05', nama: 'Vacuum Fryer V-03 (Batu)', tipe: 'Vacuum Frying', locationsId: 'MPD', status: 'Maintenance', kapasitas: '50 kg/batch' } as any
];

// Existing Purchase Orders
export const SEED_PO: PurchaseOrder[] = [
  {
    id: 'PO-001',
    poNumber: 'PO/2026/05/20-001',
    supplierId: 'SUP-01',
    lokasiId: 'JKT',
    tanggal: '2026-05-20',
    items: [
      { namaBahan: 'Apel Segar', qtyKg: 1500, hargaPerKg: 12000, totalHarga: 18000000 },
      { namaBahan: 'Nangka Segar', qtyKg: 500, hargaPerKg: 14000, totalHarga: 7000000 }
    ],
    status: 'Closed',
    createdById: 'U-02'
  },
  {
    id: 'PO-002',
    poNumber: 'PO/2026/05/28-002',
    supplierId: 'SUP-02',
    lokasiId: 'JKT',
    tanggal: '2026-05-28',
    items: [
      { namaBahan: 'Pisang Raja Segar', qtyKg: 800, hargaPerKg: 9000, totalHarga: 7200000 }
    ],
    status: 'Approved',
    createdById: 'U-08'
  },
  {
    id: 'PO-003',
    poNumber: 'PO/2026/06/01-003',
    supplierId: 'SUP-03',
    lokasiId: 'JKT',
    tanggal: '2026-06-01',
    items: [
      { namaBahan: 'Salak Segar', qtyKg: 1000, hargaPerKg: 10500, totalHarga: 10500000 }
    ],
    status: 'Draft',
    createdById: 'U-02'
  }
];

// Material Receipts (Penerimaan)
export const SEED_PENERIMAAN: PenerimaanBahanBaku[] = [
  {
    id: 'RCV-001',
    poId: 'PO-001',
    lokasiId: 'JKT',
    tanggal: '2026-05-21',
    supplierId: 'SUP-01',
    jenisBahan: 'Apel Segar',
    beratDiterimaKg: 1510, // slightly more
    hargaPerKg: 12000,
    totalHarga: 18120000,
    grade: 'A',
    asalBahan: 'Bumiaji, Batu',
    picId: 'U-02'
  },
  {
    id: 'RCV-002',
    poId: 'PO-001',
    lokasiId: 'JKT',
    tanggal: '2026-05-21',
    supplierId: 'SUP-01',
    jenisBahan: 'Nangka Segar',
    beratDiterimaKg: 490, // slightly less
    hargaPerKg: 14000,
    totalHarga: 6860000,
    grade: 'B',
    asalBahan: 'Karangploso, Malang',
    picId: 'U-02'
  }
];

// Batch Production list
export const SEED_BATCH: BatchProduksi[] = [
  {
    id: 'BATCH-APL-001',
    namaBahan: 'Apel',
    tanggalMulai: '2026-05-28',
    lokasiId: 'JKT',
    status: 'Completed',
    totalBiayaBahan: 4800000, // 400 kg * Rp 12.000
    totalBiayaTenagaKerja: 450000, // peeling + fry worker + packaging worker
    totalBiayaPenolong: 350000, // oil, sugar
    totalBiayaEnergy: 480000, // LPG + water + electricity
    totalBiayaOverhead: 120000, // machine maintenance allocation
    totalBiayaWaste: 300000, // reject / remahan loss
    totalHasilPcs: 850, // pouches produced
    currentWeightKg: 85
  },
  {
    id: 'BATCH-NGK-002',
    namaBahan: 'Nangka',
    tanggalMulai: '2026-05-30',
    lokasiId: 'MPD',
    status: 'QC_Grading',
    totalBiayaBahan: 4200000,
    totalBiayaTenagaKerja: 350000,
    totalBiayaPenolong: 250000,
    totalBiayaEnergy: 400000,
    totalBiayaOverhead: 100000,
    totalBiayaWaste: 150000,
    totalHasilPcs: 0,
    currentWeightKg: 65
  },
  {
    id: 'BATCH-APL-003',
    namaBahan: 'Apel',
    tanggalMulai: '2026-06-01',
    lokasiId: 'JKT',
    status: 'Frying',
    totalBiayaBahan: 3600000, // 300kg segar
    totalBiayaTenagaKerja: 120000, // peeling wage
    totalBiayaPenolong: 0,
    totalBiayaEnergy: 0,
    totalBiayaOverhead: 40000,
    totalBiayaWaste: 240000, // peeled waste
    totalHasilPcs: 0,
    currentWeightKg: 135 // currently freezing/frying stage (was 135kg after peeling)
  }
];

// Peeling logs (Pengupasan)
export const SEED_PENGUPASAN_LOGS: PengupasanLog[] = [
  {
    id: 'PL-001',
    batchId: 'BATCH-APL-001',
    lokasiId: 'JKT',
    tanggal: '2026-05-28',
    karyawanId: 'K-01', // Siti Aminah
    bahanMasukKg: 200,
    hasilKupasKg: 122,
    rejectKg: 11, // rot / scrap
    jamKerja: 8,
    targetHarian: 40,
    yieldPercent: 61, // 122 / 200
    rejectRatePercent: 5.5,
    gajiDihasilkan: 207600, // 122kg * Rp 1500 + incentive of Rp 300 * (122-40) = 183000 + 24600
    insentifDiterima: 24600
  },
  {
    id: 'PL-002',
    batchId: 'BATCH-APL-001',
    lokasiId: 'JKT',
    tanggal: '2026-05-28',
    karyawanId: 'K-02', // Dewi Rahma
    bahanMasukKg: 200,
    hasilKupasKg: 118,
    rejectKg: 13,
    jamKerja: 8,
    targetHarian: 40,
    yieldPercent: 59,
    rejectRatePercent: 6.5,
    gajiDihasilkan: 200400, // 118*1500 + 300*(118-40)
    insentifDiterima: 23400
  },
  {
    id: 'PL-003',
    batchId: 'BATCH-APL-003',
    lokasiId: 'JKT',
    tanggal: '2026-06-01',
    karyawanId: 'K-01',
    bahanMasukKg: 300,
    hasilKupasKg: 185,
    rejectKg: 15,
    jamKerja: 8,
    targetHarian: 40,
    yieldPercent: 61.6,
    rejectRatePercent: 5.0,
    gajiDihasilkan: 321000, // 185*1500 + 300*(185-40) = 277500 + 43500
    insentifDiterima: 43500
  }
];

// Freezing logs (Pembekuan)
export const SEED_PEMBEKUAN_LOGS: PembekuanLog[] = [
  { id: 'FL-001', batchId: 'BATCH-APL-001', lokasiId: 'JKT', tanggal: '2026-05-28', beratKupasMasuk: 240, beratFrozenOutput: 238, shift: 'Siang' },
  { id: 'FL-002', batchId: 'BATCH-APL-003', lokasiId: 'JKT', tanggal: '2026-06-01', beratKupasMasuk: 185, beratFrozenOutput: 183, shift: 'Malam' }
];

// Vacuum Frying logs
export const SEED_VACUUM_FRYING_LOGS: VacuumFryingLog[] = [
  {
    id: 'VFL-001',
    batchId: 'BATCH-APL-001',
    lokasiId: 'JKT',
    tanggal: '2026-05-29',
    operatorId: 'K-03', // Eko Sulistyo
    mesinId: 'M-01',
    beratFrozenMasukKg: 238,
    beratHasilKeripikKg: 95.2, // ~40% frying yield from frozen
    minyakDigunakanLiter: 35,
    lpgDigunakanKg: 40,
    cycleCount: 5,
    shift: 'Pagi',
    parameterMesin: { suhuCelcius: 85, tekananVacuumKpa: -95, waktuMenit: 65 },
    gajiOperator: 125000 // 5 cycles * 25000
  }
];

// Quality Control logs
export const SEED_QC_LOGS: QualityControlLog[] = [
  {
    id: 'QCL-001',
    batchId: 'BATCH-APL-001',
    lokasiId: 'JKT',
    tanggal: '2026-05-29',
    qcId: 'U-05',
    beratMasukKg: 95.2,
    hasilGradeAKg: 82.5,
    hasilGradeBKg: 8.3,
    hasilGradeCKg: 3.1,
    rejectKg: 1.3,
    alasanReject: 'Overcooked, burnt edges on small pieces',
    status: 'Passed'
  }
];

// Packaging logs (Pengemasan)
export const SEED_PENGEMASAN_LOGS: PengemasanLog[] = [
  {
    id: 'PGL-001',
    batchId: 'BATCH-APL-001',
    produkId: 'PRD-01', // SKU: AGR-APL-100
    lokasiId: 'JKT',
    tanggal: '2026-05-30',
    karyawanId: 'K-05', // Rina Herawati
    beratMasukKeripikKg: 82.5, // grade A goes into standard packs
    beratTerkemasKg: 80.0, // some dust loss
    remahanKg: 2.5, // crush waste
    totalPcsDihasilkan: 800, // 80kg produced in 100g bags
    targetPcsHarian: 300,
    jamKerja: 8,
    pouchDigunakan: 805, // 5 defect/excess seals
    boxDigunakan: 34, // 800 pcs / 24 items in a box = 33.3 boxes (34 boxes)
    gajiKemas: 145000 // 8 hours * 15000 + bonus of 50 * (800-300)/2 = 120000 + 25000
  },
  {
    id: 'PGL-002',
    batchId: 'BATCH-APL-001',
    produkId: 'PRD-05', // SKU: AGR-APL-250 (BigPack) is packaged with remainder
    lokasiId: 'JKT',
    tanggal: '2026-05-30',
    karyawanId: 'K-06',
    beratMasukKeripikKg: 12.5, // Grade B goes to bigpacks or sold as bulk
    beratTerkemasKg: 12.5,
    remahanKg: 0,
    totalPcsDihasilkan: 50, // 50 * 250g = 12.5kg
    targetPcsHarian: 300,
    jamKerja: 4,
    pouchDigunakan: 51,
    boxDigunakan: 3,
    gajiKemas: 60000 // 4 hours * 15000
  }
];

// Pre-existing Stocks in Inventory (for quick view)
export const INITIAL_STOCKS = [
  // Raw Material
  { key: 'Apel Segar', kategori: 'Bahan Baku', qty: 2500, lokasiId: 'JKT', unit: 'kg' },
  { key: 'Nangka Segar', kategori: 'Bahan Baku', qty: 980, lokasiId: 'JKT', unit: 'kg' },
  { key: 'Pisang Raja Segar', kategori: 'Bahan Baku', qty: 400, lokasiId: 'JKT', unit: 'kg' },
  { key: 'Salak Segar', kategori: 'Bahan Baku', qty: 150, lokasiId: 'JKT', unit: 'kg' },
  // Setengah jadi / WIP
  { key: 'Apel Kupas', kategori: 'WIP', qty: 0, lokasiId: 'JKT', unit: 'kg' },
  { key: 'Apel Frozen', kategori: 'WIP', qty: 183, lokasiId: 'JKT', unit: 'kg' }, // ready for frying for batch 003
  { key: 'Apel Keripik Jadi (Unpacked)', kategori: 'WIP', qty: 5.2, lokasiId: 'JKT', unit: 'kg' },
  // Product Terkemas (Branded SKU)
  { key: 'AGR-APL-100', kategori: 'Produk Jadi', qty: 1240, lokasiId: 'JKT', unit: 'pcs' },
  { key: 'AGR-PSG-150', kategori: 'Produk Jadi', qty: 450, lokasiId: 'JKT', unit: 'pcs' },
  { key: 'AGR-NGK-100', kategori: 'Produk Jadi', qty: 620, lokasiId: 'JKT', unit: 'pcs' },
  { key: 'CRT-SLK-100', kategori: 'Produk Jadi', qty: 210, lokasiId: 'JKT', unit: 'pcs' },
  // Materials and packaging
  { key: 'Standing Pouch 100g (Pcs)', kategori: 'Packing Material', qty: 14500, lokasiId: 'JKT', unit: 'pcs' },
  { key: 'Standing Pouch 250g (Pcs)', kategori: 'Packing Material', qty: 6700, lokasiId: 'JKT', unit: 'pcs' },
  { key: 'LPG 50kg (Cylinders)', kategori: 'Packing Material', qty: 12, lokasiId: 'JKT', unit: 'pcs' },
  { key: 'Minyak Goreng Sawit (Litre)', kategori: 'Packing Material', qty: 380, lokasiId: 'JKT', unit: 'liter' },
  { key: 'Karton Box Agridea (Pcs)', kategori: 'Packing Material', qty: 850, lokasiId: 'JKT', unit: 'pcs' }
];

// Stock Opname list
export const SEED_STOCK_OPNAME: StockOpname[] = [
  {
    id: 'SO-001',
    nomorSO: 'SO/MLG/2026/05/31-001',
    tanggal: '2026-05-31',
    lokasiId: 'JKT',
    kategori: 'Bahan Baku',
    status: 'Approved',
    createdById: 'U-02',
    approvedById: 'U-01',
    items: [
      { itemKey: 'Apel Segar', stokSistem: 2510, stokFisik: 2500, selisih: -10, alasan: 'Shrink due to evaporation (susut kadar air)' },
      { itemKey: 'Nangka Segar', stokSistem: 980, stokFisik: 980, selisih: 0, alasan: 'Cocok' }
    ]
  }
];

// Petty cash expenditures
export const SEED_PETTY_CASH: PettyCashEntry[] = [
  { id: 'PC-01', tanggal: '2026-05-25', lokasiId: 'JKT', kategori: 'Operasional', deskripsi: 'Beli ATK Kantor & Form Cetak Manual', tipe: 'Kredit', jumlah: 250000, masukHPP: false, status: 'Approved' },
  { id: 'PC-02', tanggal: '2026-05-27', lokasiId: 'JKT', kategori: 'Bahan Penolong', deskripsi: 'Beli Minyak Goreng Tambahan 40L', tipe: 'Kredit', jumlah: 640000, masukHPP: true, status: 'Approved' },
  { id: 'PC-03', tanggal: '2026-05-29', lokasiId: 'JKT', kategori: 'Maintenance', deskripsi: 'Ganti Seal Karet Vacuum Frying M01', tipe: 'Kredit', jumlah: 150000, masukHPP: true, status: 'Approved' },
  { id: 'PC-04', tanggal: '2026-06-01', lokasiId: 'MPD', kategori: 'Listrik & Air', deskripsi: 'Pembayaran listrik bulanan sub-pabrik Batu', tipe: 'Kredit', jumlah: 1200000, masukHPP: true, status: 'Pending' }
];

// Completed Sales logs (Penjualan)
export const SEED_PENJUALAN: Penjualan[] = [
  {
    id: 'TX-001',
    notaNumber: 'INV/2026/05/31-001',
    customerId: 'CUST-01', // Indogrosir
    lokasiId: 'JKT',
    tanggal: '2026-05-31',
    statusPengiriman: 'Delivered',
    items: [
      { produkId: 'PRD-01', batchId: 'BATCH-APL-001', qtyPcs: 1000, hargaSatuan: 18000, totalHarga: 18000000, hppSatuan: 11200 },
      { produkId: 'PRD-03', batchId: 'BATCH-NGK-002', qtyPcs: 500, hargaSatuan: 22000, totalHarga: 11000000, hppSatuan: 13500 }
    ],
    komisiSales: 290000, // 1% of index total
    totalPenjualan: 29000000,
    totalInvoice: 29000000,
    suratJalanNumber: 'SJ/MLG/20260531-18'
  },
  {
    id: 'TX-002',
    notaNumber: 'INV/2026/06/01-002',
    customerId: 'CUST-03', // Oleh-oleh
    lokasiId: 'JKT',
    tanggal: '2026-06-01',
    statusPengiriman: 'Dispatched',
    items: [
      { produkId: 'PRD-01', batchId: 'BATCH-APL-001', qtyPcs: 200, hargaSatuan: 18000, totalHarga: 3600000, hppSatuan: 11200 },
      { produkId: 'PRD-05', batchId: 'BATCH-APL-001', qtyPcs: 50, hargaSatuan: 42000, totalHarga: 2100000, hppSatuan: 26000 }
    ],
    komisiSales: 285000, // 5% of 5.7jt
    totalPenjualan: 5700000,
    totalInvoice: 5700000,
    suratJalanNumber: 'SJ/MLG/20260601-02'
  }
];

// COGS Batches (Calculated COGS per Batch)
export const SEED_COGS_BATCH: COGSBatch[] = [
  {
    id: 'COGS-001',
    batchId: 'BATCH-APL-001',
    lokasiId: 'JKT',
    produkId: 'PRD-01',
    totalBiayaBahan: 4800000,
    totalBiayaPenolong: 350000,
    totalBiayaKemasan: 563500, // pouches + cartons
    totalBiayaTenagaKerja: 450000,
    totalBiayaOverhead: 120000,
    totalBiayaWaste: 300000,
    totalCogs: 6583500,
    outputKgLayakJual: 80.0,
    outputPcsLayakJual: 800,
    hppPerKg: 82293.75, // 6583500 / 80kg
    hppPerPcs: 8229.375, // around 8.229 IDR (under our budget of 11200 standard!)
    hppPerBox: 197505, // 24 pouch * 8229.3
    status: 'approved',
    calculatedAt: '2026-05-30T10:00:00Z',
    varianceVsStandard: {
      biayaBahanDiff: -150000, // we did better on yields than standard
      biayaTenagaDiff: -20000,
      biayaWasteDiff: -80000,
      rating: 'Efisien'
    }
  }
];

// Machine maintenance
export const SEED_MAINTENANCE_LOGS: MachineMaintenanceLog[] = [
  {
    id: 'MNT-001',
    mesinId: 'M-01',
    tanggal: '2026-05-20',
    tipe: 'Preventive',
    deskripsi: 'Cleaning burner, checking pressure vacuum gasket seals, oil lubrication',
    biaya: 200000,
    downtimeMenit: 120,
    pemberiTugas: 'Budi Hartono'
  },
  {
    id: 'MNT-002',
    mesinId: 'M-05',
    tanggal: '2026-05-31',
    tipe: 'Breakdown',
    deskripsi: 'Vacuum motor overload failure. Replaced bearings and cooling coil.',
    biaya: 1250000,
    downtimeMenit: 480,
    pemberiTugas: 'Tomi Budiseno'
  }
];

// Quality Compliance & food safety Logs
export const SEED_COMPLIANCE_LOGS: QualityComplianceLog[] = [
  {
    id: 'QCOMP-01',
    tipeLog: 'Hygiene Checklist',
    tanggal: '2026-06-01',
    status: 'Complete',
    deskripsi: 'Sanitasi area kupas dan penggorengan harian. Semua operator memakai celemek, penutup rambut, sarung tangan, masker.',
    pic: 'Rina Herawati',
    detailData: { score: 98, defects: [] }
  },
  {
    id: 'QCOMP-02',
    tipeLog: 'Bahan Baku',
    tanggal: '2026-06-01',
    status: 'Action_Required',
    deskripsi: 'Batch Apel dari Supplier 1 Batu memiliki kelembapan 85% (standar < 80%). Memerlukan penambahan waktu vacuum frying 10 menit.',
    pic: 'Dian Sastro',
    detailData: { kelembapanPercent: 85, rekomendasi: 'Add frying time' }
  },
  {
    id: 'QCOMP-03',
    tipeLog: 'Complaint',
    tanggal: '2026-05-24',
    status: 'Complete',
    deskripsi: 'Pelanggan Toko Lancar Jaya menginfokan segel 1 pouch Keripik Apel pecah. Diganti rugi di pengiriman baru.',
    pic: 'Agus Purnomo',
    detailData: { orderId: 'TX-001', replacementSent: true }
  }
];

// Seed Notifications
export const SEED_NOTIFIKASI: AppNotification[] = [
  { id: 'NOT-001', jenisAlert: 'Stok menipis', lokasiId: 'JKT', pesan: 'Stok Minyak Goreng Sawit kritis: Tersisa 380 Liter (batas aman: 500 Liter).', tanggal: '2026-06-01', dibaca: false, prioritas: 'Tinggi' },
  { id: 'NOT-002', jenisAlert: 'Yield rendah', lokasiId: 'JKT', pesan: 'Yield kupas Siti Aminah tanggal 01 Jun 61% berada dibawah target 65%.', tanggal: '2026-06-01', dibaca: false, prioritas: 'Sedang' },
  { id: 'NOT-003', jenisAlert: 'Payroll pending', lokasiId: 'JKT', pesan: 'Penggajian pekerja batch BATCH-APL-001 menunggu persetujuan Bapak Richard.', tanggal: '2026-05-30', dibaca: true, prioritas: 'Tinggi' },
  { id: 'NOT-004', jenisAlert: 'HPP naik', lokasiId: 'MPD', pesan: 'HPP Aktual Keripik Nangka naik 8% karena tingginya harga raw material.', tanggal: '2026-05-31', dibaca: false, prioritas: 'Tinggi' }
];

// Audit Trail Logs
export const SEED_AUDIT_LOGS: AuditLog[] = [
  { id: 'AD-01', userId: 'U-01', username: 'richard_admin', tanggal: '2026-06-01T08:00:00Z', modul: 'Sistem', deskripsi: 'Inisialisasi sistem database AGRIDEA' },
  { id: 'AD-02', userId: 'U-02', username: 'budi_malang', tanggal: '2026-06-01T09:30:00Z', modul: 'Pengadaan', deskripsi: 'Menerbitkan Purchase Order PO/2026/06/01-003' },
  { id: 'AD-03', userId: 'U-01', username: 'richard_admin', tanggal: '2026-06-01T10:45:00Z', modul: 'Finance', deskripsi: 'Menyetujui payroll karyawan batch B-01' }
];
