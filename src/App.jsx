import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import {
  FileSpreadsheet,
  UploadCloud,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Database
} from 'lucide-react';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ComparisonView from './components/ComparisonView';
import KpiMetricsView from './components/KpiMetricsView';
import SettingsView from './components/SettingsView';
import TimeframeSelector from './components/TimeframeSelector';
import FacetedFilterMatrix, { FILTER_CONFIG } from './components/FacetedFilterMatrix';
import CommandHub from './components/CommandHub';
import KpiScorecard from './components/KpiScorecard';
import AnalyticsCharts from './components/AnalyticsCharts';
import MerchantTable from './components/MerchantTable';
import MerchantDrawer from './components/MerchantDrawer';
import ExcelUploadModal from './components/ExcelUploadModal';
import UploadProgressModal, { INGESTION_STAGES } from './components/UploadProgressModal';
import AuthGate from './components/AuthGate';
import Toast from './components/Toast';

import { getMerchantPeriodMetrics, HISTORICAL_MONTHS } from './data/timeline';
import { normalizeDistrict } from './utils/formatters';
import bkashLogo from './assets/logo.png';

export default function App() {
  // 1. Data Store (STARTS EMPTY - NO DEMO DATA!)
  const [allMerchants, setAllMerchants] = useState(() => {
    try {
      const saved = localStorage.getItem('bkash_portal_merchants');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return []; // No demo data!
  });

  // Save to localStorage when real file is uploaded
  const handleUpdateMerchants = (data) => {
    setAllMerchants(data);
    try {
      if (data && data.length > 0) {
        localStorage.setItem('bkash_portal_merchants', JSON.stringify(data));
      } else {
        localStorage.removeItem('bkash_portal_merchants');
      }
    } catch (e) {
      console.warn('Storage quota exceeded, keeping in memory', e);
    }
    handleResetFilters();
  };

  const handleClearAllData = () => {
    setAllMerchants([]);
    localStorage.removeItem('bkash_portal_merchants');
    handleResetFilters();
    addToast('All merchant data cleared. Ready for fresh sheet upload.', 'info');
  };

  // 1.1 Security Authentication Gate (Password: RBP)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('rbp_authenticated') === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleLockPortal = () => {
    try {
      sessionStorage.removeItem('rbp_authenticated');
    } catch (e) {}
    setIsAuthenticated(false);
    addToast('Portal locked securely.', 'info');
  };

  // 1.2 Sidebar Navigation State: 'dashboard' | 'comparison' | 'settings'
  const [currentView, setCurrentView] = useState('dashboard');

  // 2. Theme State (default dark obsidian)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('portal_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('portal_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('portal_theme', 'light');
    }
  }, [isDark]);

  // 3. Timeframe Engine State
  const [tfMode, setTfMode] = useState('MTD'); // 'MTD' | 'MONTH' | 'QUARTER' | 'HALFYEAR'
  const [period, setPeriod] = useState('Live MTD');

  // 4. Faceted Filters State (8 dimensions)
  const [filters, setFilters] = useState({
    rbKamLead: 'ALL',
    rbKam: 'ALL',
    district: 'ALL',
    thana: 'ALL',
    catLead: 'ALL',
    kam: 'ALL',
    category: 'ALL',
    subCategory: 'ALL'
  });

  // 5. Search Term
  const [searchTerm, setSearchTerm] = useState('');

  // 6. Command Hub Cohorts
  const [healthPreset, setHealthPreset] = useState('ALL');
  const [revenuePreset, setRevenuePreset] = useState('ALL');
  const [onboardingPreset, setOnboardingPreset] = useState('ALL');

  // 7. Modals & Drawer State
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);

  // 8. Gemini API Key
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');

  // 9. Toast State
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Drag and Drop & Ingestion Animation State
  const [isDraggingHero, setIsDraggingHero] = useState(false);
  const [isProcessingHero, setIsProcessingHero] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    isOpen: false,
    progress: 0,
    stageIndex: 0,
    fileName: '',
    fileSize: '',
    recordsCount: 0,
    isComplete: false
  });
  const heroFileInputRef = useRef(null);

  // Section Refs for SaaS Dock Navigation
  const [activeTab, setActiveTab] = useState('overview');
  const overviewRef = useRef(null);
  const filtersRef = useRef(null);
  const analyticsRef = useRef(null);
  const copilotRef = useRef(null);
  const directoryRef = useRef(null);

  const scrollToSection = (tabId) => {
    setActiveTab(tabId);
    const refMap = {
      overview: overviewRef,
      filters: filtersRef,
      analytics: analyticsRef,
      copilot: copilotRef,
      directory: directoryRef
    };

    const targetRef = refMap[tabId];
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper to calculate metrics for current active period
  const getMerchantMetrics = (m) => getMerchantPeriodMetrics(m, tfMode, period);

  // Helper to resolve onboarding drop-off status reliably across raw and ingested sheets
  const getMerchantOnboarding = (m) => {
    // 1. If explicit flags exist
    const hasExplicit = m.noTxn1m !== undefined || m.noTxn3m !== undefined || m.noTxn5m !== undefined;
    const is1m = m.noTxn1m === true || m.noTxn1m === 'Yes' || m.noTxn1m === 1;
    const is3m = m.noTxn3m === true || m.noTxn3m === 'Yes' || m.noTxn3m === 1;
    const is5m = m.noTxn5m === true || m.noTxn5m === 'Yes' || m.noTxn5m === 1;

    if (hasExplicit && (is1m || is3m || is5m)) {
      return {
        is1m,
        is3m,
        is5m,
        isEarlyActive: !is1m && !is3m && !is5m,
        isChronicZero: is1m && is3m && is5m
      };
    }

    // 2. Intelligent fallback from monthly history if flags are empty
    const hist = m.history || {};
    const months = HISTORICAL_MONTHS || [];
    let earlyZeros = 0;

    for (let i = 0; i < Math.min(months.length, 6); i++) {
      const rec = hist[months[i]];
      if (rec && (rec.pc || 0) === 0) {
        earlyZeros++;
      }
    }

    const mtdZero = (m.mtdPC || 0) === 0;
    const fallback1m = is1m || earlyZeros >= 1 || (mtdZero && (m.mtdPA || 0) === 0);
    const fallback3m = is3m || earlyZeros >= 3;
    const fallback5m = is5m || earlyZeros >= 5;
    const isChronicZero = fallback1m && fallback3m && fallback5m;
    const isEarlyActive = !fallback1m && !fallback3m && !fallback5m;

    return {
      is1m: fallback1m,
      is3m: fallback3m,
      is5m: fallback5m,
      isEarlyActive,
      isChronicZero
    };
  };

  // 10. Filter matching logic
  const matchesFilters = (merchant, excludeField = null) => {
    // Dropdowns
    for (const { field } of FILTER_CONFIG) {
      if (field === excludeField) continue;
      const val = filters[field];
      if (val !== 'ALL' && merchant[field] !== val) {
        return false;
      }
    }

    // Search Query
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const matchWallet = (merchant.wallet || '').toLowerCase().includes(q);
      const matchBrand = (merchant.brand || '').toLowerCase().includes(q);
      const matchMerchant = (merchant.merchant || '').toLowerCase().includes(q);
      const matchThana = (merchant.thana || '').toLowerCase().includes(q);
      const matchDistrict = (merchant.district || '').toLowerCase().includes(q);
      const matchKam = (merchant.kam || '').toLowerCase().includes(q);
      if (!matchWallet && !matchBrand && !matchMerchant && !matchThana && !matchDistrict && !matchKam) {
        return false;
      }
    }

    // Command Hub Presets
    const metrics = getMerchantMetrics(merchant);

    // Health
    if (healthPreset === 'GREEN' && metrics.health !== 'Green') return false;
    if (healthPreset === 'AMBER' && metrics.health !== 'Amber') return false;
    if (healthPreset === 'RED' && metrics.pc > 0) return false;
    if (healthPreset === 'ACTIVE_OUTLETS' && metrics.pc <= 0) return false;
    if (healthPreset === 'NON_TRANSACTING' && metrics.health === 'Green') return false;

    // Revenue
    if (revenuePreset === 'UNDER_25K') {
      if (metrics.pa <= 0 || metrics.pa > 25000) return false;
    } else if (revenuePreset === 'MID_VOL') {
      if (metrics.pa <= 25000 || metrics.pa > 50000) return false;
    } else if (revenuePreset === 'UNDER_50K') {
      if (metrics.pa <= 0 || metrics.pa > 50000) return false;
    } else if (revenuePreset === 'OVER_50K' || revenuePreset === 'ABOVE_50K') {
      if (metrics.pa <= 50000) return false;
    } else if (revenuePreset === 'ACTIVE_VOL') {
      if (metrics.pa <= 0) return false;
    } else if (revenuePreset === 'ZERO_VOL' || revenuePreset === 'ZERO_PA') {
      if (metrics.pa > 0) return false;
    }

    // Onboarding status evaluation
    const obStatus = getMerchantOnboarding(merchant);
    if (onboardingPreset === 'EARLY_ACTIVE' && !obStatus.isEarlyActive) return false;
    if ((onboardingPreset === 'NO_TRX_1M' || onboardingPreset === 'DROP_1M') && !obStatus.is1m) return false;
    if ((onboardingPreset === 'NO_TRX_3M' || onboardingPreset === 'DROP_3M') && !obStatus.is3m) return false;
    if ((onboardingPreset === 'NO_TRX_5M' || onboardingPreset === 'DROP_5M') && !obStatus.is5m) return false;
    if (onboardingPreset === 'CHRONIC_ZERO' && !obStatus.isChronicZero) return false;

    return true;
  };

  // 11. Calculate Interdependent Faceted Dropdown Options
  const facetedOptions = useMemo(() => {
    const result = {};

    FILTER_CONFIG.forEach(({ field }) => {
      const matching = allMerchants.filter((m) => matchesFilters(m, field));
      const countsMap = {};

      matching.forEach((m) => {
        const val = m[field];
        if (val) {
          countsMap[val] = (countsMap[val] || 0) + 1;
        }
      });

      result[field] = Object.keys(countsMap)
        .sort()
        .map((val) => ({ val, count: countsMap[val] }));
    });

    return result;
  }, [allMerchants, filters, searchTerm, healthPreset, revenuePreset, onboardingPreset, tfMode, period]);

  // 12. Filtered Merchants slice
  const filteredMerchants = useMemo(() => {
    return allMerchants.filter((m) => matchesFilters(m, null));
  }, [allMerchants, filters, searchTerm, healthPreset, revenuePreset, onboardingPreset, tfMode, period]);

  // 13. Command Hub Cohort Live Counts
  const cohortCounts = useMemo(() => {
    const base = allMerchants.filter((m) => {
      for (const { field } of FILTER_CONFIG) {
        const val = filters[field];
        if (val !== 'ALL' && m[field] !== val) return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchWallet = (m.wallet || '').toLowerCase().includes(q);
        const matchBrand = (m.brand || '').toLowerCase().includes(q);
        const matchMerchant = (m.merchant || '').toLowerCase().includes(q);
        const matchThana = (m.thana || '').toLowerCase().includes(q);
        const matchDistrict = (m.district || '').toLowerCase().includes(q);
        const matchKam = (m.kam || '').toLowerCase().includes(q);
        if (!matchWallet && !matchBrand && !matchMerchant && !matchThana && !matchDistrict && !matchKam) {
          return false;
        }
      }
      return true;
    });

    let hAll = base.length, hGreen = 0, hAmber = 0, hRed = 0, hActive = 0, hNonTrx = 0;
    let rAll = base.length, rUnder25 = 0, rMidVol = 0, rUnder50 = 0, rOver50 = 0, rZero = 0, rActiveVol = 0;
    let oAll = base.length, oEarlyActive = 0, o1m = 0, o3m = 0, o5m = 0, oChronicZero = 0;

    base.forEach((m) => {
      const met = getMerchantPeriodMetrics(m, tfMode, period);
      if (met.health === 'Green') hGreen++;
      if (met.health === 'Amber') hAmber++;
      if (met.pc === 0) hRed++;
      if (met.pc > 0) hActive++;
      if (met.health !== 'Green') hNonTrx++;

      if (met.pa > 50000) rOver50++;
      if (met.pa > 25000 && met.pa <= 50000) rMidVol++;
      if (met.pa > 0 && met.pa <= 50000) rUnder50++;
      if (met.pa > 0 && met.pa <= 25000) rUnder25++;
      if (met.pa > 0) rActiveVol++;
      if (met.pa === 0) rZero++;

      const ob = getMerchantOnboarding(m);
      if (ob.isEarlyActive) oEarlyActive++;
      if (ob.is1m) o1m++;
      if (ob.is3m) o3m++;
      if (ob.is5m) o5m++;
      if (ob.isChronicZero) oChronicZero++;
    });

    return {
      // Health
      hAll,
      hGreen,
      hAmber,
      hRed,
      hActive,
      hNonTrx,

      // Revenue
      rAll,
      rOver50,
      rAbove50k: rOver50,
      rMidVol,
      rUnder50,
      rUnder50k: rUnder50,
      rUnder25,
      rUnder25k: rUnder25,
      rActiveVol,
      rZero,
      rZeroPA: rZero,

      // Onboarding
      oAll,
      oEarlyActive,
      o1m,
      oDrop1m: o1m,
      o3m,
      oDrop3m: o3m,
      o5m,
      oDrop5m: o5m,
      oChronicZero
    };
  }, [allMerchants, filters, searchTerm, tfMode, period]);

  // 14. Aggregate KPIs
  const kpis = useMemo(() => {
    let totalPA = 0;
    let totalPC = 0;
    let activeCount = 0;
    let redCount = 0;

    filteredMerchants.forEach((m) => {
      const met = getMerchantPeriodMetrics(m, tfMode, period);
      totalPA += met.pa;
      totalPC += met.pc;
      if (met.pc > 0) activeCount++;
      if (met.health === 'Red') redCount++;
    });

    const totalOutlets = filteredMerchants.length;
    const aov = totalPC > 0 ? totalPA / totalPC : 0;

    return { totalPA, totalPC, activeCount, redCount, totalOutlets, aov };
  }, [filteredMerchants, tfMode, period]);

  const timeframeLabel = useMemo(() => {
    if (tfMode === 'MTD') return 'Live MTD (Oct 2026)';
    return period;
  }, [tfMode, period]);

  const hasActiveFilters = useMemo(() => {
    const hasDropdown = Object.values(filters).some((v) => v !== 'ALL');
    const hasSearch = Boolean(searchTerm.trim());
    const hasCohort =
      healthPreset !== 'ALL' || revenuePreset !== 'ALL' || onboardingPreset !== 'ALL';
    return hasDropdown || hasSearch || hasCohort;
  }, [filters, searchTerm, healthPreset, revenuePreset, onboardingPreset]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      rbKamLead: 'ALL',
      rbKam: 'ALL',
      district: 'ALL',
      thana: 'ALL',
      catLead: 'ALL',
      kam: 'ALL',
      category: 'ALL',
      subCategory: 'ALL'
    });
    setSearchTerm('');
    setHealthPreset('ALL');
    setRevenuePreset('ALL');
    setOnboardingPreset('ALL');
    addToast('All territory and hierarchy filters reset', 'info');
  };

  const handleExportCsv = () => {
    if (filteredMerchants.length === 0) {
      addToast('No merchants to export!', 'warning');
      return;
    }

    const cleanTf = timeframeLabel.replace(/[^a-zA-Z0-9_]/g, '_');
    const rows = filteredMerchants.map((m) => {
      const met = getMerchantPeriodMetrics(m, tfMode, period);
      return {
        'Wallet No': m.wallet,
        'Brand Name': m.brand,
        'Merchant Name': m.merchant,
        'District': m.district,
        'Thana': m.thana,
        'Category': m.category,
        'Sub Category': m.subCategory,
        'RB KAM Lead': m.rbKamLead,
        'RB KAM': m.rbKam,
        'Category Lead': m.catLead,
        'Key Account Manager': m.kam,
        'Period Volume (PA BDT)': met.pa,
        'Period Payments (PC)': met.pc,
        'Period Customers (CC)': met.cc,
        'Health Status': met.health,
        'Registration Date': m.regDate,
        'No Trx Till 1M Reg': m.noTxn1m ? 'Yes' : 'No',
        'No Trx Till 3M Reg': m.noTxn3m ? 'Yes' : 'No',
        'No Trx Till 5M Reg': m.noTxn5m ? 'Yes' : 'No'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Territory Sales');
    XLSX.writeFile(workbook, `Regional_Business_Portal_${cleanTf}_Export.xlsx`);
    addToast(`Exported ${filteredMerchants.length} merchants to Excel!`, 'success');
  };

  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    if (newKey) {
      localStorage.setItem('gemini_api_key', newKey);
      addToast('Google AI Studio Gemini API Key saved!', 'success');
    } else {
      localStorage.removeItem('gemini_api_key');
      addToast('Gemini API key removed', 'info');
    }
  };

  const handleClearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('gemini_api_key');
    addToast('API key cleared', 'info');
  };

  // Direct workbook parser with multi-stage loading animation
  const handleStartIngestion = (file) => {
    if (!file) return;

    const formattedSize = file.size > 1024 * 1024
      ? (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      : (file.size / 1024).toFixed(1) + ' KB';

    setIsProcessingHero(true);
    setUploadProgress({
      isOpen: true,
      progress: 12,
      stageIndex: 0,
      fileName: file.name,
      fileSize: formattedSize,
      recordsCount: 0,
      isComplete: false
    });

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // Stage 0: Reading binary stream
        setUploadProgress((prev) => ({ ...prev, progress: 28, stageIndex: 0 }));
        await new Promise((r) => setTimeout(r, 350));

        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          addToast('Uploaded sheet contains no data rows!', 'error');
          setUploadProgress((prev) => ({ ...prev, isOpen: false }));
          setIsProcessingHero(false);
          return;
        }

        // Stage 1: Extracting 190+ columns & Sales Hierarchy
        setUploadProgress((prev) => ({
          ...prev,
          progress: 54,
          stageIndex: 1,
          recordsCount: rawRows.length
        }));
        await new Promise((r) => setTimeout(r, 450));

        const mapped = rawRows.map((row, index) => {
          const findCol = (aliases) => {
            for (const alias of aliases) {
              const foundKey = Object.keys(row).find(
                (k) => k.trim().toLowerCase() === alias.toLowerCase()
              );
              if (foundKey && row[foundKey] !== undefined) return row[foundKey];
            }
            return '';
          };

          const wallet = findCol(['wallet no', 'wallet', 'wallet_no', 'account no', 'merchant wallet']);
          const brand = findCol(['brand name', 'brand', 'brand_name']);
          const merchant = findCol(['merchant name', 'outlet name', 'branch name', 'brand name']);
          const district = normalizeDistrict(findCol(['present district', 'district', 'division', 'region']));
          const thana = findCol(['present thana', 'thana', 'area', 'sub-district']);
          const category = findCol(['category', 'commercial category', 'industry']);
          const subCategory = findCol(['sub category', 'sub-category', 'subcategory', 'sub unit']);
          const kam = findCol(['key account manager', 'kam', 'kam name', 'account manager']);
          const catLead = findCol(['category lead', 'cat lead', 'lead name', 'vertical head']);
          const rbKam = findCol(['rb kam', 'rb_kam', 'regional kam', 'field kam']);
          const rbKamLead = findCol(['rb kam lead', 'rb lead', 'rb_kam_lead', 'regional lead']);
          const regDate = findCol(['registration date', 'reg date', 'reg_date', 'date of registration']) || '2024-01-01';

          const mtdPC = parseFloat(findCol(['mtd pc', 'pc', 'payment count', 'trx count', 'total pc'])) || 0;
          const mtdPA = parseFloat(findCol(['mtd pa', 'pa', 'payment amount', 'gross volume', 'total pa'])) || 0;
          const mtdCC = parseFloat(findCol(['mtd cc', 'cc', 'customer count', 'unique customer'])) || Math.floor(mtdPC * 0.85);

          const monthlyHistory = {};
          HISTORICAL_MONTHS.forEach((mStr) => {
            const pcVal = parseFloat(findCol([`${mStr} PC`, `${mStr}_PC`, `${mStr} pc`])) || 0;
            const paVal = parseFloat(findCol([`${mStr} PA`, `${mStr}_PA`, `${mStr} pa`])) || 0;
            const ccVal = parseFloat(findCol([`${mStr} CC`, `${mStr}_CC`, `${mStr} cc`])) || Math.floor(pcVal * 0.85);
            monthlyHistory[mStr] = { pc: pcVal, pa: paVal, cc: ccVal };
          });

          let noTxn1m = false;
          let noTxn3m = false;
          let noTxn5m = false;

          const regParsed = new Date(regDate);
          if (!isNaN(regParsed.getTime())) {
            const regYr = regParsed.getFullYear();
            const regMo = regParsed.getMonth() + 1;
            const regIdx = HISTORICAL_MONTHS.findIndex((mStr) => {
              const [mName, mYr] = mStr.split("'");
              return 2000 + parseInt(mYr) === regYr && ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(mName) + 1 === regMo;
            });

            if (regIdx !== -1) {
              const m1 = HISTORICAL_MONTHS[regIdx + 1];
              if (m1 && monthlyHistory[m1]?.pc === 0) noTxn1m = true;

              const m2 = HISTORICAL_MONTHS[regIdx + 2];
              const m3 = HISTORICAL_MONTHS[regIdx + 3];
              if (noTxn1m && m2 && monthlyHistory[m2]?.pc === 0 && m3 && monthlyHistory[m3]?.pc === 0) noTxn3m = true;

              const m4 = HISTORICAL_MONTHS[regIdx + 4];
              const m5 = HISTORICAL_MONTHS[regIdx + 5];
              if (noTxn3m && m4 && monthlyHistory[m4]?.pc === 0 && m5 && monthlyHistory[m5]?.pc === 0) noTxn5m = true;
            }
          }

          return {
            id: `row_${index}`,
            wallet: String(wallet || '01700000000'),
            brand: String(brand || merchant || 'Retail Outlet'),
            merchant: String(merchant || brand || 'Branch'),
            district: district || 'Dhaka',
            thana: String(thana || 'Central'),
            category: String(category || 'General'),
            subCategory: String(subCategory || 'Retail'),
            kam: String(kam || 'Key Accounts Team'),
            catLead: String(catLead || 'Commercial Lead'),
            rbKam: String(rbKam || 'Regional Officer'),
            rbKamLead: String(rbKamLead || 'Regional Head'),
            regDate: String(regDate).slice(0, 10),
            history: monthlyHistory,
            mtdPC,
            mtdPA,
            mtdCC,
            noTxn1m,
            noTxn3m,
            noTxn5m
          };
        });

        // Stage 2: Indexing 33-Month Historical Trends
        setUploadProgress((prev) => ({ ...prev, progress: 80, stageIndex: 2 }));
        await new Promise((r) => setTimeout(r, 450));

        // Stage 3: Calibrating Health Cohorts & AI Engine
        setUploadProgress((prev) => ({ ...prev, progress: 95, stageIndex: 3 }));
        await new Promise((r) => setTimeout(r, 450));

        // Stage 4: Completed
        setUploadProgress((prev) => ({
          ...prev,
          progress: 100,
          stageIndex: 3,
          isComplete: true
        }));

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });

        await new Promise((r) => setTimeout(r, 650));

        handleUpdateMerchants(mapped);
        setUploadProgress((prev) => ({ ...prev, isOpen: false, isComplete: false }));
        setIsProcessingHero(false);
        setIsUploadOpen(false);
        addToast(`Successfully ingested ${mapped.length} merchant accounts!`, 'success');

      } catch (err) {
        console.error(err);
        addToast('Failed to parse Excel workbook: ' + err.message, 'error');
        setUploadProgress((prev) => ({ ...prev, isOpen: false, isComplete: false }));
        setIsProcessingHero(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  if (!isAuthenticated) {
    return <AuthGate onAuthenticated={() => setIsAuthenticated(true)} isDark={isDark} />;
  }

  return (
    <div className="relative min-h-screen flex bg-[#F8FAFC] dark:bg-[#060810] text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden selection:bg-[#E2136E] selection:text-white">
      
      {/* Aurora Ambient Mesh Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full mesh-glow-1 blur-[120px] dark:opacity-40 opacity-20" />
        <div className="absolute top-1/3 -right-32 w-[550px] h-[550px] rounded-full mesh-glow-2 blur-[130px] dark:opacity-35 opacity-20" />
        <div className="absolute bottom-1/4 -left-32 w-[500px] h-[500px] rounded-full mesh-glow-3 blur-[120px] dark:opacity-30 opacity-15" />
        <div className="absolute -bottom-32 right-1/3 w-[650px] h-[650px] rounded-full mesh-glow-4 blur-[140px] dark:opacity-25 opacity-15" />
      </div>

      {/* 0. Left Floating Luxury Sidebar */}
      <Sidebar
        activeNav={currentView}
        onSelectNav={setCurrentView}
        onLockPortal={handleLockPortal}
        merchantCount={allMerchants.length}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
      />

      {/* Main Flow Right Container */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0 min-h-screen">
        {/* 1. SaaS Glassmorphism Header */}
        <Header
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          onOpenUpload={() => setIsUploadOpen(true)}
          timeframeLabel={timeframeLabel}
          scopeCount={filteredMerchants.length}
          totalCount={allMerchants.length}
          onExportCsv={handleExportCsv}
          activeTab={activeTab}
          onSelectTab={scrollToSection}
          onLockPortal={handleLockPortal}
        />

        {/* 2. Main SaaS Dashboard Workspace */}
        <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 w-full space-y-6">
          {currentView === 'comparison' ? (
            <ComparisonView allMerchants={allMerchants} isDark={isDark} />
          ) : currentView === 'kpi' ? (
            <KpiMetricsView allMerchants={allMerchants} isDark={isDark} />
          ) : currentView === 'settings' ? (
            <SettingsView
              isDark={isDark}
              onToggleTheme={() => setIsDark((prev) => !prev)}
              merchantCount={allMerchants.length}
              onClearData={handleClearAllData}
              onLockPortal={handleLockPortal}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          ) : allMerchants.length === 0 ? (
            <div className="py-8 sm:py-12 space-y-6 max-w-4xl mx-auto">
              
              <div className="glass-panel-elevated rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden border border-white/20 shadow-2xl">
                <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#E2136E]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={bkashLogo}
                      alt="bKash"
                      className="w-16 h-16 object-contain drop-shadow-[0_6px_20px_rgba(226,19,110,0.5)] transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      Ready for Live Territory Ingestion
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto mt-2 leading-relaxed">
                      Zero demo records loaded. Ingest your bKash Key Accounts regional sales workbook (<code className="bg-white/40 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono font-bold text-[#E2136E] dark:text-pink-300">.xlsx / .xls</code>) to activate live faceted filtering, cohort intelligence, and AI strategy directives.
                    </p>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingHero(true);
                    }}
                    onDragLeave={() => setIsDraggingHero(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingHero(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleStartIngestion(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => heroFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition cursor-pointer group ${
                      isDraggingHero
                        ? 'border-[#E2136E] bg-[#E2136E]/15'
                        : uploadProgress.isOpen
                        ? 'border-[#E2136E] bg-[#E2136E]/10 animate-pulse'
                        : 'border-slate-300 dark:border-white/20 hover:border-[#E2136E] dark:hover:border-[#E2136E] bg-white/40 dark:bg-black/30 hover:bg-[#E2136E]/5'
                    }`}
                  >
                    <input
                      ref={heroFileInputRef}
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleStartIngestion(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    {uploadProgress.isOpen ? (
                      <div className="py-2 space-y-3">
                        <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#E2136E] animate-spin" />
                          <div className="absolute inset-1.5 rounded-full border border-sky-400 border-t-transparent animate-spin" style={{ animationDirection: 'reverse' }} />
                          <img
                            src={bkashLogo}
                            alt="bKash"
                            className="w-8 h-8 object-contain drop-shadow-[0_2px_8px_rgba(226,19,110,0.5)]"
                          />
                        </div>
                        <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                          {INGESTION_STAGES[uploadProgress.stageIndex]?.title || 'Processing Excel Sheet...'}
                        </p>
                        <p className="text-xs text-[#E2136E] dark:text-pink-400 font-semibold font-mono animate-pulse">
                          {uploadProgress.fileName} • {Math.round(uploadProgress.progress)}% complete
                        </p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-14 h-14 text-slate-400 dark:text-slate-500 group-hover:text-[#E2136E] mx-auto mb-3 transition-colors" />
                        <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                          Drop your bKash Excel file here, or click to browse
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Direct ingestion supporting 190+ columns (MTD PA/PC, Jan'24-Sep'26 logs, Hierarchy)
                        </p>
                      </>
                    )}
                  </div>

                  {/* Capabilities Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-left">
                    <div className="glass-card p-3.5 rounded-xl space-y-1">
                      <div className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Sales Hierarchy</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Auto-extracts RB KAM Lead, RB KAM, District, Thana & KAM.
                      </p>
                    </div>

                    <div className="glass-card p-3.5 rounded-xl space-y-1">
                      <div className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>33-Month History</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Ingests Jan'24 to Sep'26 trends + Live Oct'26 MTD actuals.
                      </p>
                    </div>

                    <div className="glass-card p-3.5 rounded-xl space-y-1">
                      <div className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Zero Cloud Upload</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        100% private in-browser parsing. Data never leaves device.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {/* 1. Integrated Executive Control & Operating HUD */}
              <div ref={overviewRef}>
                <TimeframeSelector
                  tfMode={tfMode}
                  setTfMode={setTfMode}
                  period={period}
                  setPeriod={setPeriod}
                  activePeriodLabel={timeframeLabel}
                  totalCount={allMerchants.length}
                  onClearData={handleClearAllData}
                />
              </div>

              {/* 2. Executive KPI Scorecard (Prioritized at top for instant executive intelligence) */}
              <KpiScorecard
                totalPA={kpis.totalPA}
                totalPC={kpis.totalPC}
                activeCount={kpis.activeCount}
                totalOutlets={kpis.totalOutlets}
                redCount={kpis.redCount}
                aov={kpis.aov}
                periodSubtitle={timeframeLabel}
              />

              {/* 3. Executive Lifecycle & Velocity Cohorts */}
              <div ref={filtersRef} className="space-y-4">
                <CommandHub
                  healthPreset={healthPreset}
                  setHealthPreset={setHealthPreset}
                  revenuePreset={revenuePreset}
                  setRevenuePreset={setRevenuePreset}
                  onboardingPreset={onboardingPreset}
                  setOnboardingPreset={setOnboardingPreset}
                  counts={cohortCounts}
                />

                {/* 4. Territory & Hierarchy Faceted Filter Matrix */}
                <FacetedFilterMatrix
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  facetedOptions={facetedOptions}
                  matchingCount={filteredMerchants.length}
                  onResetFilters={handleResetFilters}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>

              {/* 5. Visual Analytics (Charts) */}
              <div ref={analyticsRef}>
                <AnalyticsCharts
                  filteredMerchants={filteredMerchants}
                  getMerchantMetrics={getMerchantMetrics}
                  isDark={isDark}
                />
              </div>

              {/* 6. Granular Merchant Directory */}
              <div ref={directoryRef}>
                <MerchantTable
                  merchants={filteredMerchants}
                  getMerchantMetrics={getMerchantMetrics}
                  onSelectMerchant={setSelectedMerchant}
                  onExportCsv={handleExportCsv}
                  showToast={addToast}
                />
              </div>
            </div>
          )}

        </main>

        {/* 3. Footer */}
        <footer className="glass-panel border-t border-slate-200/60 dark:border-white/[0.08] py-5 text-xs text-slate-500 dark:text-slate-400 mt-14 transition-colors duration-200">
          <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E2136E] animate-pulse" />
              <span className="font-extrabold text-slate-900 dark:text-white">
                Regional Business Portal
              </span>
              <span>• Territory Sales Management Engine</span>
            </div>
            <div>
              Compatible with <code className="bg-white/40 dark:bg-white/10 px-2 py-0.5 rounded font-mono text-slate-800 dark:text-slate-200 font-bold border border-white/10">Main Sheet.xlsx</code> • Zero Cloud Installation Required
            </div>
          </div>
        </footer>

        {/* 4. Slide-Over Merchant Detail Profile Drawer */}
        <MerchantDrawer
          merchant={selectedMerchant}
          onClose={() => setSelectedMerchant(null)}
          getMerchantMetrics={getMerchantMetrics}
          timeframeLabel={timeframeLabel}
          isDark={isDark}
          showToast={addToast}
        />

        {/* 5. Excel Upload Modal */}
        <ExcelUploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onDataLoaded={handleUpdateMerchants}
          onClearData={handleClearAllData}
          hasData={allMerchants.length > 0}
          showToast={addToast}
          onStartIngestion={handleStartIngestion}
        />

        {/* 5.1 Futuristic Ingestion Progress & Verification Modal */}
        <UploadProgressModal {...uploadProgress} />

        {/* 6. Floating Toasts */}
        <Toast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      </div>

    </div>
  );
}
