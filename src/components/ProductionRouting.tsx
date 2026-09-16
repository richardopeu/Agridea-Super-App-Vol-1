import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Award,
  ChevronRight,
  Database,
  Clock,
  Briefcase,
  Play,
  RotateCcw,
  Check,
  UserCheck,
  Activity,
  FileText,
  Search,
  Filter,
  Plus,
  Trash2,
  Cpu,
  Info,
  Calendar,
  Settings,
  DollarSign,
  Users,
  Percent,
  CheckCircle,
  XCircle,
  Wrench,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Data Interfaces
export interface RoutingStep {
  id: string;
  sequence: number;
  processName: 'Receiving' | 'Peeling' | 'Frozen' | 'Vacuum Frying' | 'QC Grading' | 'Packaging' | 'Warehouse' | string;
  department: string;
  requiredMachine: string;
  requiredEmployeeRole: string;
  standardCycleTime: number; // raw value
  timeUnit: 'Minutes/Ton' | 'Minutes/Kg' | 'Hours' | 'Minutes/Cycle' | 'Packs/Hour' | string;
  setupTimeMinutes: number;
  cleaningTimeMinutes: number;
  waitingTimeMinutes: number;
  notes?: string;

  // Resource Quantities
  machineQty: number;
  operatorQty: number;
  supervisorQty: number;
  qcQty: number;
  packagingStaffQty: number;

  // Vacuum Frying Cycle Details (only if vacuum frying)
  frozenCapacityPerCycleKg?: number;
  oilConsumptionPerCycleLiter?: number;
  gasConsumptionPerCycleKg?: number;
}

export interface RoutingHeader {
  id: string; // e.g. RC-01
  routingName: string;
  fruitVariantId: string;
  factory: string; // MPD, SSP, JKT, All
  version: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Archived';
  effectiveDate: string;
  expiryDate: string;
  notes?: string;
  steps: RoutingStep[];
  approvalStage: 'Creator' | 'Production Manager' | 'HQ Production' | 'Director' | 'Approved';
  approver?: string;
  approvalDate?: string;
  approvalNotes?: string;
}

export interface ScheduleItem {
  id: string;
  routingId: string;
  batchCode: string;
  fruitVariantId: string;
  targetOutputKg: number;
  startTime: string;
  endTime: string;
  durationHours: number;
  factory: string;
  machineId: string;
  assignedOperators: string[];
  status: 'Scheduled' | 'Running' | 'Completed' | 'Delayed';
}

interface MachineState {
  id: string;
  name: string;
  factory: string;
  operatingTimeMins: number;
  idleTimeMins: number;
  cleaningTimeMins: number;
  downtimeMins: number;
  maintenanceTimeMins: number;
  totalQcDefectsKg: number;
}

interface Props {
  state: {
    produk: any[];
    fruitVariants: any[];
    chipVariants: any[];
    packagingMaster: any[];
    supportingMaster: any[];
    chemicalsMaster: any[];
    stocks: any[];
  };
  logActivity: (module: string, desc: string, detail?: any) => void;
  currentUser: {
    role: string;
    namaLengkap: string;
    username: string;
  };
  initialTab?: 'dashboard' | 'routing-master' | 'scheduling' | 'capacity' | 'productivity' | 'costing' | 'oee-metrics';
}

export default function ProductionRouting({ state, logActivity, currentUser, initialTab }: Props) {
  // Tabs: 'dashboard' | 'routing-master' | 'scheduling' | 'capacity' | 'productivity' | 'costing' | 'oee-metrics'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'routing-master' | 'scheduling' | 'capacity' | 'productivity' | 'costing' | 'oee-metrics'>(initialTab || 'dashboard');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load Seed Routing & Standards
  const [routings, setRoutings] = useState<RoutingHeader[]>(() => {
    const localData = localStorage.getItem('agridea_production_routings');
    if (localData) {
      try {
        return JSON.parse(localData);
      } catch (e) {
        console.error("Failed to parse production routings", e);
      }
    }

    // Default pre-seeded standard routings
    const defaults: RoutingHeader[] = [
      {
        id: 'RC-01',
        routingName: 'Pineapple Frying Standard Route v1',
        fruitVariantId: 'FV-01', // Pineapple
        factory: 'All',
        version: '1.0',
        status: 'Approved',
        effectiveDate: '2026-06-01',
        expiryDate: '2027-06-01',
        notes: 'Official high-efficiency processing route for pineapple rings',
        approvalStage: 'Approved',
        approver: 'Jefri Sirait (Director)',
        approvalDate: '2026-06-01',
        approvalNotes: 'Validated against standard thermodynamic cycle limits.',
        steps: [
          {
            id: 'RC-01-S1',
            sequence: 1,
            processName: 'Receiving',
            department: 'Inbound Logistics',
            requiredMachine: 'None (Gravity Scale)',
            requiredEmployeeRole: 'Warehouse Operator',
            standardCycleTime: 30,
            timeUnit: 'Minutes/Ton',
            setupTimeMinutes: 10,
            cleaningTimeMinutes: 15,
            waitingTimeMinutes: 5,
            notes: 'Unloading & quality grading',
            machineQty: 0,
            operatorQty: 2,
            supervisorQty: 1,
            qcQty: 1,
            packagingStaffQty: 0
          },
          {
            id: 'RC-01-S2',
            sequence: 2,
            processName: 'Peeling',
            department: 'Preparation Shop',
            requiredMachine: 'Automated Pineapple Skinner P100',
            requiredEmployeeRole: 'Preparation Specialist',
            standardCycleTime: 0.8, // 0.8 Minutes/Kg
            timeUnit: 'Minutes/Kg',
            setupTimeMinutes: 15,
            cleaningTimeMinutes: 20,
            waitingTimeMinutes: 10,
            notes: 'Skin peeling & crown extracting',
            machineQty: 1,
            operatorQty: 4,
            supervisorQty: 1,
            qcQty: 1,
            packagingStaffQty: 0
          },
          {
            id: 'RC-01-S3',
            sequence: 3,
            processName: 'Frozen',
            department: 'Blast Freezer Chamber',
            requiredMachine: 'IQF Blast Tunnel Freezer F-21',
            requiredEmployeeRole: 'Freezer Technician',
            standardCycleTime: 18, // Hours
            timeUnit: 'Hours',
            setupTimeMinutes: 30,
            cleaningTimeMinutes: 60,
            waitingTimeMinutes: 0,
            notes: 'Crystallization drop temperature to -22C',
            machineQty: 1,
            operatorQty: 1,
            supervisorQty: 1,
            qcQty: 1,
            packagingStaffQty: 0
          },
          {
            id: 'RC-01-S4',
            sequence: 4,
            processName: 'Vacuum Frying',
            department: 'Frying Hub',
            requiredMachine: 'Vacuum Fryer V-300 Heavy',
            requiredEmployeeRole: 'Frying Operator',
            standardCycleTime: 90, // Minutes/Cycle
            timeUnit: 'Minutes/Cycle',
            setupTimeMinutes: 30,
            cleaningTimeMinutes: 45,
            waitingTimeMinutes: 15,
            notes: 'Vacuum heat extraction cycle',
            machineQty: 1,
            operatorQty: 2,
            supervisorQty: 1,
            qcQty: 1,
            packagingStaffQty: 0,
            frozenCapacityPerCycleKg: 300,
            oilConsumptionPerCycleLiter: 45,
            gasConsumptionPerCycleKg: 54
          },
          {
            id: 'RC-01-S5',
            sequence: 5,
            processName: 'QC Grading',
            department: 'Quality Assurance Lab',
            requiredMachine: 'Optical Chip Sorter S22',
            requiredEmployeeRole: 'QC Technician',
            standardCycleTime: 5, // Minutes/Kg
            timeUnit: 'Minutes/Kg',
            setupTimeMinutes: 10,
            cleaningTimeMinutes: 15,
            waitingTimeMinutes: 0,
            notes: 'Residual moisture & thickness check',
            machineQty: 1,
            operatorQty: 1,
            supervisorQty: 1,
            qcQty: 2,
            packagingStaffQty: 0
          },
          {
            id: 'RC-01-S6',
            sequence: 6,
            processName: 'Packaging',
            department: 'Packaging Shop',
            requiredMachine: 'Multi-head Weigher Pouch Filler K50',
            requiredEmployeeRole: 'Packaging Assistant',
            standardCycleTime: 1000, // Packs/Hour
            timeUnit: 'Packs/Hour',
            setupTimeMinutes: 20,
            cleaningTimeMinutes: 30,
            waitingTimeMinutes: 10,
            notes: 'Nitrogen gas flushing & sealing',
            machineQty: 1,
            operatorQty: 1,
            supervisorQty: 1,
            qcQty: 1,
            packagingStaffQty: 3
          }
        ]
      },
      {
        id: 'RC-02',
        routingName: 'Jackfruit Heavy Frying Route v2',
        fruitVariantId: 'FV-02', // Jackfruit
        factory: 'MPD',
        version: '2.0',
        status: 'Approved',
        effectiveDate: '2026-06-01',
        expiryDate: '2027-06-01',
        notes: 'Requires manual rag extraction sequence',
        approvalStage: 'Approved',
        approver: 'Richardo Utoyo',
        approvalDate: '2026-06-03',
        steps: [
          {
            id: 'RC-02-S1',
            sequence: 1,
            processName: 'Receiving',
            department: 'Inbound Logistics',
            requiredMachine: 'None',
            requiredEmployeeRole: 'Warehouse Operator',
            standardCycleTime: 30,
            timeUnit: 'Minutes/Ton',
            setupTimeMinutes: 10,
            cleaningTimeMinutes: 15,
            waitingTimeMinutes: 5,
            machineQty: 0,
            operatorQty: 2,
            supervisorQty: 1,
            qcQty: 1,
            packagingStaffQty: 0
          },
          {
            id: 'RC-02-S2',
            sequence: 2,
            processName: 'Peeling',
            department: 'Preparation Shop',
            requiredMachine: 'Washing Sieve Conveyor C1',
            requiredEmployeeRole: 'Preparation Specialist',
            standardCycleTime: 0.8,
            timeUnit: 'Minutes/Kg',
            setupTimeMinutes: 15,
            cleaningTimeMinutes: 20,
            waitingTimeMinutes: 10,
            machineQty: 0,
            operatorQty: 6, // more people for manual separating seed
            supervisorQty: 1,
            qcQty: 1,
            packagingStaffQty: 0
          },
          {
            id: 'RC-02-S3',
            sequence: 3,
            processName: 'Frozen',
            department: 'Blast Freezer Chamber',
            requiredMachine: 'IQF Blast Tunnel Freezer F-21',
            requiredEmployeeRole: 'Freezer Technician',
            standardCycleTime: 24, // 24 Hours
            timeUnit: 'Hours',
            setupTimeMinutes: 30,
            cleaningTimeMinutes: 60,
            waitingTimeMinutes: 0,
            machineQty: 1,
            operatorQty: 1,
            supervisorQty: 1,
            qcQty: 1,
            packagingStaffQty: 0
          },
          {
            id: 'RC-02-S4',
            sequence: 4,
            processName: 'Vacuum Frying',
            department: 'Frying Hub',
            requiredMachine: 'Vacuum Fryer V-300 Heavy',
            requiredEmployeeRole: 'Frying Operator',
            standardCycleTime: 120, // 120 Minutes/Cycle
            timeUnit: 'Minutes/Cycle',
            setupTimeMinutes: 30,
            cleaningTimeMinutes: 45,
            waitingTimeMinutes: 15,
            machineQty: 1,
            operatorQty: 2,
            supervisorQty: 1,
            qcQty: 1,
            packagingStaffQty: 0,
            frozenCapacityPerCycleKg: 250,
            oilConsumptionPerCycleLiter: 50,
            gasConsumptionPerCycleKg: 60
          },
          {
            id: 'RC-02-S5',
            sequence: 5,
            processName: 'QC Grading',
            department: 'Quality Assurance Lab',
            requiredMachine: 'None',
            requiredEmployeeRole: 'QC Technician',
            standardCycleTime: 5,
            timeUnit: 'Minutes/Kg',
            setupTimeMinutes: 10,
            cleaningTimeMinutes: 15,
            waitingTimeMinutes: 0,
            machineQty: 0,
            operatorQty: 1,
            supervisorQty: 1,
            qcQty: 2,
            packagingStaffQty: 0
          },
          {
            id: 'RC-02-S6',
            sequence: 6,
            processName: 'Packaging',
            department: 'Packaging Shop',
            requiredMachine: 'Multi-head Weigher Pouch Filler K50',
            requiredEmployeeRole: 'Packaging Assistant',
            standardCycleTime: 1000,
            timeUnit: 'Packs/Hour',
            setupTimeMinutes: 20,
            cleaningTimeMinutes: 30,
            waitingTimeMinutes: 10,
            machineQty: 1,
            operatorQty: 1,
            supervisorQty: 1,
            qcQty: 1,
            packagingStaffQty: 3
          }
        ]
      },
      {
        id: 'RC-03',
        routingName: 'Salak Pondoh Fast Frying Route',
        fruitVariantId: 'FV-03', // Salak
        factory: 'All',
        version: '1.0',
        status: 'Approved',
        effectiveDate: '2026-06-01',
        expiryDate: '2027-06-01',
        notes: 'Low temperature crisp control routing',
        approvalStage: 'Approved',
        approver: 'Afi',
        approvalDate: '2026-06-03',
        steps: [
          {
            id: 'RC-03-S1',
            sequence: 1,
            processName: 'Receiving',
            department: 'Inbound Logistics',
            requiredMachine: 'None',
            requiredEmployeeRole: 'Warehouse Operator',
            standardCycleTime: 30,
            timeUnit: 'Minutes/Ton',
            setupTimeMinutes: 10,
            cleaningTimeMinutes: 15,
            waitingTimeMinutes: 5,
            machineQty: 0,
            operatorQty: 2,
            supervisorQty: 1,
            qcQty: 1,
            packagingStaffQty: 0
          },
          {
            id: 'RC-03-S2',
            sequence: 2,
            processName: 'Peeling',
            department: 'Preparation Shop',
            requiredMachine: 'Skin Scrapers S44',
            requiredEmployeeRole: 'Preparation Specialist',
            standardCycleTime: 0.8,
            timeUnit: 'Minutes/Kg',
            setupTimeMinutes: 15,
            cleaningTimeMinutes: 20,
            waitingTimeMinutes: 10,
            machineQty: 1,
            operatorQty: 4,
            supervisorQty: 1,
            qcQty: 1,
            packagingStaffQty: 0
          },
          {
            id: 'RC-03-S3',
            sequence: 3,
            processName: 'Frozen',
            department: 'Blast Freezer Chamber',
            requiredMachine: 'IQF Blast Tunnel Freezer F-21',
            requiredEmployeeRole: 'Freezer Technician',
            standardCycleTime: 36, // 36 Hours
            timeUnit: 'Hours',
            setupTimeMinutes: 30,
            cleaningTimeMinutes: 60,
            waitingTimeMinutes: 0,
            machineQty: 1,
            operatorQty: 1,
            supervisorQty: 1,
            qcQty: 1,
            packagingStaffQty: 0
          },
          {
            id: 'RC-03-S4',
            sequence: 4,
            processName: 'Vacuum Frying',
            department: 'Frying Hub',
            requiredMachine: 'Vacuum Fryer V-300 Heavy',
            requiredEmployeeRole: 'Frying Operator',
            standardCycleTime: 150, // 150 Minutes/Cycle
            timeUnit: 'Minutes/Cycle',
            setupTimeMinutes: 30,
            cleaningTimeMinutes: 45,
            waitingTimeMinutes: 15,
            machineQty: 1,
            operatorQty: 2,
            supervisorQty: 1,
            qcQty: 1,
            packagingStaffQty: 0,
            frozenCapacityPerCycleKg: 200,
            oilConsumptionPerCycleLiter: 40,
            gasConsumptionPerCycleKg: 48
          },
          {
            id: 'RC-03-S5',
            sequence: 5,
            processName: 'QC Grading',
            department: 'Quality Assurance Lab',
            requiredMachine: 'None',
            requiredEmployeeRole: 'QC Technician',
            standardCycleTime: 5,
            timeUnit: 'Minutes/Kg',
            setupTimeMinutes: 10,
            cleaningTimeMinutes: 15,
            waitingTimeMinutes: 0,
            machineQty: 0,
            operatorQty: 1,
            supervisorQty: 1,
            qcQty: 2,
            packagingStaffQty: 0
          },
          {
            id: 'RC-03-S6',
            sequence: 6,
            processName: 'Packaging',
            department: 'Packaging Shop',
            requiredMachine: 'Multi-head Weigher Pouch Filler K50',
            requiredEmployeeRole: 'Packaging Assistant',
            standardCycleTime: 500, // 500 pack/hour
            timeUnit: 'Packs/Hour',
            setupTimeMinutes: 20,
            cleaningTimeMinutes: 30,
            waitingTimeMinutes: 10,
            machineQty: 1,
            operatorQty: 1,
            supervisorQty: 1,
            qcQty: 1,
            packagingStaffQty: 3
          }
        ]
      }
    ];
    return defaults;
  });

  // State elements
  const [selectedRoutingId, setSelectedRoutingId] = useState<string>('RC-01');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Search/Filters
  const [filterFruit, setFilterFruit] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchWord, setSearchWord] = useState('');

  // Scheduling State
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    const local = localStorage.getItem('agridea_production_schedules');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error("Failed to parse schedules", e);
      }
    }

    return [
      {
        id: 'SCH-101',
        routingId: 'RC-01',
        batchCode: 'BCH-PNP-01',
        fruitVariantId: 'FV-01',
        targetOutputKg: 1000,
        startTime: '2026-06-08 07:00',
        endTime: '2026-06-09 17:00',
        durationHours: 34,
        factory: 'Wonosobo (MPD)',
        machineId: 'VF-01',
        assignedOperators: ['Ahmad', 'Budi', 'Cahyo'],
        status: 'Scheduled'
      },
      {
        id: 'SCH-102',
        routingId: 'RC-02',
        batchCode: 'BCH-JFK-02',
        fruitVariantId: 'FV-02',
        targetOutputKg: 500,
        startTime: '2026-06-08 08:30',
        endTime: '2026-06-09 12:30',
        durationHours: 28,
        factory: 'Sipahutar (SSP)',
        machineId: 'VF-02',
        assignedOperators: ['Dedi', 'Eko'],
        status: 'Running'
      },
      {
        id: 'SCH-103',
        routingId: 'RC-03',
        batchCode: 'BCH-SLK-03',
        fruitVariantId: 'FV-03',
        targetOutputKg: 800,
        startTime: '2026-06-10 06:00',
        endTime: '2026-06-11 22:00',
        durationHours: 40,
        factory: 'Wonosobo (MPD)',
        machineId: 'VF-01',
        assignedOperators: ['Farhan', 'Gani'],
        status: 'Scheduled'
      }
    ];
  });

  // Capacity Calculator Settings
  const [calculatorTargetOutput, setCalculatorTargetOutput] = useState<number>(1000);
  const [calculatorSelectedRoutingId, setCalculatorSelectedRoutingId] = useState<string>('RC-01');

  // Interactive slide factor for Capacity planning
  const [simulatedAvailableMinutesDaily, setSimulatedAvailableMinutesDaily] = useState<number>(1440); // 24 Hours in minutes
  const [simulatedEmployeeCount, setSimulatedEmployeeCount] = useState<number>(12); // preparation staffing count

  // Machine metrics pre-seed (Operating / Idle / Cleaning / Downtime)
  const [machines, setMachines] = useState<MachineState[]>([
    { id: 'VF-01', name: 'Vacuum Fryer V-300 #1', factory: 'Wonosobo (MPD)', operatingTimeMins: 980, idleTimeMins: 220, cleaningTimeMins: 120, downtimeMins: 80, maintenanceTimeMins: 40, totalQcDefectsKg: 24 },
    { id: 'VF-02', name: 'Vacuum Fryer V-300 #2', factory: 'Sipahutar (SSP)', operatingTimeMins: 840, idleTimeMins: 360, cleaningTimeMins: 120, downtimeMins: 90, maintenanceTimeMins: 30, totalQcDefectsKg: 18 },
    { id: 'VF-03', name: 'Vacuum Fryer V-300 #3', factory: 'Wonosobo (MPD)', operatingTimeMins: 960, idleTimeMins: 200, cleaningTimeMins: 120, downtimeMins: 120, maintenanceTimeMins: 40, totalQcDefectsKg: 30 },
    { id: 'K50-01', name: 'Pouch Filler K50 #1', factory: 'Wonosobo (MPD)', operatingTimeMins: 450, idleTimeMins: 750, cleaningTimeMins: 120, downtimeMins: 80, maintenanceTimeMins: 40, totalQcDefectsKg: 5 }
  ]);

  // Actual Production Records for payroll calculation & productivity comparison
  const [actualProdLogs, setActualProdLogs] = useState([
    { id: 'LOG-001', workerName: 'Ahmad', role: 'Preparation Specialist', stage: 'Peeling', qtyProcessedKg: 520, hoursWorked: 8, baseRatePerKg: 1500 },
    { id: 'LOG-002', workerName: 'Budi', role: 'Preparation Specialist', stage: 'Peeling', qtyProcessedKg: 480, hoursWorked: 8, baseRatePerKg: 1500 },
    { id: 'LOG-003', workerName: 'Cahyo', role: 'Frying Operator', stage: 'Vacuum Frying', qtyProcessedKg: 1200, hoursWorked: 8, baseRatePerKg: 500 },
    { id: 'LOG-004', workerName: 'Dedi', role: 'Preparation Specialist', stage: 'Peeling', qtyProcessedKg: 640, hoursWorked: 8, baseRatePerKg: 1500 },
    { id: 'LOG-005', workerName: 'Eko', role: 'Packaging Assistant', stage: 'Packaging', qtyProcessedKg: 850, hoursWorked: 8, baseRatePerKg: 600 }
  ]);

  // Routing Master Form State variables
  const [formRoutingCode, setFormRoutingCode] = useState('');
  const [formRoutingName, setFormRoutingName] = useState('');
  const [formFruitId, setFormFruitId] = useState('FV-01');
  const [formFactory, setFormFactory] = useState('All');
  const [formVersion, setFormVersion] = useState('1.0');
  const [formEffectiveDate, setFormEffectiveDate] = useState('2026-06-01');
  const [formExpiryDate, setFormExpiryDate] = useState('2027-06-01');
  const [formNotes, setFormNotes] = useState('');
  const [formSteps, setFormSteps] = useState<RoutingStep[]>([]);

  // Open creation dialog
  const handleStartCreateRouting = () => {
    setFormRoutingCode(`RC-0${routings.length + 1}`);
    setFormRoutingName('');
    setFormFruitId(state.fruitVariants[0]?.id || 'FV-01');
    setFormFactory('All');
    setFormVersion('1.0');
    setFormEffectiveDate('2026-06-01');
    setFormExpiryDate('2027-06-01');
    setFormNotes('');
    setFormSteps([
      {
        id: `RC-NEW-S1`,
        sequence: 1,
        processName: 'Receiving',
        department: 'Packaging Shop',
        requiredMachine: 'None',
        requiredEmployeeRole: 'Warehouse Operator',
        standardCycleTime: 30,
        timeUnit: 'Minutes/Ton',
        setupTimeMinutes: 10,
        cleaningTimeMinutes: 10,
        waitingTimeMinutes: 5,
        machineQty: 0,
        operatorQty: 2,
        supervisorQty: 1,
        qcQty: 1,
        packagingStaffQty: 0
      },
      {
        id: `RC-NEW-S2`,
        sequence: 2,
        processName: 'Peeling',
        department: 'Preparation Shop',
        requiredMachine: 'Automated Skinner',
        requiredEmployeeRole: 'Preparation Specialist',
        standardCycleTime: 0.8,
        timeUnit: 'Minutes/Kg',
        setupTimeMinutes: 10,
        cleaningTimeMinutes: 10,
        waitingTimeMinutes: 5,
        machineQty: 1,
        operatorQty: 4,
        supervisorQty: 1,
        qcQty: 1,
        packagingStaffQty: 0
      }
    ]);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleStartEditRouting = (rc: RoutingHeader) => {
    setFormRoutingCode(rc.id);
    setFormRoutingName(rc.routingName);
    setFormFruitId(rc.fruitVariantId);
    setFormFactory(rc.factory);
    setFormVersion(rc.version);
    setFormEffectiveDate(rc.effectiveDate);
    setFormExpiryDate(rc.expiryDate);
    setFormNotes(rc.notes || '');
    setFormSteps(rc.steps);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleSaveRouting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoutingCode || !formRoutingName) {
      alert('Code and routing name cannot be empty');
      return;
    }

    const payload: RoutingHeader = {
      id: formRoutingCode,
      routingName: formRoutingName,
      fruitVariantId: formFruitId,
      factory: formFactory,
      version: formVersion,
      status: 'Draft',
      effectiveDate: formEffectiveDate,
      expiryDate: formExpiryDate,
      notes: formNotes,
      steps: formSteps.sort((a, b) => a.sequence - b.sequence),
      approvalStage: 'Creator'
    };

    let updated;
    if (isEditing) {
      updated = routings.map(r => r.id === formRoutingCode ? payload : r);
      logActivity('Routing Master', `Mengupdate Data routing sequence standar [${formRoutingCode}] status kembali draft.`, payload);
    } else {
      updated = [...routings, payload];
      logActivity('Routing Master', `Mendaftarkan Routing Sequence Standar baru: ${formRoutingCode}`, payload);
    }

    setRoutings(updated);
    localStorage.setItem('agridea_production_routings', JSON.stringify(updated));
    setIsFormOpen(false);
    setIsEditing(false);
    setSelectedRoutingId(formRoutingCode);
  };

  const handleDeleteRouting = (id: string) => {
    if (!window.confirm(`Hapus data routing master ${id}?`)) return;
    const filtered = routings.filter(r => r.id !== id);
    setRoutings(filtered);
    localStorage.setItem('agridea_production_routings', JSON.stringify(filtered));
    logActivity('Routing Master', `Menghapus master routing ${id}`);
    if (selectedRoutingId === id) {
      setSelectedRoutingId(filtered[0]?.id || '');
    }
  };

  const handleAddStepForm = () => {
    const nextSeq = formSteps.length + 1;
    const newStep: RoutingStep = {
      id: `RC-NEW-S${Date.now()}`,
      sequence: nextSeq,
      processName: 'Custom Stage',
      department: 'Shopfloor',
      requiredMachine: 'None',
      requiredEmployeeRole: 'Operator',
      standardCycleTime: 1,
      timeUnit: 'Minutes/Kg',
      setupTimeMinutes: 0,
      cleaningTimeMinutes: 0,
      waitingTimeMinutes: 0,
      machineQty: 1,
      operatorQty: 1,
      supervisorQty: 1,
      qcQty: 0,
      packagingStaffQty: 0
    };
    setFormSteps([...formSteps, newStep]);
  };

  const handleRemoveStepForm = (idx: number) => {
    setFormSteps(formSteps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, sequence: i + 1 })));
  };

  const handleUpdateStepForm = (idx: number, updated: Partial<RoutingStep>) => {
    const copy = [...formSteps];
    copy[idx] = { ...copy[idx], ...updated } as RoutingStep;
    setFormSteps(copy);
  };

  // Approval flow step transitions
  const handleWorkflowTransition = (id: string, stage: 'Production Manager' | 'HQ Production' | 'Director' | 'Approved') => {
    const target = routings.find(r => r.id === id);
    if (!target) return;

    let nextStage = target.approvalStage;
    let status = target.status;

    if (stage === 'Production Manager') {
      nextStage = 'Production Manager';
      status = 'Pending Approval';
    } else if (stage === 'HQ Production') {
      nextStage = 'HQ Production';
      status = 'Pending Approval';
    } else if (stage === 'Director') {
      nextStage = 'Approved';
      status = 'Approved';
    }

    const updatedHeader: RoutingHeader = {
      ...target,
      approvalStage: nextStage,
      status: status,
      approver: currentUser.namaLengkap || currentUser.username,
      approvalDate: new Date().toISOString().split('T')[0],
      approvalNotes: `Approved at routing sequence validation checkpoint by: ${currentUser.role}`
    };

    const updatedList = routings.map(r => r.id === id ? updatedHeader : r);
    setRoutings(updatedList);
    localStorage.setItem('agridea_production_routings', JSON.stringify(updatedList));
    logActivity('Routing Master', `Workflow routing ${id} dimajukan ke level stage: ${nextStage}`, updatedHeader);
  };

  // Filtering routings
  const filteredRoutings = useMemo(() => {
    return routings.filter(r => {
      const fruitName = state.fruitVariants.find(f => f.id === r.fruitVariantId)?.nama || '';
      const matchFruit = filterFruit ? r.fruitVariantId === filterFruit : true;
      const matchStatus = filterStatus ? r.status === filterStatus : true;
      const matchSearch = searchWord ? (r.id.toLowerCase().includes(searchWord.toLowerCase()) || r.routingName.toLowerCase().includes(searchWord.toLowerCase()) || fruitName.toLowerCase().includes(searchWord.toLowerCase())) : true;
      return matchFruit && matchStatus && matchSearch;
    });
  }, [routings, filterFruit, filterStatus, searchWord, state.fruitVariants]);

  const activeRouting = useMemo(() => {
    return routings.find(r => r.id === selectedRoutingId) || routings[0];
  }, [routings, selectedRoutingId]);

  // Scheduling engine scheduling algorithm
  const schedulerData = useMemo(() => {
    const list: any[] = [];
    schedules.forEach(sc => {
      const route = routings.find(r => r.id === sc.routingId) || routings[0];
      const fruitValName = state.fruitVariants.find(f => f.id === sc.fruitVariantId)?.nama || 'Nanas';
      list.push({
        ...sc,
        routeName: route?.routingName || 'Standard Route',
        fruitName: fruitValName,
        stepCount: route?.steps?.length || 6
      });
    });
    return list;
  }, [schedules, routings, state.fruitVariants]);

  // OEE Logic Computation (Availability * Performance * Quality)
  const oeeMetrics = useMemo(() => {
    return machines.map(m => {
      const totalMinutesInput = m.operatingTimeMins + m.idleTimeMins + m.cleaningTimeMins + m.downtimeMins + m.maintenanceTimeMins;
      
      // Availability: Operating time / Planned production time (Planned time excludes maintenance)
      const plannedTimeMins = totalMinutesInput - m.maintenanceTimeMins;
      const availabilityPct = plannedTimeMins > 0 ? (m.operatingTimeMins / plannedTimeMins) * 100 : 0;

      // Performance: Actual run speed vs Ideal cycle standard (standard is e.g. 90 minutes per cycle, carrying 300Kg)
      // Say standard capability is 3.33 Kg/Minute, and it ran at 3.10 Kg/Minute
      const performancePct = m.id.includes('K50') ? 88.5 : 92.4; // standard simulated constant speed

      // Quality: Lolos QC ratio (Excluding totalQcDefectsKg)
      const totalProcessedQty = m.id.includes('K50') ? 10000 : 3600; // approximation
      const qualityPct = totalProcessedQty > 0 ? ((totalProcessedQty - m.totalQcDefectsKg) / totalProcessedQty) * 100 : 100;

      const oee = (availabilityPct / 100) * (performancePct / 100) * (qualityPct / 100) * 100;

      let classification: 'World Class' | 'Good' | 'Fair' | 'Poor' = 'Poor';
      let classificationColor = 'text-red-600 bg-red-100 border-red-200';
      if (oee >= 85) {
        classification = 'World Class';
        classificationColor = 'text-emerald-700 bg-emerald-100 border-emerald-200';
      } else if (oee >= 75) {
        classification = 'Good';
        classificationColor = 'text-blue-700 bg-blue-100 border-blue-200';
      } else if (oee >= 60) {
        classification = 'Fair';
        classificationColor = 'text-yellow-700 bg-yellow-100 border-yellow-200';
      }

      return {
        ...m,
        availability: availabilityPct,
        performance: performancePct,
        quality: qualityPct,
        oeePercent: oee,
        classLabel: classification,
        classStyle: classificationColor,
        plannedMins: plannedTimeMins
      };
    });
  }, [machines]);

  // Bottleneck & Allocation calculation dynamically
  const bottleneckData = useMemo(() => {
    // Frying capacity per cycle limits machine daily throughput
    const activeRouteObj = routings.find(r => r.id === calculatorSelectedRoutingId) || routings[0];
    if (!activeRouteObj) return { machineBottleneck: 'None', laborBottleneck: 'None', processBottleneck: 'None', message: '' };

    // Find steps with highest standardCycleTime or setup ratio
    let machineBottleneck = 'None';
    let maxMachineMins = 0;
    let processBottleneck = 'None';
    let maxCycleTimeMins = 0;

    activeRouteObj.steps.forEach(st => {
      // Analyze cycle conversion in terms of minutes processing time per Kg
      let normalizedMinsPerKg = 0;
      if (st.timeUnit === 'Minutes/Kg') {
        normalizedMinsPerKg = st.standardCycleTime;
      } else if (st.timeUnit === 'Minutes/Cycle') {
        // e.g. 90 minutes for 300Kg
        const limitCap = st.frozenCapacityPerCycleKg || 300;
        normalizedMinsPerKg = st.standardCycleTime / limitCap;
      } else if (st.timeUnit === 'Packs/Hour') {
        // packs per hour to minutes per pack -> divide by pack wt to get minutes per kg
        const standardPacksPerHour = st.standardCycleTime; // e.g. 1000
        const minutesPerPack = 60 / standardPacksPerHour;
        normalizedMinsPerKg = minutesPerPack / 0.100; // assuming weight 100g
      } else if (st.timeUnit === 'Hours') {
        // static freezing sequence
        normalizedMinsPerKg = (st.standardCycleTime * 60) / 1000; // proxy conversion share
      }

      const totalTimeNeeded = normalizedMinsPerKg * calculatorTargetOutput;
      if (totalTimeNeeded > maxCycleTimeMins) {
        maxCycleTimeMins = totalTimeNeeded;
        processBottleneck = st.processName;
        machineBottleneck = st.requiredMachine;
      }
    });

    // Check preparation staffing constrain
    const requiredPeelingTime = 0.8 * calculatorTargetOutput; // 0.8 min/kg
    const availableStaffMinutes = simulatedEmployeeCount * simulatedAvailableMinutesDaily;
    const staffUtilization = (requiredPeelingTime / (availableStaffMinutes || 1)) * 100;

    const fryingStep = activeRouteObj.steps.find(s => s.processName === 'Vacuum Frying');
    const fryingCycleTime = fryingStep?.standardCycleTime || 90;
    const fryingPayloadCap = fryingStep?.frozenCapacityPerCycleKg || 300;
    const requiredFryingBatchCount = Math.ceil((calculatorTargetOutput * 0.25) / fryingPayloadCap); // 25% yield assumption
    const totalRequiredFryingMinutes = requiredFryingBatchCount * fryingCycleTime;
    const fryingMachineUtilization = (totalRequiredFryingMinutes / simulatedAvailableMinutesDaily) * 100;

    let warningLevel: 'none' | 'moderate' | 'critical' = 'none';
    if (fryingMachineUtilization > 95 || staffUtilization > 100) {
      warningLevel = 'critical';
    } else if (fryingMachineUtilization > 80 || staffUtilization > 85) {
      warningLevel = 'moderate';
    }

    return {
      machineBottleneck: fryingMachineUtilization > 90 ? 'Vacuum Frying Machine V-300' : 'None',
      laborBottleneck: staffUtilization > 100 ? 'Preparation Specialists' : 'None',
      processBottleneck,
      fryingUtilization: fryingMachineUtilization,
      staffUtilization,
      warningLevel,
      requiredFryingBatchCount,
      totalRequiredFryingMinutes,
      requiredPeelingTime
    };
  }, [routings, calculatorSelectedRoutingId, calculatorTargetOutput, simulatedAvailableMinutesDaily, simulatedEmployeeCount]);

  // AI Capacity / Forecasting Insight generator
  const aiRoutingAnalysis = useMemo(() => {
    let problem = "Vacuum Frying capacity at MPD reached 96%.";
    let challenge = "Current machine utilization is extremely high, leaving less than 4% buffer for unplanned maintenance.";
    let actionPlan = "1. Redistribute pineapple batch processing to Sipahutar (SSP) factory which holds 64% utilization. \n2. Standardize setup/cleaning transition protocol to minimize fryer idle downtime. \n3. Recalibrate peeling caliber to boost pre-cook consistency.";

    if (bottleneckData.warningLevel === 'critical') {
      problem = `Production schedule for ${calculatorTargetOutput}Kg requires ${bottleneckData.fryingUtilization.toFixed(1)}% Vacuum Frying power.`;
      challenge = `Required machine processing duration exceeds daily available window (${bottleneckData.totalRequiredFryingMinutes} mins vs limit ${simulatedAvailableMinutesDaily} mins).`;
      actionPlan = `1. Transition to a 3-shift calendar setup or inject additional mechanical peeling units. \n2. Shift excess volume of raw frozen chips to Jakarta (AGDN) central facility. \n3. Optimize frozen batch loading sizes to 310Kg (+10Kg boost) within safe parameters.`;
    }

    return { problem, challenge, actionPlan };
  }, [bottleneckData, calculatorTargetOutput, simulatedAvailableMinutesDaily]);

  // Actual product routing costing simulation
  const costingBreakdown = useMemo(() => {
    const activeRouteObj = routings.find(r => r.id === calculatorSelectedRoutingId) || routings[0];
    if (!activeRouteObj) return { totalLaborCost: 0, totalMachineCost: 0, totalUtilityCost: 0, overallRouteCost: 0, detailRows: [] };

    // Standard rate factors
    const LaborCostPerMinute = 150; // default average salary share
    const MachineCostPerMinute = 250; // boiler maintenance & mechanical parts tear
    const UtilityCostPerMinute = 400; // industrial electric & gas fuel line

    let accumLabor = 0;
    let accumMachine = 0;
    let accumUtility = 0;
    const detailRows: any[] = [];

    activeRouteObj.steps.forEach(st => {
      // Calculate minutes needed per process step based on Target quantity
      let stepTotalMins = 0;
      if (st.timeUnit === 'Minutes/Ton') {
        stepTotalMins = (calculatorTargetOutput / 1000) * st.standardCycleTime;
      } else if (st.timeUnit === 'Minutes/Kg') {
        stepTotalMins = calculatorTargetOutput * st.standardCycleTime;
      } else if (st.timeUnit === 'Hours') {
        stepTotalMins = st.standardCycleTime * 60; // constant freezing baseline
      } else if (st.timeUnit === 'Minutes/Cycle') {
        const capacityLimit = st.frozenCapacityPerCycleKg || 300;
        const cycles = Math.ceil(calculatorTargetOutput / capacityLimit);
        stepTotalMins = cycles * st.standardCycleTime;
      } else if (st.timeUnit === 'Packs/Hour') {
        // assume total packs from output
        const totalPacks = (calculatorTargetOutput * 1000) / 100; // default pouch wt is 100g
        const packsPerHour = st.standardCycleTime;
        const hoursNeeded = totalPacks / packsPerHour;
        stepTotalMins = hoursNeeded * 60;
      }

      // Add setup/cleaning setup
      const activeOps = st.operatorQty || 1;
      const stepTotalDuration = stepTotalMins + st.setupTimeMinutes + st.cleaningTimeMinutes;

      const laborCost = stepTotalDuration * LaborCostPerMinute * activeOps;
      const machineCost = st.machineQty > 0 ? (stepTotalDuration * MachineCostPerMinute) : 0;
      // Utility weight index
      let utilityFactor = 1.0;
      if (st.processName === 'Vacuum Frying') utilityFactor = 4.5; // Gas & oil heat weight
      if (st.processName === 'Frozen') utilityFactor = 2.0;

      const utilityCost = stepTotalDuration * UtilityCostPerMinute * utilityFactor;

      accumLabor += laborCost;
      accumMachine += machineCost;
      accumUtility += utilityCost;

      detailRows.push({
        name: st.processName,
        sequence: st.sequence,
        durationMins: stepTotalDuration,
        laborCost,
        machineCost,
        utilityCost,
        totalStepCost: laborCost + machineCost + utilityCost
      });
    });

    const grandTotal = accumLabor + accumMachine + accumUtility;

    return {
      totalLaborCost: accumLabor,
      totalMachineCost: accumMachine,
      totalUtilityCost: accumUtility,
      overallRouteCost: grandTotal,
      detailRows
    };
  }, [routings, calculatorSelectedRoutingId, calculatorTargetOutput]);

  // Labor productivity calculations (standard vs actual comparison)
  const workerPerformanceStats = useMemo(() => {
    return actualProdLogs.map(log => {
      // Default expected standard standard rates (Kg/Person/Day is 75)
      // Say standard capability is 75Kg / 8 hours = 9.375 Kg / Hour
      // For Peeling stage, standard capability is 0.8 Minutes/Kg -> 1.25 Kg/Minute -> 75 Kg / Hour
      const standardPerHour = log.stage === 'Peeling' ? 75 : 120;
      const standardTotalExpected = standardPerHour * log.hoursWorked;
      const actualProcessed = log.qtyProcessedKg;

      const variancePct = ((actualProcessed - standardTotalExpected) / standardTotalExpected) * 100;
      const productivityStatus = actualProcessed >= standardTotalExpected ? 'Above Standard' : 'Below Standard';

      // Payroll integration (Pay is calculated based on productivity conversion!)
      const normalWage = log.hoursWorked * 15000; // default base rate
      const pieceRateBonus = actualProcessed * log.baseRatePerKg * 0.15; // piecework bonus rate multiplier
      const totalPayout = normalWage + pieceRateBonus;

      return {
        ...log,
        expectedStandard: standardTotalExpected,
        variancePercent: parseFloat(variancePct.toFixed(1)),
        status: productivityStatus,
        totalWage: totalPayout
      };
    });
  }, [actualProdLogs]);

  // Standard interactive charts pre-seed
  const processCostComparisonData = useMemo(() => {
    return costingBreakdown.detailRows.map(row => ({
      name: row.name,
      Labor: row.qtyCost || Math.round(row.laborCost),
      Machine: Math.round(row.machineCost),
      Utility: Math.round(row.utilityCost)
    }));
  }, [costingBreakdown]);

  const handleAddNewStepInForm = () => {
    const nextSeq = formSteps.length + 1;
    const newStep: RoutingStep = {
      id: `RC-NEW-S${Date.now()}`,
      sequence: nextSeq,
      processName: 'Custom Step',
      department: 'Production',
      requiredMachine: 'None',
      requiredEmployeeRole: 'Operator',
      standardCycleTime: 1,
      timeUnit: 'Minutes/Kg',
      setupTimeMinutes: 0,
      cleaningTimeMinutes: 0,
      waitingTimeMinutes: 0,
      machineQty: 1,
      operatorQty: 1,
      supervisorQty: 1,
      qcQty: 0,
      packagingStaffQty: 0
    };
    setFormSteps([...formSteps, newStep]);
  };

  const generateAutoSchedules = () => {
    if (!calculatorTargetOutput || !calculatorSelectedRoutingId) {
      alert("Formulate target and routing selector keys properly map standard cycles.");
      return;
    }

    const route = routings.find(r => r.id === calculatorSelectedRoutingId);
    if (!route) return;

    // Calculate estimated production hours based on routing total duration plus setup/cleaning ratios
    const hoursMultiplier = costingBreakdown.detailRows.reduce((a, b) => a + b.durationMins, 0) / 60;

    const newSched: ScheduleItem = {
      id: `SCH-${schedules.length + 101}`,
      routingId: calculatorSelectedRoutingId,
      batchCode: `BCH-SIM-${Date.now() % 1000}`,
      fruitVariantId: route.fruitVariantId,
      targetOutputKg: calculatorTargetOutput,
      startTime: new Date().toISOString().split('T')[0] + ' 08:30',
      endTime: new Date(Date.now() + hoursMultiplier * 3600000).toISOString().split('T')[0] + ' 17:30',
      durationHours: Math.round(hoursMultiplier),
      factory: route.factory === 'All' ? 'Wonosobo (MPD)' : route.factory,
      machineId: 'VF-01',
      assignedOperators: ['Auto-scheduled Task'],
      status: 'Scheduled'
    };

    const updated = [...schedules, newSched];
    setSchedules(updated);
    localStorage.setItem('agridea_production_schedules', JSON.stringify(updated));
    logActivity('Scheduling Engine', `Auto scheduled batch ${newSched.batchCode} using cycle standards template ${calculatorSelectedRoutingId}`);
    setActiveTab('scheduling');
  };

  return (
    <div className="space-y-6" id="routing-cycle-time-module">
      
      {/* Dynamic Nav Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-1 font-mono text-xs">
        <button
          onClick={() => { setActiveTab('dashboard'); setIsFormOpen(false); }}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-950 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          📊 Production Intelligence Center
        </button>
        <button
          onClick={() => { setActiveTab('routing-master'); }}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'routing-master' ? 'bg-indigo-950 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          📋 Standard Routings ({routings.length})
        </button>
        <button
          onClick={() => { setActiveTab('scheduling'); }}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'scheduling' ? 'bg-indigo-950 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          🗓️ Scheduling Engine
        </button>
        <button
          onClick={() => { setActiveTab('capacity'); }}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'capacity' ? 'bg-indigo-950 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          ⚡ Bottleneck Analyzer
        </button>
        <button
          onClick={() => { setActiveTab('productivity'); }}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'productivity' ? 'bg-indigo-950 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          👤 Labor Productivity
        </button>
        <button
          onClick={() => { setActiveTab('costing'); }}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'costing' ? 'bg-indigo-950 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          💰 Routing Costing Control
        </button>
        <button
          onClick={() => { setActiveTab('oee-metrics'); }}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'oee-metrics' ? 'bg-indigo-950 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          ⚙️ OEE & Machine Health
        </button>
      </div>

      {/* VIEW 1: PRODUCTION INTELLIGENCE CENTER (EXECUTIVE INTELLIGENCE) */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in" id="dashboard-production-tab">
          
          {/* Executive Overview row cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Avg Factory OEE %</span>
                <span className="text-xl font-black text-slate-800">81.4% (Good)</span>
                <span className="text-[10px] text-emerald-600 font-bold block">Capacity meets standards</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Sliders className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Frying Constraint</span>
                <span className="text-lg font-black text-rose-700">96.0% (MPD)</span>
                <span className="text-[10px] text-red-500 font-bold block">Critically close to maximum</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Labor Productivity</span>
                <span className="text-base font-black text-slate-800">105.4% Effective</span>
                <span className="text-[10px] text-emerald-600 font-bold block">Above expected baseline</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Bottleneck status</span>
                <span className="text-lg font-black text-slate-800">Frying Machine Limit</span>
                <span className="text-[10px] text-orange-500 font-bold block">Packaging holding excess power</span>
              </div>
            </div>
          </div>

          {/* AI Advisor Column Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-900 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/20 text-indigo-200 text-[10px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 animate-bounce" /> AI Capacity &amp; Resource Diagnosis
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">DETECTED BOTTLENECK CONSTRAINT</span>
                  <p className="text-sm font-black text-white italic">"{aiRoutingAnalysis.problem}"</p>
                </div>
                <div className="text-[11px] text-indigo-200 space-y-2">
                  <p><strong className="text-white">Challenge:</strong> {aiRoutingAnalysis.challenge}</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                <span className="text-[9.5px] text-emerald-400 font-bold block uppercase tracking-wider">🤖 RECOMMENDED CAPACITY ACTION PLAN</span>
                <p className="text-[11px] text-indigo-100 whitespace-pre-line leading-relaxed">{aiRoutingAnalysis.actionPlan}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Machine Utilization Ratio (%)</h3>
                <p className="text-slate-400 text-[10px] font-medium">Laju operasional mesin utama dari 24 jam shift kerja.</p>
              </div>

              <div className="space-y-3 pt-2">
                {oeeMetrics.map((machine, index) => {
                  const operatingPct = (machine.operatingTimeMins / machine.plannedMins) * 100;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5 truncate max-w-40"><span className="w-2 h-2 bg-indigo-600 rounded-full"></span> {machine.name}</span>
                        <span className="font-mono">{operatingPct.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${operatingPct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* OEE classification charts */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Overall OEE Status Levels</h3>
                <p className="text-slate-400 text-[10px] font-medium">Perbandingan Availability, Speed Performance &amp; Quality Yield.</p>
              </div>

              <div className="divide-y divide-slate-100 pt-1 text-xs">
                {oeeMetrics.map((oee, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 block truncate max-w-40">{oee.name}</span>
                      <span className="text-slate-400 text-[9px] block">Ava: {oee.availability.toFixed(1)}% • Perf: {oee.performance.toFixed(1)}%</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full font-black text-[9px] border uppercase ${oee.classStyle}`}>
                      {oee.oeePercent.toFixed(1)}% {oee.classLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated target output timeline planning */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Active Batch Flight Control</h3>
                  <p className="text-slate-400 text-[10px]">Aliran dispatch penjadwalan komitmen target cycle time.</p>
                </div>
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>

              <div className="divide-y divide-slate-100 font-mono text-xs">
                {schedulerData.map((sched, idx) => {
                  let statusBanner = 'bg-slate-100 text-slate-600';
                  if (sched.status === 'Running') statusBanner = 'bg-orange-100 text-orange-700 animate-pulse font-bold';
                  if (sched.status === 'Completed') statusBanner = 'bg-emerald-100 text-emerald-800 font-bold';

                  return (
                    <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="font-black text-indigo-900 block">{sched.batchCode} ({sched.fruitName})</span>
                        <span className="text-slate-400 text-[10px] block font-sans">Route: {sched.routeName} • Machine: <strong className="text-slate-700">{sched.machineId}</strong></span>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="text-slate-500 font-bold text-[10px] block">{sched.startTime} → {sched.endTime} ({sched.durationHours} Hours)</span>
                        <div className="flex gap-2 justify-end">
                          <span className="bg-slate-100 text-slate-650 font-bold rounded px-1.5 py-0.5 text-[9px] uppercase">{sched.factory}</span>
                          <span className={`px-2 py-0.5 rounded text-[9.5px] uppercase ${statusBanner}`}>{sched.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 2: ROUTING MASTER DETAIL SHEET */}
      {activeTab === 'routing-master' && !isFormOpen && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="routing-standards-tab">
          
          {/* Left panel Selection sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Cari standard routing sequence..."
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:ring-2 focus:ring-indigo-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filterFruit}
                  onChange={(e) => setFilterFruit(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-[10.5px] font-bold text-slate-700 font-sans"
                >
                  <option value="">Semua Buah</option>
                  {state.fruitVariants.map(fv => (
                    <option key={fv.id} value={fv.id}>{fv.nama}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-[10.5px] font-bold text-slate-700 font-sans"
                >
                  <option value="">Semua Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>
            </div>

            {/* List scroll panel */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredRoutings.map(rc => {
                const isActive = selectedRoutingId === rc.id;
                const fruitStr = state.fruitVariants.find(f => f.id === rc.fruitVariantId)?.nama || 'Nanas';
                
                let markerStyle = 'bg-slate-100 text-slate-650';
                if (rc.status === 'Approved') markerStyle = 'bg-emerald-100 text-emerald-800 font-bold';
                if (rc.status === 'Draft') markerStyle = 'bg-blue-100 text-blue-800';
                if (rc.status === 'Pending Approval') markerStyle = 'bg-orange-100 text-orange-700 animate-pulse';

                return (
                  <div
                    key={rc.id}
                    onClick={() => setSelectedRoutingId(rc.id)}
                    className={`bg-white p-4 rounded-xl border transition cursor-pointer ${isActive ? 'ring-2 ring-indigo-950 border-indigo-950 shadow-md translate-x-1' : 'border-slate-200 hover:border-slate-400'}`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-mono mb-1.5">
                      <span className="font-extrabold text-slate-400">{rc.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9.5px] uppercase ${markerStyle}`}>{rc.status}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-xs tracking-tight">{rc.routingName}</h4>
                      <span className="text-[10px] text-slate-400 block">Target variant: <strong className="text-slate-650">{fruitStr}</strong></span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[9px] text-slate-400 pt-2 border-t mt-2">
                      <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-bold">V{rc.version}</span>
                      <span className="font-bold">Factory: {rc.factory}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel Detail & Routing Sequence Breakdown */}
          <div className="lg:col-span-2">
            {!activeRouting ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-dashed text-slate-400 flex flex-col justify-center items-center h-full min-h-[300px]">
                <FileText className="w-12 h-12 text-slate-300 mb-3" />
                Daftar standard routing sequence kosong. Silakan pilih di sebelah kiri.
              </div>
            ) : (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                
                {/* Details card content header */}
                <div className="flex flex-col sm:flex-row justify-between items-start border-b pb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs text-indigo-600 font-bold">{activeRouting.id}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase font-bold">V{activeRouting.version}</span>
                    </div>
                    <h2 className="text-lg font-black tracking-tight text-slate-800 font-display">{activeRouting.routingName}</h2>
                    <p className="text-[10px] font-mono text-slate-400">Target fruit variant parameters: <strong className="text-slate-700">{state.fruitVariants.find(f => f.id === activeRouting.fruitVariantId)?.nama || 'Nanas'}</strong></p>
                  </div>

                  {/* Flow Trigger workflow settings */}
                  <div className="text-right space-y-2">
                    <span className="text-slate-400 block font-bold font-mono text-[9px] uppercase">Effective: {activeRouting.effectiveDate}</span>
                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                      {activeRouting.status === 'Draft' && (
                        <button
                          onClick={() => handleWorkflowTransition(activeRouting.id, 'Production Manager')}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[9.5px] uppercase py-1 px-2.5 rounded-md cursor-pointer transition"
                        >
                          Submit to PM Review
                        </button>
                      )}
                      {activeRouting.status === 'Pending Approval' && currentUser.role.includes('Manager') && (
                        <button
                          onClick={() => handleWorkflowTransition(activeRouting.id, 'HQ Production')}
                          className="bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-[9.5px] uppercase py-1 px-2.5 rounded-md cursor-pointer transition"
                        >
                          Approve and forward HQ
                        </button>
                      )}
                      {activeRouting.status === 'Pending Approval' && (currentUser.role.includes('HQ') || currentUser.role.includes('Director')) && (
                        <button
                          onClick={() => handleWorkflowTransition(activeRouting.id, 'Director')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[9.5px] uppercase py-1 px-2.5 rounded-md cursor-pointer transition"
                        >
                          Director Access Approval
                        </button>
                      )}
                      <button
                        onClick={() => handleStartEditRouting(activeRouting)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-extrabold text-[9.5px] uppercase py-1 px-2.5 rounded-md cursor-pointer transition"
                      >
                        Edit Layout
                      </button>
                      <button
                        onClick={() => handleDeleteRouting(activeRouting.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-extrabold text-[9.5px] uppercase py-1 px-2.5 rounded-md cursor-pointer transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Routing Steps Sequence Details */}
                <div className="space-y-4">
                  <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">Default Production Process Steps Sequence</h3>
                  
                  <div className="space-y-3">
                    {activeRouting.steps.map((st, i) => (
                      <div key={st.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                        
                        {/* Stage definition */}
                        <div className="md:col-span-1 border-r border-slate-200 pr-2 space-y-1">
                          <span className="bg-indigo-950 text-white font-bold px-2 py-0.5 rounded font-mono text-[9.5px] tracking-wider block w-max">Step 0{st.sequence}</span>
                          <span className="font-black text-slate-900 block text-sm">{st.processName}</span>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Dept: {st.department}</span>
                        </div>

                        {/* Machine & operator specs */}
                        <div className="md:col-span-1 space-y-1 font-sans">
                          <span className="text-slate-400 text-[9px] uppercase font-bold block">Resource Requirements</span>
                          <span className="text-slate-800 block truncate max-w-44">⚙️ {st.requiredMachine}</span>
                          <span className="text-slate-600 font-mono text-[10.5px] block">👤 {st.requiredEmployeeRole}</span>
                          <span className="text-[10px] text-slate-400 block">Alloc: (Ops: {st.operatorQty} • Supervisor: {st.supervisorQty} • QC: {st.qcQty})</span>
                        </div>

                        {/* Cycle time specs */}
                        <div className="md:col-span-1 font-mono text-slate-800 space-y-1">
                          <span className="text-slate-400 text-[9px] uppercase font-bold block font-sans">Cycle &amp; Transition Times</span>
                          <span className="text-indigo-950 block font-extrabold">⏳ {st.standardCycleTime} {st.timeUnit}</span>
                          <span className="text-slate-500 block text-[10.5px]">Setup: {st.setupTimeMinutes}m • Clean: {st.cleaningTimeMinutes}m</span>
                          {st.waitingTimeMinutes > 0 && <span className="text-orange-600 block text-[10.5px]">Waiting: {st.waitingTimeMinutes}m</span>}
                        </div>

                        {/* Vacuum frying additional utility details if applicable */}
                        <div className="md:col-span-1 bg-white p-2.5 rounded-xl border border-slate-200 text-[10.5px]" style={{ minHeight: "68px" }}>
                          {st.processName === 'Vacuum Frying' ? (
                            <div className="space-y-1 leading-none font-mono text-[10px]">
                              <span className="text-purple-700 font-bold block uppercase tracking-wider text-[9px]">Frying Cycle Specs</span>
                              <span className="text-slate-800 block">Cap: <strong>{st.frozenCapacityPerCycleKg} Kg Frozen</strong></span>
                              <span className="text-slate-800 block">Oil: <strong>{st.oilConsumptionPerCycleLiter} Liter</strong></span>
                              <span className="text-slate-800 block">LPG: <strong>{st.gasConsumptionPerCycleKg} Kg</strong></span>
                            </div>
                          ) : (
                            <div className="text-slate-400 italic flex items-center h-full text-[10px]">
                              {st.notes || 'No specified physical material conversion values.'}
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* FORM: STANDARD PRODUCTION ROUTING WRITER/UPDATER */}
      {activeTab === 'routing-master' && isFormOpen && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md animate-fade-in" id="form-routing-editor">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="text-base font-black uppercase text-slate-800">{isEditing ? 'Edit Existing Standard Route' : 'Create New Master Frying Route Formula'}</h3>
            <button
              onClick={() => setIsFormOpen(false)}
              className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg text-slate-500 font-bold cursor-pointer"
            >
              Cancel Edit
            </button>
          </div>

          <form onSubmit={handleSaveRouting} className="space-y-6 text-xs font-medium">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Routing Code</label>
                <input
                  type="text"
                  required
                  value={formRoutingCode}
                  onChange={(e) => setFormRoutingCode(e.target.value)}
                  disabled={isEditing}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-950 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Routing Name</label>
                <input
                  type="text"
                  required
                  value={formRoutingName}
                  onChange={(e) => setFormRoutingName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-950 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Fruit Variant Link</label>
                <select
                  value={formFruitId}
                  onChange={(e) => setFormFruitId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                >
                  {state.fruitVariants.map(fv => (
                    <option key={fv.id} value={fv.id}>{fv.nama} Standard</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Release Version</label>
                <input
                  type="text"
                  value={formVersion}
                  onChange={(e) => setFormVersion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-950 focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            {/* Steps loop */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-slate-700 uppercase block tracking-wider">Define Manufacturing Flow Steps ({formSteps.length})</h4>
                <button
                  type="button"
                  onClick={handleAddNewStepInForm}
                  className="bg-emerald-600 hover:bg-emerald-500 font-extrabold text-[9.5px] uppercase py-1.5 px-3 rounded-lg text-white cursor-pointer"
                >
                  Add Next Step Sequence
                </button>
              </div>

              <div className="space-y-4">
                {formSteps.map((step, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                    <div className="md:col-span-1 space-y-1">
                      <span className="font-mono text-[10px] font-bold text-indigo-900 block">Step sequence 0{step.sequence}</span>
                      <select
                        value={step.processName}
                        onChange={(e) => handleUpdateStepForm(idx, { processName: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5"
                      >
                        <option value="Receiving">Receiving</option>
                        <option value="Peeling">Peeling</option>
                        <option value="Frozen">Frozen</option>
                        <option value="Vacuum Frying">Vacuum Frying</option>
                        <option value="QC Grading">QC Grading</option>
                        <option value="Packaging">Packaging</option>
                        <option value="Warehouse">Warehouse</option>
                      </select>
                    </div>

                    <div className="md:col-span-1 space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400 block/ leading-none">Dept / Machine</label>
                      <input
                        type="text"
                        placeholder="Required Machine"
                        value={step.requiredMachine}
                        onChange={(e) => handleUpdateStepForm(idx, { requiredMachine: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5"
                      />
                    </div>

                    <div className="md:col-span-1 space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400 block/ leading-none">Cycle Time / Unit</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          step="any"
                          required
                          value={step.standardCycleTime}
                          onChange={(e) => handleUpdateStepForm(idx, { standardCycleTime: Number(e.target.value) })}
                          className="w-16 bg-white border border-slate-200 rounded-lg p-1.5"
                        />
                        <select
                          value={step.timeUnit}
                          onChange={(e) => handleUpdateStepForm(idx, { timeUnit: e.target.value })}
                          className="bg-white border text-[10px] border-slate-200 rounded-lg p-1.5"
                        >
                          <option value="Minutes/Ton">Min/Ton</option>
                          <option value="Minutes/Kg">Min/Kg</option>
                          <option value="Hours">Hours</option>
                          <option value="Minutes/Cycle">Min/Cyc</option>
                          <option value="Packs/Hour">Pck/Hr</option>
                        </select>
                      </div>
                    </div>

                    <div className="md:col-span-1 space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400 block">Resource setup</label>
                      <div className="flex gap-2">
                        <div>
                          <span className="text-[8px] text-slate-400">Setup(m)</span>
                          <input
                            type="number"
                            value={step.setupTimeMinutes}
                            onChange={(e) => handleUpdateStepForm(idx, { setupTimeMinutes: Number(e.target.value) })}
                            className="w-12 bg-white border border-slate-200 rounded p-1"
                          />
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-400">Clean(m)</span>
                          <input
                            type="number"
                            value={step.cleaningTimeMinutes}
                            onChange={(e) => handleUpdateStepForm(idx, { cleaningTimeMinutes: Number(e.target.value) })}
                            className="w-12 bg-white border border-slate-200 rounded p-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-1 space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400 block">Operator count Required</label>
                      <input
                        type="number"
                        value={step.operatorQty}
                        onChange={(e) => handleUpdateStepForm(idx, { operatorQty: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveStepForm(idx)}
                        className="bg-red-50 hover:bg-red-100 p-2 rounded-lg text-red-600 mt-4 block mx-auto cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>

                    {step.processName === 'Vacuum Frying' && (
                      <div className="md:col-span-6 bg-white p-3 rounded-xl border border-slate-200 mt-2 grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold">Frying payload size limit (Kg/Cycle)</span>
                          <input
                            type="number"
                            value={step.frozenCapacityPerCycleKg || 300}
                            onChange={(e) => handleUpdateStepForm(idx, { frozenCapacityPerCycleKg: Number(e.target.value) })}
                            className="w-full border border-slate-200 rounded p-1"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold">Oil dynamic draw standard (Liter/Cycle)</span>
                          <input
                            type="number"
                            value={step.oilConsumptionPerCycleLiter || 45}
                            onChange={(e) => handleUpdateStepForm(idx, { oilConsumptionPerCycleLiter: Number(e.target.value) })}
                            className="w-full border border-slate-200 rounded p-1"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold">LPG boil standard draw (Kg/Cycle)</span>
                          <input
                            type="number"
                            value={step.gasConsumptionPerCycleKg || 54}
                            onChange={(e) => handleUpdateStepForm(idx, { gasConsumptionPerCycleKg: Number(e.target.value) })}
                            className="w-full border border-slate-200 rounded p-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="bg-indigo-950 hover:bg-indigo-900 font-extrabold text-[11px] uppercase py-2 px-6 rounded-xl text-white block w-full mt-6 transition select-none cursor-pointer"
            >
              Confirm and Save Master sequence
            </button>
          </form>
        </div>
      )}

      {/* VIEW 3: SCHEDULING ENGINE */}
      {activeTab === 'scheduling' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fade-in" id="scheduler-engine-tab">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
            <div>
              <h3 className="text-base font-black uppercase text-slate-800">Production Scheduling Engine</h3>
              <p className="text-slate-400 text-xs">Generate optimal machine timelines using standard cycle routing constraints.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={generateAutoSchedules}
                className="bg-indigo-950 hover:bg-indigo-900 active:scale-95 text-white font-extrabold text-[10.5px] px-4 py-2 rounded-xl transition uppercase tracking-wide cursor-pointer flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-white" /> Dispatch Auto Scheduler Timeline
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl md:col-span-1 space-y-4">
              <span className="text-[10px] text-indigo-900 font-bold block uppercase tracking-wider">Scheduler settings</span>
              
              <div className="space-y-3 font-medium">
                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400">Target Output Qty (Chips Kg)</label>
                  <input
                    type="number"
                    value={calculatorTargetOutput}
                    onChange={(e) => setCalculatorTargetOutput(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs"
                  />
                  <span className="text-[9.5px] text-slate-400 italic font-mono">Will auto calculate overall required processing duration</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400">Active Routing Formula</label>
                  <select
                    value={calculatorSelectedRoutingId}
                    onChange={(e) => setCalculatorSelectedRoutingId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs"
                  >
                    {routings.map(r => (
                      <option key={r.id} value={r.id}>{r.id} - {r.routingName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5 text-[11px] font-mono leading-none">
                <span className="text-purple-700 font-bold block uppercase tracking-wider text-[9px] mb-2 font-sans">Sequence Duration forecast</span>
                <span className="text-slate-800 block">Total active steps: <strong>{costingBreakdown.detailRows.length} stages</strong></span>
                <span className="text-slate-800 block">Est machine duration: <strong>{(costingBreakdown.detailRows.reduce((a, b) => a + b.durationMins, 0) / 60).toFixed(1)} Hours</strong></span>
                <span className="text-slate-800 block">Labor costs standard: <strong>Rp {Math.round(costingBreakdown.totalLaborCost).toLocaleString()}</strong></span>
              </div>
            </div>

            {/* List scroll of schedule items */}
            <div className="md:col-span-2 space-y-3 max-h-[420px] overflow-y-auto pr-1">
              <h4 className="font-extrabold text-slate-700 text-xs uppercase block/ tracking-wider">Generated Timelines List</h4>

              {schedulerData.map((sc, i) => {
                let statusBadge = 'bg-slate-100 text-slate-600';
                if (sc.status === 'Running') statusBadge = 'bg-orange-100 text-orange-700 font-bold';
                if (sc.status === 'Completed') statusBadge = 'bg-emerald-100 text-emerald-800 font-bold';

                return (
                  <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 relative overflow-hidden">
                    {sc.status === 'Running' && (
                      <div className="absolute top-0 left-0 bg-orange-500 w-1 h-full animate-pulse"></div>
                    )}
                    <div className="flex flex-col sm:flex-row justify-between items-start text-xs font-mono">
                      <div>
                        <span className="font-black text-indigo-950 block text-[13px]">{sc.batchCode} ({sc.fruitName})</span>
                        <span className="text-[10px] text-slate-400 block font-sans">Formula: {sc.routeName}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold sm:text-right ${statusBadge}`}>{sc.status}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t text-[10.5px] font-mono leading-none text-slate-600">
                      <div>
                        <span className="text-slate-400 block font-sans text-[9px] uppercase">Active target</span>
                        <strong className="text-slate-800 text-sm">{sc.targetOutputKg} Kg Finished</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-sans text-[9px] uppercase">Est processing</span>
                        <strong className="text-slate-800 text-sm">{sc.durationHours} Hours</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-sans text-[9px] uppercase">Primary Facility</span>
                        <strong className="text-slate-800">{sc.factory}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-sans text-[9px] uppercase">Machine assign</span>
                        <strong className="text-slate-800">{sc.machineId} (Fryer)</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: CAPACITY PLANNING & BOTTLENECK SIMULATOR */}
      {activeTab === 'capacity' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fade-in" id="capacity-planning-tab">
          <div>
            <h3 className="text-base font-black uppercase text-slate-800">Dynamic Load Bottleneck Analyzer</h3>
            <p className="text-slate-400 text-xs">Simulate maximum factory load against available manpower and mechanical cycle limits.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Interactive sliders for planning inputs */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
              <span className="text-[10px] text-indigo-900 font-bold block uppercase tracking-wider">Simulator Calibration controls</span>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Target Output Chips (Kg)</span>
                    <span className="font-mono text-indigo-600">{calculatorTargetOutput} Kg</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={calculatorTargetOutput}
                    onChange={(e) => setCalculatorTargetOutput(Number(e.target.value))}
                    className="w-full accent-indigo-650 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Active Preparation manpower</span>
                    <span className="font-mono text-indigo-600">{simulatedEmployeeCount} Specialists</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    step="1"
                    value={simulatedEmployeeCount}
                    onChange={(e) => setSimulatedEmployeeCount(Number(e.target.value))}
                    className="w-full accent-indigo-650 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Available window daily</span>
                    <span className="font-mono text-indigo-600">{(simulatedAvailableMinutesDaily / 60).toFixed(0)} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="480"
                    max="1440"
                    step="480"
                    value={simulatedAvailableMinutesDaily}
                    onChange={(e) => setSimulatedAvailableMinutesDaily(Number(e.target.value))}
                    className="w-full accent-indigo-650 cursor-pointer"
                  />
                  <div className="flex justify-between font-mono text-[8px] text-slate-400">
                    <span>1 Shift (8hr)</span>
                    <span>2 Shifts (16hr)</span>
                    <span>3 Shifts (24hr)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400">Selected Route Parameters</label>
                  <select
                    value={calculatorSelectedRoutingId}
                    onChange={(e) => setCalculatorSelectedRoutingId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs"
                  >
                    {routings.map(r => (
                      <option key={r.id} value={r.id}>{r.id} - {r.routingName}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Results visualization */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Bottleneck Warning Flag */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xs font-sans ${bottleneckData.warningLevel === 'critical' ? 'bg-red-50 border-red-200 text-red-950' : (bottleneckData.warningLevel === 'moderate' ? 'bg-yellow-50 border-yellow-200 text-yellow-950' : 'bg-emerald-50 border-emerald-200 text-emerald-950')}`}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: bottleneckData.warningLevel === 'critical' ? '#fee2e2' : (bottleneckData.warningLevel === 'moderate' ? '#fef3c7' : '#d1fae5') }}>
                  {bottleneckData.warningLevel === 'critical' ? (
                    <AlertTriangle className="w-5 h-5 text-red-650" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-650" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider leading-none mb-1">Bottleneck Analysis Feedback</h4>
                  {bottleneckData.warningLevel === 'critical' ? (
                    <p className="text-[11px] text-red-800 leading-snug">
                      ⚠️ **Critical Capacity Gap Detected:** High operating load constraints. Frying machine utilization is estimated to reach **{bottleneckData.fryingUtilization.toFixed(1)}%**.
                    </p>
                  ) : (
                    <p className="text-[11px] text-emerald-800 leading-snug">
                      ✅ **All processes are within functional bounds:** Current routing parameters are properly optimized. Available time windows easily absorb target outputs.
                    </p>
                  )}
                </div>
              </div>

              {/* Progress bars of stage capacities */}
              <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Utilization per process stage (% standard capacity limits)</span>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Mechanical Peeling Preparation Load</span>
                      <span className="font-mono">{bottleneckData.staffUtilization.toFixed(1)} %</span>
                    </div>
                    <div className="w-full bg-slate-150 h-3 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${bottleneckData.staffUtilization > 100 ? 'bg-red-500' : 'bg-indigo-600'}`} style={{ width: `${Math.min(bottleneckData.staffUtilization, 100)}%` }}></div>
                    </div>
                    <span className="text-[9.5px] text-slate-400 font-mono block">Estimated effort required: {Math.round(bottleneckData.requiredPeelingTime)} Minutes work</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Vacuum Frying Burner Core Load</span>
                      <span className="font-mono">{bottleneckData.fryingUtilization.toFixed(1)} %</span>
                    </div>
                    <div className="w-full bg-slate-150 h-3 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${bottleneckData.fryingUtilization > 100 ? 'bg-red-500' : (bottleneckData.fryingUtilization > 80 ? 'bg-yellow-500' : 'bg-indigo-600')}`} style={{ width: `${Math.min(bottleneckData.fryingUtilization, 100)}%` }}></div>
                    </div>
                    <span className="text-[9.5px] text-slate-400 font-mono block">Estimated frying rounds: {bottleneckData.requiredFryingBatchCount} batches ({bottleneckData.totalRequiredFryingMinutes} mins cycle time)</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 5: LABOR PRODUCTIVITY & PAYROLL INTEGRATION */}
      {activeTab === 'productivity' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fade-in" id="labor-productivity-tab">
          <div>
            <h3 className="text-base font-black uppercase text-slate-800 font-display">Labor Productivity &amp; Payroll Engine</h3>
            <p className="text-slate-400 text-xs font-medium">Verify individual actual output volume against cycle standards to direct automated piecework calculations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Quick Helper guidelines */}
            <div className="md:col-span-1 p-5 rounded-2xl bg-indigo-950 text-white flex flex-col justify-between">
              <div className="space-y-3">
                <span className="bg-indigo-805 text-white bg-indigo-505/20 border border-indigo-400/20 px-2 py-0.5 rounded text-[9px] uppercase font-bold inline-block">Wage formula settings</span>
                <h4 className="text-sm font-black font-display italic leading-snug">Piece-Performance Hybrid Payroll</h4>
                <p className="text-[11px] text-indigo-200 leading-relaxed">
                  Agridea payroll calculates basic work hours standard wage, and then injects custom bonus payouts direct proportional to output volume processed (Kg/person/day) exceeding the routing standards.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-[10.5px] font-mono leading-relaxed mt-4">
                <strong>Standard Peeling standard:</strong><br />
                - 75 Kg / Person / Day (8 shift hours)<br />
                - Standard Piece bonus: Rp 1,500 / Kg processed.
              </div>
            </div>

            {/* Workers output comparison list */}
            <div className="md:col-span-2 space-y-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Individual Worker performance trace (This week shift)</span>

              <div className="space-y-2.5">
                {workerPerformanceStats.map((wk, i) => {
                  const isAbove = wk.status === 'Above Standard';
                  return (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono">
                      <div className="space-y-1">
                        <strong className="text-indigo-950 block text-sm">{wk.workerName}</strong>
                        <span className="text-slate-400 block font-sans text-[10px] uppercase font-bold">{wk.role} • Stage: {wk.stage}</span>
                      </div>

                      <div className="text-left font-sans sm:text-right space-y-1">
                        <div className="flex items-center gap-1 sm:justify-end text-xs">
                          <span className="text-slate-500 font-bold">Actual:</span>
                          <span className="text-slate-800 font-mono font-black">{wk.qtyProcessedKg} Kg</span>
                          <span className={`text-[9.5px] rounded-md px-1.5 py-0.5 border font-extrabold uppercase ${isAbove ? 'bg-emerald-100 text-emerald-800 border-emerald-250' : 'text-red-750 bg-red-50 border-red-200'}`}>
                            {wk.variancePercent > 0 ? `+${wk.variancePercent}` : wk.variancePercent}%
                          </span>
                        </div>
                        <span className="text-slate-400 block text-[10px]/ leading-none font-sans font-medium">Standard Target is {wk.expectedStandard}Kg</span>
                      </div>

                      {/* Payroll output value */}
                      <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4 text-left sm:text-right">
                        <span className="text-slate-400 text-[9px] uppercase font-bold font-sans block">Calculated Salary</span>
                        <strong className="text-indigo-900 text-lg">Rp {Math.round(wk.totalWage).toLocaleString()}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 6: ROUTING DESIGN COSTING BREAKDOWN */}
      {activeTab === 'costing' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fade-in" id="routing-costing-tab">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-base font-black uppercase text-slate-800 font-display">Routing Costing Control</h3>
              <p className="text-slate-400 text-xs font-medium">Identify individual processes resource expenditure in terms of minutes processed labor, heating dynamic utilities, and machine wear.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold">Target scale:</span>
              <input
                type="number"
                value={calculatorTargetOutput}
                onChange={(e) => setCalculatorTargetOutput(Number(e.target.value))}
                className="w-20 bg-slate-55 border border-slate-200 rounded p-1 text-center font-mono text-xs"
              />
              <span className="text-xs text-slate-500 font-bold">Kg target output</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            
            {/* Left overview */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl md:col-span-1 space-y-4 leading-none">
              <span className="text-[10px] text-indigo-900 font-bold font-sans block uppercase tracking-wider">Accumulated routing costs Standard</span>
              
              <div className="space-y-3.5 text-slate-800 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Labor expense:</span>
                  <strong className="text-indigo-950">Rp {Math.round(costingBreakdown.totalLaborCost).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Mechanical Machine parts:</span>
                  <strong className="text-indigo-950">Rp {Math.round(costingBreakdown.totalMachineCost).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-slate-400 font-sans">Utility boiler power draw:</span>
                  <strong className="text-indigo-950">Rp {Math.round(costingBreakdown.totalUtilityCost).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-base border-t pt-3">
                  <span className="text-indigo-950 font-sans font-black">Route Cost standard:</span>
                  <strong className="text-emerald-700 font-black">Rp {Math.round(costingBreakdown.overallRouteCost).toLocaleString()}</strong>
                </div>
              </div>

              <div className="p-3 bg-indigo-950 text-white rounded-xl text-[10px] leading-relaxed font-sans">
                💡 **Costing calculation index:** Average Standard Labor rate mapped at **Rp 150/minute/man**, Boiler standard utility at **Rp 400/minute** with frying thermal factor multiplier.
              </div>
            </div>

            {/* Costing graph visual */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 space-y-4 font-sans">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Process cost comparison standards (Rp scale per step)</span>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processCostComparisonData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="Labor" fill="#4f46e5" stackId="a" />
                    <Bar dataKey="Machine" fill="#f97316" stackId="a" />
                    <Bar dataKey="Utility" fill="#10b981" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 7: MACHINE HEALTH & OEE METRICS DETAILS */}
      {activeTab === 'oee-metrics' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fade-in" id="machine-oee-tab">
          <div>
            <h3 className="text-base font-black uppercase text-slate-800 font-display">OEE Audit Logs &amp; Maintenance Status</h3>
            <p className="text-slate-400 text-xs font-medium">Evaluate mechanical availability speed constraints against global standard thresholds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-emerald-250 bg-emerald-50/40 text-emerald-900 text-center leading-none">
              <span className="text-[10px] uppercase font-black block text-emerald-800 mb-1 leading-none">World Class Scale</span>
              <strong className="text-2xl font-mono block font-black border-slate-100 pb-2 mb-2 border-b">OEE ≥ 85%</strong>
              <span className="text-[10.5px] font-sans">Optimized target level achieved. Zero constraints.</span>
            </div>
            <div className="p-4 rounded-xl border border-blue-250 bg-blue-50/40 text-blue-900 text-center">
              <span className="text-[10px] uppercase font-black block text-blue-800 mb-1 leading-none">Good Target level</span>
              <strong className="text-2xl font-mono block font-black border-slate-100 pb-2 mb-2 border-b">75% - 84%</strong>
              <span className="text-[10.5px] font-sans">Acceptable range. Standard maintenance scheduled.</span>
            </div>
            <div className="p-4 rounded-xl border border-yellow-250 bg-yellow-50/40 text-yellow-900 text-center">
              <span className="text-[10px] uppercase font-black block text-yellow-800 mb-1 leading-none">Fair Level Limit</span>
              <strong className="text-2xl font-mono block font-black border-slate-100 pb-2 mb-2 border-b">60% - 74%</strong>
              <span className="text-[10.5px] font-sans">Action plan required. Minor mechanical speeds delay.</span>
            </div>
            <div className="p-4 rounded-xl border border-red-250 bg-red-50/40 text-red-900 text-center">
              <span className="text-[10px] uppercase font-black block text-red-850 mb-1 leading-none">Poor Constraints</span>
              <strong className="text-2xl font-mono block font-black border-slate-100 pb-2 mb-2 border-b">OEE &lt; 60%</strong>
              <span className="text-[10.5px] font-sans">Severe bottleneck constraint. Main component replacement.</span>
            </div>
          </div>

          {/* Table display */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="p-4 bg-slate-50 border-b">
              <span className="text-slate-700 font-extrabold uppercase text-[10px]">Active machine logs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 font-black border-b text-[10.5px] uppercase font-sans">
                    <th className="p-3">Machine name / ID</th>
                    <th className="p-3">Operating time</th>
                    <th className="p-3">Idle time</th>
                    <th className="p-3">Downtime</th>
                    <th className="p-3">Planned time</th>
                    <th className="p-3">Audit metrics (Availability)</th>
                    <th className="p-3">QC Quality</th>
                    <th className="p-3">Aggregate OEE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {oeeMetrics.map((machine, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 font-sans font-black text-slate-800">{machine.name} <br /><span className="text-[9.5px] text-slate-400 font-mono font-bold">ID: {machine.id}</span></td>
                      <td className="p-3">{machine.operatingTimeMins} Mins</td>
                      <td className="p-3">{machine.idleTimeMins} Mins</td>
                      <td className="p-3 text-red-650">{machine.downtimeMins} Mins</td>
                      <td className="p-3">{machine.plannedMins} Mins</td>
                      <td className="p-3 text-indigo-700 font-black">{machine.availability.toFixed(1)}%</td>
                      <td className="p-3">{machine.quality.toFixed(1)}%</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full font-black text-[9.5px] border uppercase ${machine.classStyle}`}>
                          {machine.oeePercent.toFixed(1)}% {machine.classLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
