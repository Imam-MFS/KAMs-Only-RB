export function formatBDT(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) return 'BDT 0';
  const num = Number(amount);
  if (Math.abs(num) >= 10000000) return 'BDT ' + (num / 10000000).toFixed(2) + ' Cr';
  if (Math.abs(num) >= 100000) return 'BDT ' + (num / 100000).toFixed(2) + ' Lakh';
  if (Math.abs(num) >= 1000) return 'BDT ' + (num / 1000).toFixed(1) + 'K';
  return 'BDT ' + Math.round(num).toLocaleString('en-US');
}

export function formatBDTFull(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) return 'BDT 0';
  return 'BDT ' + Math.round(Number(amount)).toLocaleString('en-US');
}

export function formatNumber(num) {
  return Number(num || 0).toLocaleString('en-US');
}

export function normalizeDistrict(name) {
  if (!name) return 'Dhaka';
  let clean = String(name).trim().toLowerCase();
  return clean.replace(/\b\w/g, l => l.toUpperCase());
}
