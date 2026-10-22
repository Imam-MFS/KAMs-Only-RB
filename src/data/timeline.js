// Timeline specifications: 33 Historical Months + Live MTD + Running cycles

export const HISTORICAL_MONTHS = [
  "Jan'24", "Feb'24", "Mar'24", "Apr'24", "May'24", "Jun'24",
  "Jul'24", "Aug'24", "Sep'24", "Oct'24", "Nov'24", "Dec'24",
  "Jan'25", "Feb'25", "Mar'25", "Apr'25", "May'25", "Jun'25",
  "Jul'25", "Aug'25", "Sep'25", "Oct'25", "Nov'25", "Dec'25",
  "Jan'26", "Feb'26", "Mar'26", "Apr'26", "May'26", "Jun'26",
  "Jul'26", "Aug'26", "Sep'26"
];

export const QUARTERS = {
  "Q4'26 (Running Quarter)": ["OCT_2026_MTD"],
  "Q3'26": ["Jul'26", "Aug'26", "Sep'26"],
  "Q2'26": ["Apr'26", "May'26", "Jun'26"],
  "Q1'26": ["Jan'26", "Feb'26", "Mar'26"],
  "Q4'25": ["Oct'25", "Nov'25", "Dec'25"],
  "Q3'25": ["Jul'25", "Aug'25", "Sep'25"],
  "Q2'25": ["Apr'25", "May'25", "Jun'25"],
  "Q1'25": ["Jan'25", "Feb'25", "Mar'25"],
  "Q4'24": ["Oct'24", "Nov'24", "Dec'24"],
  "Q3'24": ["Jul'24", "Aug'24", "Sep'24"],
  "Q2'24": ["Apr'24", "May'24", "Jun'24"],
  "Q1'24": ["Jan'24", "Feb'24", "Mar'24"]
};

export const HALF_YEARS = {
  "H2'26 (Running Half)": ["Jul'26", "Aug'26", "Sep'26", "OCT_2026_MTD"],
  "H1'26": ["Jan'26", "Feb'26", "Mar'26", "Apr'26", "May'26", "Jun'26"],
  "H2'25": ["Jul'25", "Aug'25", "Sep'25", "Oct'25", "Nov'25", "Dec'25"],
  "H1'25": ["Jan'25", "Feb'25", "Mar'25", "Apr'25", "May'25", "Jun'25"],
  "H2'24": ["Jul'24", "Aug'24", "Sep'24", "Oct'24", "Nov'24", "Dec'24"],
  "H1'24": ["Jan'24", "Feb'24", "Mar'24", "Apr'24", "May'24", "Jun'24"]
};

export function getMerchantPeriodMetrics(merchant, tfMode, period) {
  if (!merchant) return { pa: 0, pc: 0, cc: 0, health: 'Red' };

  // 1. Live MTD
  if (tfMode === 'MTD') {
    const pa = merchant.mtdPA || 0;
    const pc = merchant.mtdPC || 0;
    const cc = merchant.mtdCC || 0;
    let health = 'Red';
    if (pc >= 35) health = 'Green';
    else if (pc > 0) health = 'Amber';
    return { pa, pc, cc, health };
  }

  // 2. Running Quarter: Q4'26
  if (tfMode === 'QUARTER' && period.startsWith("Q4'26")) {
    const pa = merchant.mtdPA || 0;
    const pc = merchant.mtdPC || 0;
    const cc = merchant.mtdCC || 0;
    let health = 'Red';
    if (pc >= 35) health = 'Green';
    else if (pc > 0) health = 'Amber';
    return { pa, pc, cc, health };
  }

  // 3. Running Half: H2'26
  if (tfMode === 'HALFYEAR' && period.startsWith("H2'26")) {
    let pa = merchant.mtdPA || 0;
    let pc = merchant.mtdPC || 0;
    let cc = merchant.mtdCC || 0;
    ["Jul'26", "Aug'26", "Sep'26"].forEach(mStr => {
      const entry = merchant.history?.[mStr];
      if (entry) {
        pa += entry.pa || 0;
        pc += entry.pc || 0;
        cc += entry.cc || 0;
      }
    });
    let health = pc >= 140 ? 'Green' : (pc > 0 ? 'Amber' : 'Red');
    return { pa, pc, cc, health };
  }

  // 4. Standard Historical Periods
  let targetMonths = [];
  if (tfMode === 'MONTH') {
    targetMonths = [period];
  } else if (tfMode === 'QUARTER') {
    targetMonths = QUARTERS[period] || [];
  } else if (tfMode === 'HALFYEAR') {
    targetMonths = HALF_YEARS[period] || [];
  }

  let pa = 0, pc = 0, cc = 0;
  targetMonths.forEach(mStr => {
    const entry = merchant.history?.[mStr];
    if (entry) {
      pa += entry.pa || 0;
      pc += entry.pc || 0;
      cc += entry.cc || 0;
    }
  });

  const threshold = tfMode === 'HALFYEAR' ? 140 : (tfMode === 'QUARTER' ? 75 : 35);
  let health = 'Red';
  if (pc >= threshold) health = 'Green';
  else if (pc > 0) health = 'Amber';

  return { pa, pc, cc, health };
}
