import { db } from './index.ts';
import { facilityNetworks } from './schema.ts';
import { eq } from 'drizzle-orm';
import type { FacilityNetworkEntity } from '../types.ts';

export async function getAllFacilitiesFromDB(): Promise<FacilityNetworkEntity[]> {
  try {
    const rows = await db.select().from(facilityNetworks);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category as any,
      phone: r.phone || '',
      rawMaterial: r.rawMaterial || '',
      harvestCapacity: r.harvestCapacity || '',
      lat: r.lat,
      lng: r.lng,
      landArea: r.landArea || '',
      harvestMonths: r.harvestMonths || '',
      pricePerKg: r.pricePerKg || 0,
      pic: r.pic || '',
      city: r.city || '',
      province: r.province || '',
      address: r.address || '',
      status: (r.status as any) || 'Operasional',
      description: r.description || '',
      createdAt: r.createdAt ? r.createdAt.toISOString() : undefined,
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : undefined,
    }));
  } catch (error) {
    console.error('Error in getAllFacilitiesFromDB:', error);
    throw new Error('Failed to query facilities from Cloud SQL.', { cause: error });
  }
}

export async function upsertFacilityInDB(facility: FacilityNetworkEntity): Promise<void> {
  try {
    await db
      .insert(facilityNetworks)
      .values({
        id: facility.id,
        name: facility.name,
        category: facility.category,
        phone: facility.phone || null,
        rawMaterial: facility.rawMaterial || null,
        harvestCapacity: facility.harvestCapacity || null,
        lat: facility.lat,
        lng: facility.lng,
        landArea: facility.landArea || null,
        harvestMonths: facility.harvestMonths || null,
        pricePerKg: facility.pricePerKg || 0,
        pic: facility.pic || null,
        city: facility.city || null,
        province: facility.province || null,
        address: facility.address || null,
        status: facility.status || 'Operasional',
        description: facility.description || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: facilityNetworks.id,
        set: {
          name: facility.name,
          category: facility.category,
          phone: facility.phone || null,
          rawMaterial: facility.rawMaterial || null,
          harvestCapacity: facility.harvestCapacity || null,
          lat: facility.lat,
          lng: facility.lng,
          landArea: facility.landArea || null,
          harvestMonths: facility.harvestMonths || null,
          pricePerKg: facility.pricePerKg || 0,
          pic: facility.pic || null,
          city: facility.city || null,
          province: facility.province || null,
          address: facility.address || null,
          status: facility.status || 'Operasional',
          description: facility.description || null,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error('Error in upsertFacilityInDB:', error);
    throw new Error('Failed to upsert facility in Cloud SQL.', { cause: error });
  }
}

export async function deleteFacilityFromDB(id: string): Promise<void> {
  try {
    await db.delete(facilityNetworks).where(eq(facilityNetworks.id, id));
  } catch (error) {
    console.error('Error in deleteFacilityFromDB:', error);
    throw new Error('Failed to delete facility from Cloud SQL.', { cause: error });
  }
}
