import { db } from './index.ts';
import { batchTracking } from './schema.ts';
import { eq } from 'drizzle-orm';

export interface BatchData {
  id: string;
  batchNumber: string;
  fruitVariant: string;
  productionDate: string;
  lokasiId?: string;
  inputRawKg: number;
  outputFinishedKg: number;
  yieldPercent: number;
  totalCogsRp: number;
  costPerKgRp: number;
  qcGrade?: string;
  status?: string;
}

export async function getAllBatchesFromDB(): Promise<BatchData[]> {
  try {
    const rows = await db.select().from(batchTracking);
    return rows.map((r) => ({
      id: r.id,
      batchNumber: r.batchNumber,
      fruitVariant: r.fruitVariant,
      productionDate: r.productionDate,
      lokasiId: r.lokasiId || undefined,
      inputRawKg: r.inputRawKg || 0,
      outputFinishedKg: r.outputFinishedKg || 0,
      yieldPercent: r.yieldPercent || 0,
      totalCogsRp: r.totalCogsRp || 0,
      costPerKgRp: r.costPerKgRp || 0,
      qcGrade: r.qcGrade || 'A',
      status: r.status || 'Selesai',
    }));
  } catch (error) {
    console.error('Error in getAllBatchesFromDB:', error);
    throw new Error('Failed to query batches from Cloud SQL.', { cause: error });
  }
}

export async function upsertBatchInDB(batch: BatchData): Promise<void> {
  try {
    await db
      .insert(batchTracking)
      .values({
        id: batch.id,
        batchNumber: batch.batchNumber,
        fruitVariant: batch.fruitVariant,
        productionDate: batch.productionDate,
        lokasiId: batch.lokasiId || null,
        inputRawKg: batch.inputRawKg,
        outputFinishedKg: batch.outputFinishedKg,
        yieldPercent: batch.yieldPercent,
        totalCogsRp: batch.totalCogsRp,
        costPerKgRp: batch.costPerKgRp,
        qcGrade: batch.qcGrade || 'A',
        status: batch.status || 'Selesai',
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: batchTracking.id,
        set: {
          batchNumber: batch.batchNumber,
          fruitVariant: batch.fruitVariant,
          productionDate: batch.productionDate,
          lokasiId: batch.lokasiId || null,
          inputRawKg: batch.inputRawKg,
          outputFinishedKg: batch.outputFinishedKg,
          yieldPercent: batch.yieldPercent,
          totalCogsRp: batch.totalCogsRp,
          costPerKgRp: batch.costPerKgRp,
          qcGrade: batch.qcGrade || 'A',
          status: batch.status || 'Selesai',
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error('Error in upsertBatchInDB:', error);
    throw new Error('Failed to upsert batch in Cloud SQL.', { cause: error });
  }
}
