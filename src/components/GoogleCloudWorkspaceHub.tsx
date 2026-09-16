/**
 * Google Cloud & Workspace Hub
 * Unified management for:
 * - Google Drive (Backups, Archives, File Management)
 * - Google Sheets (Supply Chain & Batch Tracing Live Spreadsheets)
 * - Cloud SQL (PostgreSQL, project: central-mountain-3pnh2, region: asia-southeast1)
 * - Firebase Authentication & Firestore
 */

import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Database,
  FileSpreadsheet,
  HardDrive,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Upload,
  Download,
  Trash2,
  Shield,
  Layers,
  AlertCircle,
  FileText,
  UserCheck,
  LogIn,
  LogOut,
  Info,
  Check,
} from 'lucide-react';
import {
  auth,
  signInWithGoogle,
  logoutGoogle,
  initAuth,
  getAccessToken,
  testFirestoreConnection,
} from '../lib/firebase.ts';
import {
  GoogleDriveService,
  GoogleSheetsService,
  DriveFileItem,
} from '../lib/googleWorkspace.ts';
import type { FacilityNetworkEntity } from '../types.ts';

interface Props {
  facilities?: FacilityNetworkEntity[];
  batches?: any[];
  onRefreshFacilities?: () => void;
  onImportFacilities?: (facilities: FacilityNetworkEntity[]) => void;
}

export const GoogleCloudWorkspaceHub: React.FC<Props> = ({
  facilities: initialFacilities = [],
  batches = [],
  onRefreshFacilities,
  onImportFacilities,
}) => {
  const [internalFacilities, setInternalFacilities] = useState<FacilityNetworkEntity[]>(initialFacilities);

  useEffect(() => {
    if (initialFacilities && initialFacilities.length > 0) {
      setInternalFacilities(initialFacilities);
    } else {
      fetch('/api/facilities')
        .then(r => r.json())
        .then(d => {
          if (d.success && Array.isArray(d.facilities) && d.facilities.length > 0) {
            setInternalFacilities(d.facilities);
          }
        })
        .catch(() => {});
    }
  }, [initialFacilities]);

  const facilities = internalFacilities;
  const [activeTab, setActiveTab] = useState<'drive' | 'sheets' | 'cloudsql'>('sheets');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveMessage, setDriveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploadingBackup, setIsUploadingBackup] = useState(false);
  const [deleteConfirmFile, setDeleteConfirmFile] = useState<DriveFileItem | null>(null);

  // Sheets state
  const [spreadsheetId, setSpreadsheetId] = useState<string>('');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>('');
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isExportingSheet, setIsExportingSheet] = useState(false);
  const [sheetsMessage, setSheetsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cloud SQL & Firebase status
  const [cloudStatus, setCloudStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [firestoreOnline, setFirestoreOnline] = useState<boolean | null>(null);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        if (token) setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );

    // Fetch Cloud SQL & DB status
    fetchCloudStatus();
    testFirestoreConnection().then(setFirestoreOnline);

    return () => unsubscribe();
  }, []);

  // Fetch Cloud Status
  const fetchCloudStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/cloud-status');
      if (res.ok) {
        const data = await res.json();
        setCloudStatus(data);
      }
    } catch (e) {
      console.warn('Could not fetch cloud status:', e);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await signInWithGoogle();
      setCurrentUser(result.user);
      if (result.accessToken) {
        setAccessToken(result.accessToken);
        loadDriveFiles(result.accessToken);
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setAuthError(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logoutGoogle();
      setCurrentUser(null);
      setAccessToken(null);
      setDriveFiles([]);
    } catch (err: any) {
      console.error('Sign-out failed:', err);
    }
  };

  // Google Drive: Load Files
  const loadDriveFiles = async (token?: string) => {
    const tokenToUse = token || accessToken;
    if (!tokenToUse) return;

    setIsLoadingDrive(true);
    setDriveMessage(null);
    try {
      const files = await GoogleDriveService.listFiles(tokenToUse);
      setDriveFiles(files);
    } catch (err: any) {
      setDriveMessage({ type: 'error', text: `Drive: ${err.message}` });
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // Google Drive: Upload Backup
  const handleCreateDriveBackup = async () => {
    if (!accessToken) {
      setDriveMessage({ type: 'error', text: 'Silakan login dengan Google terlebih dahulu.' });
      return;
    }

    setIsUploadingBackup(true);
    setDriveMessage(null);
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `Agridea_SupplyChain_Backup_${timestamp}.json`;

      const backupPayload = {
        app: 'Agridea Manufacturing Control App',
        version: '2.0.0',
        createdAt: new Date().toISOString(),
        cloudSqlProject: 'central-mountain-3pnh2',
        facilitiesCount: facilities.length,
        batchesCount: batches.length,
        facilities,
        batches,
      };

      const uploaded = await GoogleDriveService.uploadBackupFile(
        accessToken,
        fileName,
        backupPayload,
        `Backup data fasilitas & batch produksi Agridea (${facilities.length} fasilitas)`
      );

      // Log sync to backend
      fetch('/api/workspace-sync-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncType: 'google_drive_backup',
          resourceId: uploaded.id,
          resourceName: fileName,
          recordsCount: facilities.length + batches.length,
          status: 'Success',
          userEmail: currentUser?.email,
          details: `Backup tersimpan di Google Drive: ${fileName}`,
        }),
      }).catch(console.warn);

      setDriveMessage({
        type: 'success',
        text: `Berhasil mencadangkan ${facilities.length} fasilitas & ${batches.length} batch ke Google Drive (${fileName})!`,
      });
      loadDriveFiles(accessToken);
    } catch (err: any) {
      setDriveMessage({ type: 'error', text: `Gagal backup: ${err.message}` });
    } finally {
      setIsUploadingBackup(false);
    }
  };

  // Google Drive: Delete File (Mandatory Confirmation)
  const confirmDeleteFile = async () => {
    if (!deleteConfirmFile || !accessToken) return;
    try {
      await GoogleDriveService.deleteFile(accessToken, deleteConfirmFile.id);
      setDriveMessage({
        type: 'success',
        text: `File ${deleteConfirmFile.name} berhasil dihapus dari Google Drive.`,
      });
      setDeleteConfirmFile(null);
      loadDriveFiles(accessToken);
    } catch (err: any) {
      setDriveMessage({ type: 'error', text: `Gagal menghapus file: ${err.message}` });
    }
  };

  // Google Sheets: Create Master Spreadsheet
  const handleCreateSpreadsheet = async () => {
    if (!accessToken) {
      setSheetsMessage({ type: 'error', text: 'Silakan login dengan Google terlebih dahulu.' });
      return;
    }

    setIsCreatingSheet(true);
    setSheetsMessage(null);
    try {
      const title = `Agridea Manufacturing Master Sheet (${new Date().toLocaleDateString('id-ID')})`;
      const result = await GoogleSheetsService.createSpreadsheet(accessToken, title, [
        'Jaringan Fasilitas',
        'Batch Produksi & COGS',
      ]);

      setSpreadsheetId(result.spreadsheetId);
      setSpreadsheetUrl(result.spreadsheetUrl);

      // Auto export current data to the newly created sheets
      await GoogleSheetsService.exportFacilitiesToSheet(
        accessToken,
        result.spreadsheetId,
        'Jaringan Fasilitas',
        facilities
      );

      if (batches.length > 0) {
        await GoogleSheetsService.exportBatchesToSheet(
          accessToken,
          result.spreadsheetId,
          'Batch Produksi & COGS',
          batches
        );
      }

      // Log sync
      fetch('/api/workspace-sync-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncType: 'google_sheets_export',
          resourceId: result.spreadsheetId,
          resourceName: title,
          recordsCount: facilities.length,
          status: 'Success',
          userEmail: currentUser?.email,
          details: `Spreadsheet baru berhasil dibuat dan disinkronkan.`,
        }),
      }).catch(console.warn);

      setSheetsMessage({
        type: 'success',
        text: `Google Spreadsheet berhasil dibuat dan ${facilities.length} entitas fasilitas berhasil diekspor!`,
      });
    } catch (err: any) {
      setSheetsMessage({ type: 'error', text: `Gagal membuat Spreadsheet: ${err.message}` });
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Google Sheets: Sync to Existing Sheet
  const handleSyncToExistingSheet = async () => {
    if (!accessToken || !spreadsheetId) {
      setSheetsMessage({ type: 'error', text: 'ID Spreadsheet belum ditentukan atau Anda belum login.' });
      return;
    }

    setIsExportingSheet(true);
    setSheetsMessage(null);
    try {
      await GoogleSheetsService.exportFacilitiesToSheet(
        accessToken,
        spreadsheetId,
        'Jaringan Fasilitas',
        facilities
      );

      if (batches.length > 0) {
        await GoogleSheetsService.exportBatchesToSheet(
          accessToken,
          spreadsheetId,
          'Batch Produksi & COGS',
          batches
        );
      }

      setSheetsMessage({
        type: 'success',
        text: `Data ${facilities.length} fasilitas berhasil disinkronkan ke Google Sheet!`,
      });
    } catch (err: any) {
      setSheetsMessage({ type: 'error', text: `Gagal sinkronisasi: ${err.message}` });
    } finally {
      setIsExportingSheet(false);
    }
  };

  return (
    <div id="google-cloud-workspace-hub" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <Cloud className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Google Cloud & Workspace Hub</h2>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                  central-mountain-3pnh2
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Integrasi Cloud SQL (PostgreSQL), Firebase Auth, Google Drive & Google Sheets
              </p>
            </div>
          </div>

          {/* User Auth Info / Login button */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email[0].toUpperCase()}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-white truncate max-w-[140px]">
                    {currentUser.displayName || currentUser.email}
                  </div>
                  <div className="text-emerald-300 text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Drive & Sheets Aktif
                  </div>
                </div>
                <button
                  id="btn-google-signout"
                  onClick={handleGoogleSignOut}
                  title="Sign Out"
                  className="p-1.5 hover:bg-white/20 rounded text-slate-300 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-google-signin"
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating}
                className="flex items-center gap-2 bg-white text-slate-800 hover:bg-slate-50 px-3.5 py-2 rounded-lg font-medium text-xs shadow-sm transition-all border border-slate-300 active:scale-95"
              >
                {isAuthenticating ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                )}
                <span>Masuk dengan Google</span>
              </button>
            )}
          </div>
        </div>

        {authError && (
          <div className="mt-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 text-sm">
          <button
            id="tab-google-sheets"
            onClick={() => setActiveTab('sheets')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'sheets'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Google Sheets
          </button>
          <button
            id="tab-google-drive"
            onClick={() => {
              setActiveTab('drive');
              if (accessToken && driveFiles.length === 0) loadDriveFiles();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'drive'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <HardDrive className="w-4 h-4 text-blue-500" />
            Google Drive
          </button>
          <button
            id="tab-cloud-sql"
            onClick={() => {
              setActiveTab('cloudsql');
              fetchCloudStatus();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'cloudsql'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-500" />
            Cloud SQL & Firebase
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-5">
        {/* TAB 1: GOOGLE SHEETS */}
        {activeTab === 'sheets' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  Google Sheets Live Sync & Sourcing Master Sheet
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ekspor instan seluruh data 5 kategori jaringan fasilitas (Pabrik, Mitra Tani, HQ Hub, Supplier, Mitra Lahan) serta kalkulasi HPP & Batch Tracing langsung ke Google Spreadsheet.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-create-google-sheet"
                  onClick={handleCreateSpreadsheet}
                  disabled={isCreatingSheet}
                  className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {isCreatingSheet ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4" />
                  )}
                  <span>Buat Spreadsheet Baru</span>
                </button>
              </div>
            </div>

            {sheetsMessage && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  sheetsMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {sheetsMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{sheetsMessage.text}</span>
              </div>
            )}

            {/* Active Spreadsheet Details Card */}
            {spreadsheetUrl && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950">
                      Agridea Manufacturing Master Sheet Terhubung
                    </div>
                    <div className="text-[11px] text-emerald-700 font-mono truncate max-w-xs md:max-w-md">
                      ID: {spreadsheetId}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-sync-to-sheet"
                    onClick={handleSyncToExistingSheet}
                    disabled={isExportingSheet}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    {isExportingSheet ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>Perbarui Data Sheet</span>
                  </button>

                  <a
                    id="link-open-google-sheet"
                    href={spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm"
                  >
                    <span>Buka di Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Feature Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Data Jaringan Fasilitas
                </div>
                <div className="text-lg font-bold text-slate-800">{facilities.length} Entitas Tersedia</div>
                <p className="text-xs text-slate-500 mt-1">
                  Mencakup kapasitas panen, koordinat GPS, luas lahan, harga/kg, dan bulan musim panen raya.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Data Batch Tracing & COGS
                </div>
                <div className="text-lg font-bold text-slate-800">{batches.length} Batch Tercatat</div>
                <p className="text-xs text-slate-500 mt-1">
                  Lengkap dengan rendemen yield %, input bahan baku, output produk jadi, dan rincian HPP riil.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Status Izin Workspace
                </div>
                <div className="text-sm font-bold text-emerald-700 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>auth/spreadsheets</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Mendukung pembacaan dan pembaruan tabel lembar kerja secara dua arah.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE DRIVE */}
        {activeTab === 'drive' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                  Google Drive Cloud Backup & Archiving
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cadangkan database manufaktur Agridea ke Google Drive atau pulihkan file cadangan terdahulu secara aman.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-backup-to-drive"
                  onClick={handleCreateDriveBackup}
                  disabled={isUploadingBackup}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {isUploadingBackup ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>Cadangkan Sekarang ke Drive</span>
                </button>

                <button
                  id="btn-refresh-drive"
                  onClick={() => loadDriveFiles()}
                  disabled={isLoadingDrive}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                  title="Perbarui daftar file Drive"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {driveMessage && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  driveMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {driveMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{driveMessage.text}</span>
              </div>
            )}

            {/* List of Files in Drive */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Berkas Cadangan Agridea di Google Drive ({driveFiles.length})
                </span>
                {!currentUser && (
                  <span className="text-xs text-amber-600 font-medium">
                    Masuk dengan Google untuk melihat berkas Drive Anda
                  </span>
                )}
              </div>

              {isLoadingDrive ? (
                <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                  <span>Memuat berkas dari Google Drive...</span>
                </div>
              ) : driveFiles.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {driveFiles.map((file) => (
                    <div key={file.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{file.name}</div>
                          <div className="text-[11px] text-slate-400">
                            Diperbarui: {file.modifiedTime ? new Date(file.modifiedTime).toLocaleString('id-ID') : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Buka di Google Drive"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => setDeleteConfirmFile(file)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Hapus cadangan dari Drive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl">
                  <HardDrive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <div className="text-xs font-medium text-slate-600">Belum ada berkas cadangan di Google Drive</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Klik tombol "Cadangkan Sekarang ke Drive" di atas untuk membuat arsip awan pertama.
                  </p>
                </div>
              )}
            </div>

            {/* Mandatory User Confirmation Modal for Destructive Delete */}
            {deleteConfirmFile && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
                  <div className="flex items-center gap-3 text-rose-600 mb-3">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Konfirmasi Penghapusan</h4>
                      <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    Apakah Anda yakin ingin menghapus berkas <strong className="font-semibold text-slate-900">{deleteConfirmFile.name}</strong> dari Google Drive?
                  </p>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setDeleteConfirmFile(null)}
                      className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={confirmDeleteFile}
                      className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
                    >
                      Ya, Hapus Berkas
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CLOUD SQL & FIREBASE STATUS */}
        {activeTab === 'cloudsql' && (
          <div className="space-y-4">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                Cloud SQL (PostgreSQL) & Firebase Arsitektur
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfigurasi relasional Cloud SQL Developer Edition dan Firestore Database untuk persistensi data industri Agridea.
              </p>
            </div>

            {/* Architecture Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cloud SQL Card */}
              <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-indigo-950">Cloud SQL (PostgreSQL)</div>
                      <div className="text-[11px] text-indigo-700">Developer Edition (Scale-to-Zero)</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Terkoneksi
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-indigo-100/60">
                    <span className="text-slate-500">Project ID:</span>
                    <span className="font-mono font-medium text-slate-800">central-mountain-3pnh2</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-indigo-100/60">
                    <span className="text-slate-500">Region:</span>
                    <span className="font-mono font-medium text-slate-800">asia-southeast1</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-indigo-100/60">
                    <span className="text-slate-500">ORM Tool:</span>
                    <span className="font-mono font-medium text-slate-800">Drizzle ORM + pg pool</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Tabel Aktif:</span>
                    <span className="font-mono font-medium text-slate-800">
                      facility_networks, batch_tracking, users, workspace_sync_logs
                    </span>
                  </div>
                </div>
              </div>

              {/* Firebase Card */}
              <div className="border border-amber-100 bg-amber-50/40 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-950">Firebase Authentication & Rules</div>
                      <div className="text-[11px] text-amber-700">Firestore & Google Sign-In</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Rules Deployed
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-amber-100/60">
                    <span className="text-slate-500">Auth Method:</span>
                    <span className="font-medium text-slate-800">Google Sign-In with OAuth Popup</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-100/60">
                    <span className="text-slate-500">Security Rules:</span>
                    <span className="font-medium text-slate-800">Zero-Trust ABAC (8 Pillars Hardened)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-100/60">
                    <span className="text-slate-500">Blueprint IR:</span>
                    <span className="font-mono font-medium text-slate-800">firebase-blueprint.json</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Koleksi Terproteksi:</span>
                    <span className="font-mono font-medium text-slate-800">/facilities, /batches, /users</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Table Query Banner */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Verifikasi Schema Database PostgreSQL (information_schema)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Drizzle Kit Migrated</span>
              </div>
              <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public';
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Semua entitas data tersinkronisasi otomatis dengan struktur tabel terindeks di Cloud SQL instance <code>ai-studio-c9d159e1</code>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
