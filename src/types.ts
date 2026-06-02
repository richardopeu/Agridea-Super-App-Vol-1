/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'Operator'
  | 'Kupas'
  | 'Frying'
  | 'QC'
  | 'Kemas'
  | 'Sales'
  | 'Kepala Pabrik Cabang'
  | 'Kepala Pabrik HQ'
  | 'Finance'
  | 'Director'
  | 'Direktur HQ'
  | 'HQ Finance'
  | 'HQ Production'
  | 'Branch Manager'
  | 'Branch Admin'
  | 'Production Operator'
  | 'Peeling Operator'
  | 'Packaging Operator'
  | 'HR & Procurement'
  | 'Production Supervisor'
  | 'HR & Procurement Manager'
  | 'HQ Production Manager'
  | 'Finance HQ';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  lokasiId: string;
  status: 'active' | 'pending_approval';
  namaLengkap: string;
  passwordHash?: string;
}

export interface Lokasi {
  id: string;
  nama: string;
  alamat: string;
  kode: string;
  tipe: 'Head Office' | 'Production Factory' | 'Branch Office' | 'Packaging Facility';
  status: 'Active' | 'Inactive';
}

export interface FruitVariant {
  id: string; // Auto-generated code, e.g. FV-001
  nama: string; // unique, e.g., Nanas, Nangka, etc.
  category: 'Fruit' | 'Vegetable' | 'Mushroom' | 'Root Crop' | 'Other';
  status: 'Active' | 'Inactive';
  notes?: string;
}

export interface ChipVariant {
  id: string; // Chip SKU Code, e.g. AGR-APL-100
  nama: string; // e.g., Keripik Apel Standard
  fruitVariantId: string; // Reference to FruitVariant.id
  grade: 'A' | 'B' | 'C';
  brand: string; // e.g., AGRIDEA
  packagingSize: string; // e.g., "100g", "150g"
  status: 'Active' | 'Inactive';
  notes?: string;
}

export interface Karyawan {
  id: string;
  nama: string;
  nik: string;
  role: UserRole;
  tarifDasar: number; // e.g. Rp/kg atau Rp/jam
  tarifInsentif: number; // e.g. bonus pencapaian
  targetHarian: number; // target output per hari (kg atau pcs)
  lokasiId: string;
  department?: string;
  position?: string;
  status?: string;
  gajiBulanan?: number;
}

export interface Supplier {
  id: string;
  kode: string;
  nama: string;
  alamat: string;
  telepon: string;
  jenisBahan: string[]; // e.g. ["Apel", "Pisang"]
  rating: number; // 1-5
}

export interface CustomerToko {
  id: string;
  nama: string;
  kode: string;
  alamat: string;
  telepon: string;
  tipe: string; // e.g. "OEM" | "Maklon" | "Bulky" | "Reseller" | "Distributor"
  komisiSalesPercent: number;
  customBrand?: string;
  customSize?: string;
  customGramasi?: number;
  customVarian?: string;
}

export interface ProdukSKU {
  id: string;
  sku: string; // e.g., KRP-APL-AGR-100G
  nama: string;
  brand: string;
  varian: string; // Apel | Pisang | Nangka | Salak
  gramasi: number; // in grams (e.g., 100, 250, 500)
  jenisKemasan: 'Standing Pouch' | 'Flat Pouch' | 'Toples' | 'Box';
  hargaJualStandar: number;
  hppStandar: number;
  barcode: string;
}

export interface BOMProduk {
  id: string;
  produkId: string;
  bahanBakuKg: number; // Fruit raw material input required per 1 kg finished
  minyakLiter: number;
  lpgKg: number;
  kemasanPcs: number;
  outerBoxFraction: number; // e.g., 1 box has 24 pouch, fraction = 1/24 = 0.0417
}

export interface Mesin {
  id: string;
  nama: string;
  tipe: 'Vacuum Frying' | 'Peeling Machine' | 'Packaging Machine' | 'Dehydrator';
  lokasiId: string;
  status: 'Operational' | 'Maintenance' | 'Breakdown';
  kapasitas: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  lokasiId: string;
  tanggal: string;
  items: {
    namaBahan: string; // Apel | Pisang | Nangka | Salak | dll
    qtyKg: number;
    hargaPerKg: number;
    totalHarga: number;
  }[];
  status: 'Draft' | 'Approved' | 'Received' | 'Closed';
  createdById: string;
}

export interface PenerimaanBahanBaku {
  id: string;
  poId?: string;
  lokasiId: string;
  tanggal: string;
  supplierId: string;
  jenisBahan: string;
  beratDiterimaKg: number;
  hargaPerKg: number;
  totalHarga: number;
  grade: 'A' | 'B' | 'C';
  asalBahan: string; // Domisili
  picId: string;
  notes?: string;
  picPenerima?: string;
  notaUrl?: string;
  fotoBarangUrl?: string;
  keteranganTambahan?: string;
}

export interface PengupasanLog {
  id: string;
  batchId: string;
  lokasiId: string;
  tanggal: string;
  karyawanId: string;
  bahanMasukKg: number; // apples received
  hasilKupasKg: number; // peeled output
  rejectKg: number; // rotten/not usable
  jamKerja: number;
  targetHarian: number;
  yieldPercent: number; // (hasilKupas/bahanMasuk)*100
  rejectRatePercent: number;
  gajiDihasilkan: number; // hasilKupas * tarifKupas + insentif
  insentifDiterima: number;
}

export interface PembekuanLog {
  id: string;
  batchId: string;
  lokasiId: string;
  tanggal: string;
  beratKupasMasuk: number;
  beratFrozenOutput: number;
  shift: 'Pagi' | 'Siang' | 'Malam';
}

export interface VacuumFryingLog {
  id: string;
  batchId: string;
  lokasiId: string;
  tanggal: string;
  operatorId: string;
  mesinId: string;
  beratFrozenMasukKg: number;
  beratHasilKeripikKg: number;
  minyakDigunakanLiter: number;
  lpgDigunakanKg: number;
  cycleCount: number;
  shift: 'Pagi' | 'Siang' | 'Malam';
  parameterMesin: {
    suhuCelcius: number;
    tekananVacuumKpa: number;
    waktuMenit: number;
  };
  gajiOperator: number;
}

export interface QualityControlLog {
  id: string;
  batchId: string;
  lokasiId: string;
  tanggal: string;
  qcId: string;
  beratMasukKg: number;
  hasilGradeAKg: number;
  hasilGradeBKg: number;
  hasilGradeCKg: number;
  rejectKg: number; // gosong, pecah, lembek, dll
  alasanReject: string;
  status: 'Passed' | 'Failed_Rejected';
}

export interface PengemasanLog {
  id: string;
  batchId: string;
  produkId: string; // SKU
  lokasiId: string;
  tanggal: string;
  karyawanId: string;
  beratMasukKeripikKg: number;
  beratTerkemasKg: number;
  remahanKg: number;
  totalPcsDihasilkan: number;
  targetPcsHarian: number;
  jamKerja: number;
  pouchDigunakan: number;
  boxDigunakan: number;
  gajiKemas: number;
}

export interface BatchProduksi {
  id: string; // e.g. BATCH-20260601-A1
  namaBahan: string; // Apel, Pisang, dll
  tanggalMulai: string;
  lokasiId: string;
  status: 'Peeling' | 'Freezing' | 'Frying' | 'QC_Grading' | 'Packaging' | 'Completed';
  totalBiayaBahan: number;
  totalBiayaTenagaKerja: number;
  totalBiayaPenolong: number;
  totalBiayaEnergy: number;
  totalBiayaOverhead: number;
  totalBiayaWaste: number;
  totalHasilPcs: number;
  currentWeightKg: number; // tracks weight through steps
}

export interface StockOpname {
  id: string;
  nomorSO: string;
  tanggal: string;
  lokasiId: string;
  kategori: 'Bahan Baku' | 'WIP' | 'Produk Jadi' | 'Packing Material';
  status: 'Draft' | 'Pending_Approval' | 'Approved' | 'Rejected';
  createdById: string;
  approvedById?: string;
  items: {
    itemKey: string; // e.g. 'Apel Segar' or SKU id, or 'Minyak Goreng'
    stokSistem: number;
    stokFisik: number;
    selisih: number;
    alasan: string;
  }[];
}

export interface StockAdjustment {
  id: string;
  opnameId?: string;
  lokasiId: string;
  tanggal: string;
  createdById: string;
  approvedById?: string;
  status: 'Pending_Approval' | 'Approved' | 'Rejected';
  alasan: string;
  items: {
    itemKey: string;
    tipe: 'Penambahan' | 'Pengurangan';
    qty: number;
    satuan: string;
  }[];
}

export interface PettyCashEntry {
  id: string;
  tanggal: string;
  lokasiId: string;
  kategori: 'Operasional' | 'Bahan Penolong' | 'Maintenance' | 'Listrik & Air' | 'Gaji Tambahan' | 'Lain-lain';
  deskripsi: string;
  tipe: 'Debit' | 'Kredit';
  jumlah: number;
  masukHPP: boolean;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface Penjualan {
  id: string;
  notaNumber: string;
  customerId: string;
  lokasiId: string;
  tanggal: string;
  statusPengiriman: 'Draft' | 'Dispatched' | 'Delivered' | 'Returned';
  items: {
    produkId: string; // SKU ID
    batchId: string; // linked batch for tracing!
    qtyPcs: number;
    hargaSatuan: number;
    totalHarga: number;
    hppSatuan: number; // snapped at time of sale
  }[];
  komisiSales: number;
  totalPenjualan: number;
  totalInvoice: number;
  suratJalanNumber?: string;
}

export interface COGSBatch {
  id: string;
  batchId: string;
  lokasiId: string;
  produkId: string; // SKU
  totalBiayaBahan: number;
  totalBiayaPenolong: number;
  totalBiayaKemasan: number;
  totalBiayaTenagaKerja: number;
  totalBiayaOverhead: number;
  totalBiayaWaste: number;
  totalCogs: number;
  outputKgLayakJual: number;
  outputPcsLayakJual: number;
  hppPerKg: number;
  hppPerPcs: number;
  hppPerBox: number; // e.g., box has 24 units
  status: 'draft' | 'calculated' | 'approved';
  calculatedAt: string;
  varianceVsStandard: {
    biayaBahanDiff: number;
    biayaTenagaDiff: number;
    biayaWasteDiff: number;
    rating: 'Efisien' | 'Standar' | 'Pemborosan';
  };
}

export interface MachineMaintenanceLog {
  id: string;
  mesinId: string;
  tanggal: string;
  tipe: 'Preventive' | 'Corrective' | 'Breakdown';
  deskripsi: string;
  biaya: number;
  downtimeMenit: number;
  pemberiTugas: string;
}

export interface QualityComplianceLog {
  id: string;
  tipeLog: 'Bahan Baku' | 'Proses' | 'Produk Jadi' | 'Hygiene Checklist' | 'Complaint' | 'Recall';
  tanggal: string;
  status: 'Complete' | 'Action_Required' | 'Critical';
  deskripsi: string;
  pic: string;
  detailData: any; // arbitrary details
}

export interface AppNotification {
  id: string;
  jenisAlert: 'Stok menipis' | 'Yield rendah' | 'Final yield rendah' | 'Target kemas meleset' | 'Payroll pending' | 'HPP naik' | 'Margin turun';
  lokasiId: string;
  pesan: string;
  tanggal: string;
  dibaca: boolean;
  prioritas: 'Tinggi' | 'Sedang' | 'Rendah';
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  tanggal: string;
  modul: string;
  deskripsi: string;
}
