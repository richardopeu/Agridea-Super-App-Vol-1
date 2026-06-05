/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BatchProduksi,
  PenerimaanBahanBaku,
  PengupasanLog,
  PembekuanLog,
  VacuumFryingLog,
  QualityControlLog,
  PengemasanLog,
  Penjualan,
  ProdukSKU,
  CustomerToko,
  MachineMaintenanceLog
} from '../types';

export interface CostingBreakdown {
  batchId: string;
  namaBahan: string;
  lokasiId: string;
  tanggalMulai: string;
  status: string;

  // Traced Process Weights
  rawInputKg: number;
  peelingOutputKg: number;
  peelingYieldPercent: number;
  peelingRejectKg: number;
  freezingOutputKg: number;
  fryingOutputKg: number;
  fryingYieldPercent: number;
  qcInputKg: number;
  qcGradeAKg: number;
  qcGradeBKg: number;
  qcGradeCKg: number;
  qcRejectKg: number;
  packagedPcs: number;

  // Cost breakdowns
  rawMaterialCost: number;     // Fruit Procurement Cost
  peelingLaborCost: number;    // Labor 1
  fryingLaborCost: number;     // Labor 2
  qcLaborCost: number;         // Labor 3 (Allocated)
  packagingLaborCost: number;  // Labor 4
  totalLaborCost: number;

  packagingMaterialCost: number; // Pouch + Carton boxes
  oilCost: number;             // Cooking Oil Liter * Rate
  utilityCost: number;         // LPG + Standard Electric & Water
  maintenanceCost: number;     // Allocated machine maintenance log cost
  overheadCost: number;        // General overheads (Rent/Admin allocation)
  
  totalActualCost: number;     // Actual dynamic COGS
  
  // Cost rates
  costPerKg: number;           // Actual COGS per Kg chips
  costPerPcs: number;          // Actual COGS per Single Pack
  
  // SKU Information
  linkedSkuIds: string[];
  skuNames: string[];
  
  // Standard HPP comparisons
  standardHppPerPcs: number;
  variancePerPcs: number;
  efficiencyStatus: 'Sangat Efisien' | 'Optimal' | 'Over Budget';
}

/**
 * Standard parameters used when actual log values are missing or partial.
 */
export const STANDARD_VALS = {
  FruitRates: {
    'Apel': 12000,
    'Nangka': 14000,
    'Pisang': 10000,
    'Salak': 11000,
    'Nanas': 13000,
  } as Record<string, number>,
  OilRatePerLiter: 16000,
  LpgRatePerKg: 18000,
  PouchPrice: 800,
  BoxPrice: 5000,
  QcRatePerKg: 500, // Rp 500 per Kg checked
};

/**
 * Dynamically computes end-to-end traceability costing for a batch.
 */
export function calculateBatchCosting(batch: any, state: any): CostingBreakdown {
  const { id: batchId, namaBahan, lokasiId, tanggalMulai, status } = batch;

  // 1. Trace log records
  const peelingLogs: any[] = (state.peelingLogs || []).filter((l: any) => l.batchId === batchId);
  const freezingLogs: any[] = (state.freezingLogs || []).filter((l: any) => l.batchId === batchId);
  const fryingLogs: any[] = (state.fryingLogs || []).filter((l: any) => l.batchId === batchId);
  const qcLogs: any[] = (state.qcLogs || []).filter((l: any) => l.batchId === batchId);
  const packingLogs: any[] = (state.packingLogs || []).filter((l: any) => l.batchId === batchId);

  // 2. Resolve weights
  const rawInputKg = peelingLogs.reduce((sum, l) => sum + (l.bahanMasukKg || 0), 0) || (batchId === 'BATCH-APL-001' ? 400 : batchId === 'BATCH-NGK-002' ? 350 : 250);
  const peelingOutputKg = peelingLogs.reduce((sum, l) => sum + (l.hasilKupasKg || 0), 0) || (rawInputKg * 0.6);
  const peelingRejectKg = peelingLogs.reduce((sum, l) => sum + (l.rejectKg || 0), 0) || (rawInputKg * 0.1);
  const peelingYieldPercent = rawInputKg > 0 ? (peelingOutputKg / rawInputKg) * 100 : 60;

  const freezingOutputKg = freezingLogs.reduce((sum, l) => sum + (l.beratFrozenOutput || 0), 0) || (peelingOutputKg * 0.95);
  
  const fryingInputKg = fryingLogs.reduce((sum, l) => sum + (l.beratFrozenMasukKg || 0), 0) || freezingOutputKg;
  const fryingOutputKg = fryingLogs.reduce((sum, l) => sum + (l.beratHasilKeripikKg || 0), 0) || (fryingInputKg * 0.4);
  const fryingYieldPercent = fryingInputKg > 0 ? (fryingOutputKg / fryingInputKg) * 100 : 40;

  const qcInputKg = qcLogs.reduce((sum, l) => sum + (l.beratMasukKg || 0), 0) || fryingOutputKg;
  const qcGradeAKg = qcLogs.reduce((sum, l) => sum + (l.hasilGradeAKg || 0), 0) || (qcInputKg * 0.85);
  const qcGradeBKg = qcLogs.reduce((sum, l) => sum + (l.hasilGradeBKg || 0), 0) || (qcInputKg * 0.10);
  const qcGradeCKg = qcLogs.reduce((sum, l) => sum + (l.hasilGradeCKg || 0), 0) || (qcInputKg * 0.02);
  const qcRejectKg = qcLogs.reduce((sum, l) => sum + (l.rejectKg || 0), 0) || (qcInputKg * 0.03);

  const packagedPcs = packingLogs.reduce((sum, l) => sum + (l.totalPcsDihasilkan || 0), 0) || (batch.totalHasilPcs || (qcGradeAKg * 10));

  // 3. Raw Material Cost Calculations
  // Find procurement receipt details or fall back to standard variant rates
  const materialReceipt = (state.penerimaan || []).find((r: any) => 
    r.lokasiId === lokasiId && 
    (r.jenisBahan.toLowerCase().includes(namaBahan.toLowerCase()) || namaBahan.toLowerCase().includes(r.jenisBahan.toLowerCase()))
  );
  const fruitUnitPrice = materialReceipt?.hargaPerKg || STANDARD_VALS.FruitRates[namaBahan as keyof typeof STANDARD_VALS.FruitRates] || 12000;
  const rawMaterialCost = rawInputKg * fruitUnitPrice;

  // 4. Labor Cost Calculations (#24)
  const peelingLaborCost = peelingLogs.reduce((sum, l) => sum + (l.gajiDihasilkan || 0), 0) || (peelingOutputKg * 1500);
  const fryingLaborCost = fryingLogs.reduce((sum, l) => sum + (l.gajiOperator || 0), 0) || (fryingLogs.length * 250000) || (fryingOutputKg > 0 ? fryingOutputKg * 3000 : 250000);
  // Allocate QC labor dynamically
  const qcLaborCost = qcLogs.reduce((sum, l) => sum + (qcInputKg * STANDARD_VALS.QcRatePerKg), 0) || (qcInputKg * STANDARD_VALS.QcRatePerKg) || 50000;
  const packagingLaborCost = packingLogs.reduce((sum, l) => sum + (l.gajiKemas || 0), 0) || (packagedPcs * 500) || 120000;
  
  const totalLaborCost = peelingLaborCost + fryingLaborCost + qcLaborCost + packagingLaborCost;

  // 5. Packaging Cost Calculations
  const pouchUsed = packingLogs.reduce((sum, l) => sum + (l.pouchDigunakan || 0), 0) || packagedPcs;
  const boxUsed = packingLogs.reduce((sum, l) => sum + (l.boxDigunakan || 0), 0) || Math.ceil(packagedPcs / 24);
  let packagingMaterialCost = (pouchUsed * STANDARD_VALS.PouchPrice) + (boxUsed * STANDARD_VALS.BoxPrice);

  // 6. Energy and Cooking Oil Cost
  const oilLiters = fryingLogs.reduce((sum, l) => sum + (l.minyakDigunakanLiter || 0), 0) || (fryingOutputKg * 1.5);
  const oilCost = oilLiters * STANDARD_VALS.OilRatePerLiter;

  const lpgKgUsed = fryingLogs.reduce((sum, l) => sum + (l.lpgDigunakanKg || 0), 0) || (fryingOutputKg * 2.0);
  const baseUtilityCost = lpgKgUsed * STANDARD_VALS.LpgRatePerKg;
  const staticUtilityCost = 45000; // standard water/electric share per batch
  let utilityCost = baseUtilityCost + staticUtilityCost;

  // 7. Maintenance & General Overhead Allocation (#25)
  // Query actual maintenance costs for equipment in this branch and allocate
  const branchMaintenance = (state.maintenanceLogs || []).filter((m: any) => m.lokasiId === lokasiId);
  const totalMaintCost = branchMaintenance.reduce((sum: number, m: any) => sum + (m.biaya || 0), 0);
  let maintenanceCost = totalMaintCost > 0 
    ? Math.round(totalMaintCost / Math.max(1, (state.batches || []).filter((b: any) => b.lokasiId === lokasiId).length)) 
    : 45000; // default standard Rp 45.000 maintenance share

  // Fixed/Indirect Overheads: Rent, helper wages, admin
  let overheadCost = 75000; // flat Rp 75.000 allocation per batch

  // 7.5 Integrasi Pengambilan Biaya dari Petty Cash (#49)
  const factoryPettyCash = (state.pettyCash || []).filter((c: any) => 
    c.lokasiId === lokasiId && 
    c.status === 'Approved' && 
    (c.tipe === 'Kredit' || c.tipe === undefined)
  );
  
  const batchMonth = tanggalMulai ? tanggalMulai.substring(0, 7) : '';
  const monthlyPettyCash = factoryPettyCash.filter((c: any) => !batchMonth || c.tanggal.startsWith(batchMonth));
  
  const monthlyBatchesCount = (state.batches || []).filter((b: any) => 
    b.lokasiId === lokasiId && 
    (!batchMonth || b.tanggalMulai.startsWith(batchMonth))
  ).length || 1;

  let pcsMaintAlloc = 0;
  let pcsUtilityAlloc = 0;
  let pcsPackagingAlloc = 0;
  let pcsOverheadAlloc = 0;

  monthlyPettyCash.forEach((c: any) => {
    const catLower = (c.kategori || '').toLowerCase();
    const isMaint = catLower.includes('maintenance') || catLower.includes('spare parts') || catLower.includes('perawatan');
    const isUtility = catLower.includes('utility') || catLower.includes('listrik') || catLower.includes('internet') || catLower.includes('air');
    const isPacking = catLower.includes('packaging') || catLower.includes('penolong') || catLower.includes('kemas');
    
    const shareAmt = c.jumlah / monthlyBatchesCount;

    if (isMaint) {
      pcsMaintAlloc += shareAmt;
    } else if (isUtility) {
      pcsUtilityAlloc += shareAmt;
    } else if (isPacking) {
      pcsPackagingAlloc += shareAmt;
    } else {
      pcsOverheadAlloc += shareAmt;
    }
  });

  maintenanceCost += Math.round(pcsMaintAlloc);
  utilityCost += Math.round(pcsUtilityAlloc);
  packagingMaterialCost += Math.round(pcsPackagingAlloc);
  overheadCost += Math.round(pcsOverheadAlloc);

  // 8. Total Actual COGS calculation (#26)
  const totalActualCost = rawMaterialCost + totalLaborCost + packagingMaterialCost + oilCost + utilityCost + maintenanceCost + overheadCost;

  // Cost ratios
  const chipsWeight = Math.max(1, fryingOutputKg);
  const finalPcs = Math.max(1, packagedPcs);
  const costPerKg = totalActualCost / chipsWeight;
  const costPerPcs = totalActualCost / finalPcs;

  // Find linked SKUs
  const relevantProducts = (state.produk || []).filter((p: any) => p.varian.toLowerCase() === namaBahan.toLowerCase());
  const linkedSkuIds = relevantProducts.map((p: any) => p.id);
  const skuNames = relevantProducts.map((p: any) => p.nama);

  const standardHppPerPcs = relevantProducts[0]?.hppStandar || 11200;
  const variancePerPcs = costPerPcs - standardHppPerPcs;
  
  let efficiencyStatus: 'Sangat Efisien' | 'Optimal' | 'Over Budget' = 'Optimal';
  if (variancePerPcs < -1000) {
    efficiencyStatus = 'Sangat Efisien';
  } else if (variancePerPcs > 500) {
    efficiencyStatus = 'Over Budget';
  }

  return {
    batchId,
    namaBahan,
    lokasiId,
    tanggalMulai,
    status,
    rawInputKg,
    peelingOutputKg,
    peelingYieldPercent,
    peelingRejectKg,
    freezingOutputKg,
    fryingOutputKg,
    fryingYieldPercent,
    qcInputKg,
    qcGradeAKg,
    qcGradeBKg,
    qcGradeCKg,
    qcRejectKg,
    packagedPcs,
    rawMaterialCost,
    peelingLaborCost,
    fryingLaborCost,
    qcLaborCost,
    packagingLaborCost,
    totalLaborCost,
    packagingMaterialCost,
    oilCost,
    utilityCost,
    maintenanceCost,
    overheadCost,
    totalActualCost,
    costPerKg,
    costPerPcs,
    linkedSkuIds,
    skuNames,
    standardHppPerPcs,
    variancePerPcs,
    efficiencyStatus
  };
}

/**
 * Calculates end-to-end profitability figures grouped dynamically.
 */
export function getProductProfitabilitySummary(state: any) {
  // Map all batches to actual calculated costs
  const costingMap = (state.batches || []).map((b: any) => calculateBatchCosting(b, state));
  const batchCogsCache = new Map<string, CostingBreakdown>();
  costingMap.forEach((c) => batchCogsCache.set(c.batchId, c));

  // Dynamic Sales loop
  const sales: any[] = state.sales || [];
  
  // Custom groupings placeholders
  const byFactory: Record<string, { revenue: number, cogs: number }> = {};
  const byFruit: Record<string, { revenue: number, cogs: number, volume: number }> = {};
  const bySku: Record<string, { sku: string, name: string, variant: string, revenue: number, cogs: number, pcs: number, marginPercent: number, hppUnit: number, priceUnit: number }> = {};
  const byCustomer: Record<string, { id: string, name: string, type: string, brand: string, revenue: number, cogs: number, profit: number }> = {};
  const byCustomerCategory: Record<string, { revenue: number, cogs: number, profit: number, count: number }> = {};
  const byBrand: Record<string, { revenue: number, cogs: number, profit: number }> = {};

  // Standard factory locations maps
  state.lokasi.forEach((l: any) => {
    byFactory[l.id] = { revenue: 0, cogs: 0 };
  });

  // Loop through all sales items to calculate revenue and actual COGS based on exactly trace batch costings!
  sales.forEach((sale: any) => {
    const cust = state.customer.find((c: any) => c.id === sale.customerId) || { name: 'Customer Retail Harian', tipe: 'Retail', id: 'RETAIL' };
    const customerCategory = cust.tipe || 'Retail';
    
    // Ensure group exists
    if (!byCustomer[sale.customerId || 'RETAIL']) {
      byCustomer[sale.customerId || 'RETAIL'] = {
        id: sale.customerId || 'RETAIL',
        name: cust.name || cust.nama || 'Customer Retail Harian',
        type: customerCategory,
        brand: cust.customBrand || 'AGRIDEA',
        revenue: 0,
        cogs: 0,
        profit: 0
      };
    }

    if (!byCustomerCategory[customerCategory]) {
      byCustomerCategory[customerCategory] = { revenue: 0, cogs: 0, profit: 0, count: 0 };
    }

    sale.items.forEach((item: any) => {
      const prod = state.produk.find((p: any) => p.id === item.produkId) || { sku: 'KRP-RAW-100', nama: 'Keripik Masakan', varian: 'Apel', brand: 'AGRIDEA', hargaJualStandar: 15000, hppStandar: 9000 };
      const batchCostDetails = batchCogsCache.get(item.batchId);
      
      // Calculate packaging and material custom delta for MAKLON/OEM (#27)
      // OEM: customer has own packaging, brand, sku, and gramasi (weight)
      // Maklon: custom material provided or customized labor/overheads.
      // We alter HPP per pouch based on customer variables if custom values are set
      let customCogsPerPcs = batchCostDetails?.costPerPcs || prod.hppStandar;
      
      if (cust.customGramasi) {
        // adjust cogs per pcs by gramasi ratio (standard is usually 100g, except pisang 150g or bigpack 250g)
        const baseGram = prod.gramasi || 100;
        customCogsPerPcs = (customCogsPerPcs * (cust.customGramasi / baseGram)) * 0.95; // 5% packaging synergy
      }
      
      // OEM branding packaging adjusts packaging cost
      if (cust.tipe === 'OEM' || cust.tipe === 'Maklon') {
        customCogsPerPcs += 250; // Special secondary labeling/rebranding overhead
      }

      const itemRevenue = item.totalHarga || (item.qtyPcs * item.hargaSatuan);
      const itemCogs = item.qtyPcs * customCogsPerPcs;

      const fruitName = prod.varian;
      const brandName = cust.customBrand || prod.brand || 'AGRIDEA';

      // 1. Group by Factory
      const facId = sale.lokasiId || 'JKT';
      if (!byFactory[facId]) {
        byFactory[facId] = { revenue: 0, cogs: 0 };
      }
      byFactory[facId].revenue += itemRevenue;
      byFactory[facId].cogs += itemCogs;

      // 2. Group by Fruit
      if (!byFruit[fruitName]) {
        byFruit[fruitName] = { revenue: 0, cogs: 0, volume: 0 };
      }
      byFruit[fruitName].revenue += itemRevenue;
      byFruit[fruitName].cogs += itemCogs;
      byFruit[fruitName].volume += (item.qtyPcs * (prod.gramasi || 100)) / 1000; // total Kg

      // 3. Group by SKU
      if (!bySku[item.produkId]) {
        bySku[item.produkId] = {
          sku: prod.sku,
          name: prod.nama,
          variant: prod.varian,
          revenue: 0,
          cogs: 0,
          pcs: 0,
          marginPercent: 0,
          hppUnit: customCogsPerPcs,
          priceUnit: item.hargaSatuan
        };
      }
      bySku[item.produkId].revenue += itemRevenue;
      bySku[item.produkId].cogs += itemCogs;
      bySku[item.produkId].pcs += item.qtyPcs;

      // 4. Group by Customer
      byCustomer[sale.customerId || 'RETAIL'].revenue += itemRevenue;
      byCustomer[sale.customerId || 'RETAIL'].cogs += itemCogs;
      byCustomer[sale.customerId || 'RETAIL'].profit += (itemRevenue - itemCogs);

      // 5. Group by Brand
      if (!byBrand[brandName]) {
        byBrand[brandName] = { revenue: 0, cogs: 0, profit: 0 };
      }
      byBrand[brandName].revenue += itemRevenue;
      byBrand[brandName].cogs += itemCogs;
      byBrand[brandName].profit += (itemRevenue - itemCogs);

      // 6. Group by Customer Category
      byCustomerCategory[customerCategory].revenue += itemRevenue;
      byCustomerCategory[customerCategory].cogs += itemCogs;
      byCustomerCategory[customerCategory].profit += (itemRevenue - itemCogs);
    });
  });

  // Calculate percentages and statistics
  const skusList = Object.values(bySku).map((skuData) => {
    const grossProfit = skuData.revenue - skuData.cogs;
    const marginPercent = skuData.revenue > 0 ? (grossProfit / skuData.revenue) * 100 : 0;
    return {
      ...skuData,
      grossProfit,
      marginPercent
    };
  });

  // Sort and rank SKUs for #29
  const top10Skus = [...skusList].sort((a, b) => b.marginPercent - a.marginPercent);
  const bottom10Skus = [...skusList].sort((a, b) => a.marginPercent - b.marginPercent);
  const negativeMarginSkus = skusList.filter(s => s.marginPercent < 15); // Alerts on low margins!

  return {
    byFactory,
    byFruit,
    bySku: skusList,
    byCustomer: Object.values(byCustomer),
    byCustomerCategory,
    byBrand,
    top10Skus,
    bottom10Skus,
    negativeMarginSkus,
    cogsCache: costingMap
  };
}
