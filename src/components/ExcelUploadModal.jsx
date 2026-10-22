import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  X,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { normalizeDistrict } from '../utils/formatters';
import { HISTORICAL_MONTHS } from '../data/timeline';

export default function ExcelUploadModal({
  isOpen,
  onClose,
  onDataLoaded,
  onClearData,
  hasData,
  showToast,
  onStartIngestion
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const processWorkbook = (file) => {
    setIsProcessing(true);
    showToast('Parsing bKash Excel workbook...', 'info');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          showToast('The uploaded sheet contains no merchant records!', 'error');
          setIsProcessing(false);
          return;
        }

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

          // Post-Registration Lag Calculation
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

        onDataLoaded(mapped);
        setIsProcessing(false);
        onClose();
        showToast(`Ingested ${mapped.length} merchant accounts successfully!`, 'success');

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error(err);
        showToast('Failed to parse Excel workbook: ' + err.message, 'error');
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (onStartIngestion) {
        onClose();
        onStartIngestion(file);
      } else {
        processWorkbook(file);
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (onStartIngestion) {
        onClose();
        onStartIngestion(file);
      } else {
        processWorkbook(file);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#070A10]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0B0F19] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Upload Regional Sales Sheet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ingest raw monthly bKash Key Accounts workbook (.xlsx / .xls)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer group ${
            isDragging
              ? 'border-[#E2136E] bg-[#E2136E]/10'
              : 'border-slate-300 dark:border-slate-700 hover:border-[#E2136E] dark:hover:border-[#E2136E] bg-slate-50 dark:bg-[#070A10] hover:bg-pink-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileInput}
            className="hidden"
          />
          <UploadCloud className="w-12 h-12 text-slate-400 dark:text-slate-500 group-hover:text-[#E2136E] mx-auto mb-3 transition-colors" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {isProcessing ? 'Processing workbook...' : 'Drop your bKash Excel file here, or click to browse'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Supports wide-format files with 190+ columns (MTD PC, MTD PA, Jan'24-Sep'26, etc.)
          </p>
        </div>

        {/* Details Note */}
        <div className="bg-slate-50 dark:bg-[#070A10] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
          <div className="font-bold text-slate-800 dark:text-slate-200">
            Automated Ingestion Pipeline:
          </div>
          <p className="text-[11px] leading-relaxed">
            • Auto-maps Sales Hierarchy: <code>RB KAM Lead</code>, <code>RB KAM</code>, <code>District</code>, <code>Thana</code>, <code>KAM</code>.<br />
            • Ingests 33 Historical Months + Live Oct'26 MTD logs.<br />
            • Normalizes district variations (e.g. Bogra, BOGRA).
          </p>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-2">
          {hasData ? (
            <button
              onClick={() => {
                onClearData();
                onClose();
              }}
              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Current Records</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400">No demo data loaded</span>
          )}

          <button
            onClick={onClose}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
