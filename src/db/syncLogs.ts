import { db } from './index.ts';
import { workspaceSyncLogs } from './schema.ts';
import { desc } from 'drizzle-orm';

export interface SyncLogItem {
  id?: number;
  syncType: string; // 'google_drive_backup' | 'google_sheets_export' | 'google_sheets_import'
  resourceId?: string;
  resourceName?: string;
  recordsCount?: number;
  status: string;
  userEmail?: string;
  details?: string;
  createdAt?: Date;
}

export async function addSyncLog(log: SyncLogItem) {
  try {
    const result = await db.insert(workspaceSyncLogs).values({
      syncType: log.syncType,
      resourceId: log.resourceId || null,
      resourceName: log.resourceName || null,
      recordsCount: log.recordsCount || 0,
      status: log.status,
      userEmail: log.userEmail || null,
      details: log.details || null,
    }).returning();
    return result[0];
  } catch (error) {
    console.error('Error logging workspace sync:', error);
    return null;
  }
}

export async function getRecentSyncLogs(limitCount = 20) {
  try {
    return await db.select().from(workspaceSyncLogs).orderBy(desc(workspaceSyncLogs.createdAt)).limit(limitCount);
  } catch (error) {
    console.error('Error getting sync logs:', error);
    return [];
  }
}
