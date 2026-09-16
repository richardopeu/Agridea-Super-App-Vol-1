/**
 * Google Workspace Integration for Agridea Manufacturing & Sourcing
 * Supports Google Drive (Backups, Cloud Storage) and Google Sheets (Live Export, Sourcing Spreadsheets)
 */

import type { FacilityNetworkEntity } from '../types.ts';

// Interface for Drive File metadata
export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
}

// Google Drive Service
export class GoogleDriveService {
  /**
   * List files in Google Drive matching Agridea query
   */
  static async listFiles(accessToken: string): Promise<DriveFileItem[]> {
    try {
      const q = encodeURIComponent(
        "trashed = false and (name contains 'Agridea' or mimeType = 'application/json' or mimeType = 'application/vnd.google-apps.spreadsheet')"
      );
      const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,createdTime,modifiedTime,size,webViewLink)&orderBy=modifiedTime desc&pageSize=25`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Google Drive API error (${res.status})`);
      }

      const data = await res.json();
      return data.files || [];
    } catch (error: any) {
      console.error('Failed to list files from Google Drive:', error);
      throw error;
    }
  }

  /**
   * Upload Backup Data (JSON) to Google Drive
   */
  static async uploadBackupFile(
    accessToken: string,
    fileName: string,
    payload: any,
    description: string = 'Agridea Manufacturing System Cloud Backup'
  ): Promise<DriveFileItem> {
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      description,
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(payload, null, 2) +
      closeDelimiter;

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to upload backup to Drive (${res.status})`);
    }

    return await res.json();
  }

  /**
   * Download file content from Google Drive
   */
  static async downloadFileContent(accessToken: string, fileId: string): Promise<any> {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`Failed to download file from Google Drive (${res.status})`);
    }

    return await res.json();
  }

  /**
   * Delete file from Google Drive (Mandatory user confirmation pattern)
   */
  static async deleteFile(accessToken: string, fileId: string): Promise<boolean> {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete file from Google Drive (${res.status})`);
    }
    return true;
  }
}

// Google Sheets Service
export class GoogleSheetsService {
  /**
   * Create a new Google Spreadsheet for Agridea
   */
  static async createSpreadsheet(
    accessToken: string,
    title: string,
    sheetNames: string[] = ['Jaringan Fasilitas', 'Batch Produksi & COGS']
  ): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    const sheets = sheetNames.map((name) => ({
      properties: { title: name },
    }));

    const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: { title },
        sheets,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to create Google Spreadsheet (${res.status})`);
    }

    const data = await res.json();
    return {
      spreadsheetId: data.spreadsheetId,
      spreadsheetUrl: data.spreadsheetUrl,
    };
  }

  /**
   * Export Facility Network to Google Sheets
   */
  static async exportFacilitiesToSheet(
    accessToken: string,
    spreadsheetId: string,
    sheetTitle: string,
    facilities: FacilityNetworkEntity[]
  ) {
    const headers = [
      'ID Entitas',
      'Nama Entitas / Fasilitas',
      'Kategori',
      'Kontak Telepon / WA',
      'Komoditas Bahan Baku',
      'Kapasitas Panen / Pasokan',
      'Latitude',
      'Longitude',
      'Luas Lahan',
      'Bulan Musim Panen',
      'Harga per Kg (Rp)',
      'Kota / Wilayah',
      'Provinsi',
      'PIC / Kontak',
      'Status Operasional',
      'Catatan / Deskripsi',
      'Terakhir Diperbarui',
    ];

    const rows = facilities.map((f) => [
      f.id,
      f.name,
      f.category,
      f.phone || '-',
      f.rawMaterial || '-',
      f.harvestCapacity || '-',
      f.lat,
      f.lng,
      f.landArea || '-',
      f.harvestMonths || '-',
      f.pricePerKg || 0,
      f.city || '-',
      f.province || '-',
      f.pic || '-',
      f.status,
      f.description || '-',
      new Date().toLocaleString('id-ID'),
    ]);

    const values = [headers, ...rows];

    const range = `${sheetTitle}!A1:Q${values.length}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}?valueInputOption=USER_ENTERED`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to export facilities to Google Sheet (${res.status})`);
    }

    return await res.json();
  }

  /**
   * Export Batches & COGS Tracing to Google Sheets
   */
  static async exportBatchesToSheet(
    accessToken: string,
    spreadsheetId: string,
    sheetTitle: string,
    batches: any[]
  ) {
    const headers = [
      'ID Batch',
      'Nomor Batch',
      'Varian Buah / Sayur',
      'Tanggal Produksi',
      'Input Bahan Baku (Kg)',
      'Output Keripik Jadi (Kg)',
      'Yield Rendemen (%)',
      'Total HPP / COGS (Rp)',
      'HPP per Kg (Rp)',
      'Grade Mutu QC',
      'Status',
      'Tanggal Sinkronisasi',
    ];

    const rows = batches.map((b) => [
      b.id,
      b.batchNumber || b.id,
      b.fruitVariant || b.produkSku || 'Apel Manalagi',
      b.productionDate || b.tanggal || new Date().toISOString().split('T')[0],
      b.inputRawKg || b.beratBahanMasukKg || 0,
      b.outputFinishedKg || b.beratHasilKemasKg || 0,
      b.yieldPercent || (b.beratHasilKemasKg && b.beratBahanMasukKg ? ((b.beratHasilKemasKg / b.beratBahanMasukKg) * 100).toFixed(1) : 0),
      b.totalCogsRp || b.totalHppRp || 0,
      b.costPerKgRp || b.hppPerKgRp || 0,
      b.qcGrade || 'A',
      b.status || 'Selesai',
      new Date().toLocaleString('id-ID'),
    ]);

    const values = [headers, ...rows];

    const range = `${sheetTitle}!A1:L${values.length}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}?valueInputOption=USER_ENTERED`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to export batches to Google Sheet (${res.status})`);
    }

    return await res.json();
  }

  /**
   * Read values from a Google Sheet range
   */
  static async readSheetValues(accessToken: string, spreadsheetId: string, range: string): Promise<any[][]> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to read Google Sheet values (${res.status})`);
    }

    const data = await res.json();
    return data.values || [];
  }
}
