/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Sliders,
  Factory,
  Database,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Wrench,
  FileText,
  Shield,
  LogIn,
  UserPlus,
  ShieldCheck,
  ClipboardList,
  Truck,
  PackageCheck,
  Award,
  FileSpreadsheet,
  Box,
  Layers,
  FlaskConical,
  CheckCircle,
  Plus,
  Calendar,
  Sparkles,
  Cloud,
  Compass,
  Brain,
  Smartphone,
  Wallet,
  BookOpen,
  Grid,
  AlertTriangle,
  History,
  type LucideIcon,
} from 'lucide-react';

/**
 * Universal administrative roles that have unrestricted access to all modules.
 */
export const UNIVERSAL_ADMIN_ROLES = [
  'Super Admin',
  'Kepala Pabrik HQ',
  'Direktur HQ',
  'Director',
] as const;

export interface MenuItem {
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
  /**
   * If true, accessible by any authenticated user regardless of group or role restrictions.
   */
  isPublic?: boolean;
  /**
   * Specific role whitelist for this menu item.
   * If not specified, access defaults to the user's role group permissions in rolePermissions.
   */
  allowedRoles?: string[];
}

export interface MenuGroup {
  key: string;
  label: string;
  /**
   * Array of group keys matched by this section (e.g. ['payroll', 'finance']).
   * Defaults to [key] if not provided.
   */
  matchGroups?: string[];
  /**
   * Optional role whitelist for the whole section (e.g. Administration).
   */
  allowedRoles?: string[];
}

/**
 * Ordered sidebar group configuration.
 */
export const SIDEBAR_GROUPS: MenuGroup[] = [
  { key: 'dashboard', label: '1. Dashboard & Analisis' },
  { key: 'executive', label: '1B. EXECUTIVE INTELLIGENT' },
  { key: 'akun', label: '2. Akun & Cabang' },
  { key: 'master', label: '3. Master Data' },
  { key: 'pengadaan', label: '4. Pengadaan' },
  { key: 'produksi', label: '5. Produksi Inti' },
  { key: 'planning', label: '5b. Planning Intel' },
  { key: 'inventory', label: '6. Inventory Tracker' },
  { key: 'cogs', label: '7. COGS / HPP' },
  { key: 'sales', label: '8. Sales & Tracing' },
  { key: 'payroll', label: '9. Payroll & Keuangan', matchGroups: ['payroll', 'finance'] },
  { key: 'quality', label: '10. Compliance & Servis', matchGroups: ['quality', 'maintenance'] },
  {
    key: 'administration',
    label: 'Administration',
    matchGroups: ['administration'],
    allowedRoles: ['Super Admin', 'Finance HQ', 'Finance'],
  },
];

/**
 * Unified constant array for all permitted menu items mapped to roles.
 */
export const SIDEBAR_ITEMS: MenuItem[] = [
  // ----------------------------------------------------
  // 1. Dashboard & Analisis
  // ----------------------------------------------------
  { id: 'dashboard-utama', label: 'Dashboard Utama', group: 'dashboard', icon: Sliders },
  { id: 'dashboard-produksi', label: 'Dashboard Produksi', group: 'dashboard', icon: Factory },
  { id: 'dashboard-inventory', label: 'Dashboard Inventory', group: 'dashboard', icon: Database },
  { id: 'dashboard-sales', label: 'Dashboard Sales', group: 'dashboard', icon: TrendingUp },
  { id: 'dashboard-payroll', label: 'Dashboard Payroll', group: 'dashboard', icon: Users },
  { id: 'dashboard-cogs', label: 'Dashboard COGS & HPP', group: 'dashboard', icon: DollarSign },
  { id: 'dashboard-hq', label: 'Dashboard HQ (Multi-Branch)', group: 'dashboard', icon: Sliders },
  {
    id: 'dashboard-budget-actual',
    label: 'Budget vs Actual',
    group: 'dashboard',
    icon: DollarSign,
    allowedRoles: [
      'Super Admin', 'Kepala Pabrik HQ', 'Direktur HQ', 'Director',
      'HQ Production', 'HQ Production Manager', 'Branch Manager', 'Kepala Pabrik Cabang', 'Finance HQ', 'Finance'
    ]
  },
  {
    id: 'dashboard-yield-loss',
    label: 'Yield Loss Analysis',
    group: 'dashboard',
    icon: Activity,
    allowedRoles: [
      'Super Admin', 'Kepala Pabrik HQ', 'Direktur HQ', 'Director',
      'HQ Production', 'Branch Manager', 'Kepala Pabrik Cabang'
    ]
  },
  {
    id: 'dashboard-machine-utilization',
    label: 'Machine Utilization',
    group: 'dashboard',
    icon: Wrench,
    allowedRoles: [
      'Super Admin', 'Kepala Pabrik HQ', 'Direktur HQ', 'Director',
      'HQ Production', 'Branch Manager', 'Kepala Pabrik Cabang'
    ]
  },
  {
    id: 'dashboard-profitability',
    label: 'Profitability Analysis',
    group: 'dashboard',
    icon: TrendingUp,
    allowedRoles: [
      'Super Admin', 'Kepala Pabrik HQ', 'Direktur HQ', 'Director',
      'HQ Production', 'HQ Production Manager', 'Branch Manager', 'Kepala Pabrik Cabang', 'Finance HQ', 'Finance'
    ]
  },
  {
    id: 'management-meeting-pack',
    label: 'Management Meeting Pack',
    group: 'dashboard',
    icon: FileText,
    allowedRoles: [
      'Super Admin', 'Kepala Pabrik HQ', 'Direktur HQ', 'Director',
      'HQ Management', 'HQ Admin', 'Branch Manager', 'Kepala Pabrik Cabang', 'Factory Manager',
      'Finance', 'Finance HQ', 'HQ Procurement', 'HR & Procurement', 'HR & Procurement Manager',
      'HQ Production', 'HQ Production Manager'
    ]
  },
  {
    id: 'dashboard-risk',
    label: 'Supply Chain Risk Dashboard',
    group: 'dashboard',
    icon: Shield,
    allowedRoles: [
      'Super Admin', 'Kepala Pabrik HQ', 'Direktur HQ', 'Director',
      'HQ Production', 'HQ Production Manager', 'HQ Management', 'HQ Admin',
      'Branch Manager', 'Kepala Pabrik Cabang'
    ]
  },

  // ----------------------------------------------------
  // 1B. EXECUTIVE INTELLIGENT
  // ----------------------------------------------------
  { id: 'gemini-copilot', label: '🤖 Gemini AI Chatbot & Grounding', group: 'executive', icon: Sparkles, isPublic: true },
  { id: 'google-cloud-hub', label: '☁️ Google Cloud, Drive & Sheets Hub', group: 'executive', icon: Cloud, isPublic: true },
  { id: 'maps-network', label: '🗺️ Google Maps Facility Network', group: 'executive', icon: Compass, isPublic: true },
  { id: 'harvest-radar', label: '🌾 Rekomendasi Panen AI (Radius 150km)', group: 'executive', icon: Sparkles, isPublic: true },
  {
    id: 'executive-control-tower',
    label: 'AI Control Tower',
    group: 'executive',
    icon: Activity,
    allowedRoles: [
      'Super Admin', 'Kepala Pabrik HQ', 'Direktur HQ', 'Director',
      'HQ Management', 'HQ Admin', 'Branch Manager', 'Kepala Pabrik Cabang'
    ]
  },
  {
    id: 'executive-advisor',
    label: 'AI Executive Advisor',
    group: 'executive',
    icon: Brain,
    allowedRoles: [
      'Super Admin', 'Kepala Pabrik HQ', 'Direktur HQ', 'Director',
      'HQ Management', 'HQ Admin', 'Branch Manager', 'Kepala Pabrik Cabang'
    ]
  },
  { id: 'agridea-mobile', label: '📱 Mobile Platform (All Roles)', group: 'executive', icon: Smartphone, isPublic: true },

  // ----------------------------------------------------
  // 2. Akun & Cabang
  // ----------------------------------------------------
  { id: 'session', label: 'Sign In / Session (Role)', group: 'akun', icon: LogIn, isPublic: true },
  { id: 'signup', label: 'Sign Up / Approval', group: 'akun', icon: UserPlus, isPublic: true },
  { id: 'users-list', label: 'Daftar Akun Pengguna', group: 'akun', icon: Users },
  { id: 'roles', label: 'Role & Permission Matrix', group: 'akun', icon: ShieldCheck },
  { id: 'audit', label: 'Session & Activity Log', group: 'akun', icon: ClipboardList },

  // ----------------------------------------------------
  // 3. Master Data
  // ----------------------------------------------------
  { id: 'master-karyawan', label: 'Karyawan / Personel', group: 'master', icon: Users },
  { id: 'master-supplier', label: 'Mitra Supplier', group: 'master', icon: Truck },
  { id: 'master-customer', label: 'Toko / Customer', group: 'master', icon: PackageCheck },
  { id: 'master-fruit-variants', label: 'Master Fruit Variants', group: 'master', icon: Award },
  { id: 'master-chip-variants', label: 'Master Chip Variants', group: 'master', icon: Database },
  { id: 'master-sku', label: 'Produk / SKU & BOM', group: 'master', icon: Database },
  { id: 'master-bom', label: 'Bill of Material (BOM)', group: 'master', icon: FileSpreadsheet },
  { id: 'recipe-yield-standard', label: 'Recipe & Yield Standards', group: 'master', icon: FileText },
  { id: 'production-routing', label: 'Production Routing', group: 'master', icon: Sliders },
  { id: 'master-packaging', label: 'Packaging Master', group: 'master', icon: Box },
  { id: 'master-supporting', label: 'Supporting Materials', group: 'master', icon: Layers },
  { id: 'master-chemicals', label: 'Chemicals & Consumables', group: 'master', icon: FlaskConical },
  { id: 'master-mesin', label: 'Mesin Vacuum Frying', group: 'master', icon: Wrench },
  { id: 'master-lokasi', label: 'Master Factory Locations', group: 'master', icon: Factory },

  // ----------------------------------------------------
  // 4. Pengadaan & Supplier
  // ----------------------------------------------------
  { id: 'pengadaan-po', label: 'Purchase Order / Pesanan', group: 'pengadaan', icon: Truck },
  { id: 'pengadaan-penerimaan', label: 'Penerimaan Bahan Baku', group: 'pengadaan', icon: CheckCircle },
  {
    id: 'supplier-scorecard',
    label: 'Supplier Performance Scorecard',
    group: 'pengadaan',
    icon: Award,
    allowedRoles: [
      'Super Admin', 'Kepala Pabrik HQ', 'Direktur HQ', 'Director',
      'HQ Procurement', 'Branch Manager', 'Kepala Pabrik Cabang', 'Factory Manager',
      'HR & Procurement', 'HR & Procurement Manager', 'Purchasing', 'HQ Admin'
    ]
  },

  // ----------------------------------------------------
  // 5. Produksi Inti
  // ----------------------------------------------------
  { id: 'input-produksi', label: 'Input Form Produksi', group: 'produksi', icon: Plus },
  { id: 'production-approvals', label: 'Approval Produksi (Persetujuan)', group: 'produksi', icon: CheckCircle },
  { id: 'batch-history', label: 'History Batch Produksi', group: 'produksi', icon: ClipboardList },
  {
    id: 'production-planning',
    label: 'Rencana Produksi & Performance',
    group: 'produksi',
    icon: Calendar,
    allowedRoles: [
      'Super Admin', 'Kepala Pabrik HQ', 'Direktur HQ', 'Director',
      'HQ Production', 'HQ Production Manager', 'HQ Management', 'HQ Admin',
      'Branch Manager', 'Kepala Pabrik Cabang',
      'Production Supervisor', 'Supervisor Produksi', 'Kepala Produksi',
      'PPIC', 'Planner', 'Production Planner', 'Staff Produksi', 'Operator', 'Operator Mesin',
      'Finance', 'Finance HQ', 'Admin', 'Kupas', 'Frying', 'Kemas', 'Quality Control', 'QC'
    ]
  },
  { id: 'production-scheduling', label: 'Production Scheduling', group: 'produksi', icon: Calendar },
  {
    id: 'compliance-service',
    label: 'Compliance & Service Hub',
    group: 'produksi',
    icon: ShieldCheck,
    allowedRoles: [
      'Super Admin', 'Kepala Pabrik HQ', 'Direktur HQ', 'Director',
      'HQ Production', 'HQ Production Manager', 'Branch Manager', 'Kepala Pabrik Cabang',
      'Production Supervisor', 'Quality Control', 'QC', 'Operator', 'Operator Mesin', 'Kupas', 'Frying', 'Kemas'
    ]
  },
  {
    id: 'attendance-management',
    label: 'Attendance & Geo-Fencing',
    group: 'produksi',
    icon: Users,
    allowedRoles: [
      'Super Admin', 'Kepala Pabrik HQ', 'Direktur HQ', 'Director',
      'HQ Production', 'HQ Production Manager', 'Branch Manager', 'Kepala Pabrik Cabang',
      'Production Supervisor', 'HR & Procurement', 'HR & Procurement Manager', 'Finance HQ', 'Finance'
    ]
  },

  // ----------------------------------------------------
  // 5b. Planning Intel
  // ----------------------------------------------------
  { id: 'planning-demand', label: 'Demand Planning', group: 'planning', icon: TrendingUp },
  { id: 'planning-mrp', label: 'Material Requirement (MRP)', group: 'planning', icon: Sliders },
  { id: 'planning-capacity', label: 'Capacity & Bottleneck Planning', group: 'planning', icon: Activity },

  // ----------------------------------------------------
  // 6. Inventory Tracker
  // ----------------------------------------------------
  { id: 'inventory-stock', label: 'Real-time Stock Tracker', group: 'inventory', icon: Database },
  { id: 'inventory-opname', label: 'Stock Opname & Adjs', group: 'inventory', icon: Sliders },
  { id: 'inventory-transfer', label: 'Inter Factory Transfer', group: 'inventory', icon: Truck },

  // ----------------------------------------------------
  // 7. COGS / HPP
  // ----------------------------------------------------
  { id: 'cogs-component', label: 'COGS Standar vs Batch', group: 'cogs', icon: DollarSign },
  { id: 'cogs-simulation', label: 'Simulasi Margin & Harga', group: 'cogs', icon: Sliders },

  // ----------------------------------------------------
  // 8. Sales & Tracing
  // ----------------------------------------------------
  { id: 'sales-penjualan', label: 'Input Penjualan Toko', group: 'sales', icon: Plus },
  { id: 'sales-suratjalan', label: 'Surat Jalan Digital', group: 'sales', icon: Truck },
  { id: 'sales-batch-trace', label: 'Batches End-to-End Trace', group: 'sales', icon: ClipboardList },

  // ----------------------------------------------------
  // 9. Payroll & Keuangan (Group: payroll & finance)
  // ----------------------------------------------------
  { id: 'payroll-kalkulasi', label: 'Kalkulasi Gaji Borongan', group: 'payroll', icon: Users },
  { id: 'payroll-slips', label: 'Download Slip Gaji', group: 'payroll', icon: ClipboardList },

  {
    id: 'finance-cashbook',
    label: 'Petty Cash Management (Kas)',
    group: 'finance',
    icon: DollarSign,
    allowedRoles: [
      'Super Admin', 'Kepala Pabrik HQ', 'Direktur HQ', 'Director',
      'HQ Production', 'HQ Production Manager', 'Branch Manager', 'Kepala Pabrik Cabang',
      'Finance HQ', 'Finance', 'Admin', 'Factory Manager', 'Kepala Pabrik'
    ]
  },
  { id: 'finance-cashbank', label: 'Cash & Bank Management', group: 'finance', icon: Wallet },
  { id: 'finance-ap', label: 'Accounts Payable (Hutang)', group: 'finance', icon: FileSpreadsheet, isPublic: true },
  { id: 'finance-ar', label: 'Accounts Receivable (Piutang)', group: 'finance', icon: TrendingUp, isPublic: true },
  { id: 'finance-cashflow', label: 'Cash Flow & Finance HQ', group: 'finance', icon: Sliders },
  { id: 'finance-accounting', label: 'Full Accounting Ledger', group: 'finance', icon: BookOpen },
  { id: 'finance-budgeting', label: 'Multi-Factory Budgeting', group: 'finance', icon: Sliders },
  { id: 'finance-workingcapital', label: 'Working Capital & KPIs', group: 'finance', icon: Activity },
  { id: 'finance-consolidated', label: 'Consolidated Reporting', group: 'finance', icon: Grid },
  {
    id: 'finance-opening-balance-wizard',
    label: 'Opening Balance Wizard',
    group: 'finance',
    icon: Sliders,
    allowedRoles: ['Super Admin', 'Finance HQ', 'Director']
  },
  {
    id: 'finance-reconciliation',
    label: 'Migration Reconciliation',
    group: 'finance',
    icon: Activity,
    allowedRoles: ['Super Admin', 'Finance HQ', 'Director']
  },
  {
    id: 'finance-opening-adjustment',
    label: 'Opening Balance Adjustment',
    group: 'finance',
    icon: FileSpreadsheet,
    allowedRoles: ['Super Admin', 'Finance HQ', 'Director']
  },

  // ----------------------------------------------------
  // 10. Compliance & Servis (Group: quality & maintenance)
  // ----------------------------------------------------
  { id: 'quality-compliance', label: 'Quality & Food Safety Audits', group: 'quality', icon: ShieldCheck },
  { id: 'quality-traceability', label: 'Full Batch Traceability', group: 'quality', icon: ClipboardList },
  {
    id: 'quality-recall',
    label: 'Product Recall Management',
    group: 'quality',
    icon: AlertTriangle,
    allowedRoles: [
      'Super Admin', 'Kepala Pabrik HQ', 'Direktur HQ', 'Director',
      'HQ Management', 'Branch Manager', 'Kepala Pabrik Cabang', 'Quality Control', 'QC'
    ]
  },
  { id: 'quality-haccp', label: 'HACCP Digital Monitor', group: 'quality', icon: ShieldCheck },
  { id: 'maintenance-sched', label: 'Jadwal & Biaya Maintenance', group: 'maintenance', icon: Wrench },

  // ----------------------------------------------------
  // Administration
  // ----------------------------------------------------
  {
    id: 'opening-balance-setup',
    label: 'Opening Balance Setup',
    group: 'administration',
    icon: Sliders,
    allowedRoles: ['Super Admin', 'Finance HQ', 'Finance']
  },
  {
    id: 'transaction-revisions',
    label: 'Transaction Revisions Log',
    group: 'administration',
    icon: History,
    allowedRoles: ['Super Admin', 'Finance HQ', 'Finance']
  },
];

/**
 * Validates whether a specific user role has permission to access a menu item.
 *
 * @param role The current user's role
 * @param menuId The target menu identifier
 * @param rolePermissions Optional dynamic group-level permissions dictionary
 * @returns boolean whether access is granted
 */
export function checkMenuAllowed(
  role: string,
  menuId: string,
  rolePermissions?: Record<string, string[]>
): boolean {
  // 1. Universal executive & administrative overrides
  if ((UNIVERSAL_ADMIN_ROLES as readonly string[]).includes(role)) {
    return true;
  }

  // 2. Find the menu definition
  const item = SIDEBAR_ITEMS.find((i) => i.id === menuId);

  // Non-sidebar / internal subviews are always accessible
  if (!item) {
    return true;
  }

  // 3. Explicitly public items
  if (item.isPublic) {
    return true;
  }

  // 4. Role whitelist specified on the item
  if (item.allowedRoles && item.allowedRoles.length > 0) {
    return item.allowedRoles.includes(role);
  }

  // 5. Account management items are accessible to all authenticated users
  if (item.group === 'akun') {
    return true;
  }

  // 6. Dynamic group permissions check
  if (rolePermissions) {
    const allowedGroups = rolePermissions[role] || ['dashboard'];
    return allowedGroups.includes(item.group);
  }

  return true;
}
